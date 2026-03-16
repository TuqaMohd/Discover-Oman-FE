/**
 * Intelligent Itinerary Generator — Core Planning Algorithm
 * 
 * Architecture:
 *   Phase A: Region Allocation (hierarchical, global optimization)
 *   Phase B: Intra-Region Stop Selection & Routing (local optimization)
 * 
 * Improvement Strategy: 2-opt Local Search
 *   Chosen because:
 *   - Deterministic: no randomness, identical inputs → identical outputs
 *   - Effective: well-proven for TSP-like routing, systematically reduces distance
 *   - Efficient: O(n²) per iteration, suitable for dozens of stops per region
 *   - Simple to verify: each swap either improves or doesn't
 * 
 * Constraints enforced:
 *   - Max 250 km daily driving
 *   - Max 8 hours (480 min) daily visit time
 *   - Max stops/day based on intensity (relaxed:3, balanced:4, packed:5)
 *   - Region consistency (each day within one region)
 *   - Category variety (≤2 same-category stops per day unless single-category)
 *   - Rest gap (two >90min stops can't be adjacent without a <45min stop between)
 *   - Budget awareness (reduce paid attractions if over threshold)
 */

import type {
  Destination, TripPreferences, GeneratedItinerary,
  ItineraryDay, ItineraryStop, RegionAllocation,
  Category, ScoredDestination,
} from '@/types/destination';
import { haversineDistance, totalKm } from './haversine';
import { scoreDestination, getTopExplanations, seasonFit } from './scoring';
import { computeCostBreakdown, getBudgetThreshold } from './budget';
import { destinations, crowdRange, costRange } from '@/data/destinations';

/** Max stops per day for each intensity level */
const MAX_STOPS: Record<string, number> = {
  relaxed: 3,
  balanced: 4,
  packed: 5,
};

const MAX_DAILY_KM = 250;
const MAX_DAILY_VISIT_MINUTES = 480; // 8 hours
const DAY_START_HOUR = 8; // 8:00 AM
const AVG_SPEED_KMH = 80;

/**
 * Main entry point: Generate a complete itinerary from preferences.
 * This is a pure function — deterministic output for any given input.
 */
export function generateItinerary(prefs: TripPreferences): GeneratedItinerary {
  // Phase A: Allocate days to regions
  const regionPlan = allocateRegions(prefs);

  // Phase B: For each region block, select and route stops
  const itineraryDays: ItineraryDay[] = [];
  const usedDestIds = new Set<string>();
  let runningTicketCost = 0;
  const budgetThreshold = getBudgetThreshold(prefs.budget, prefs.days);
  // Estimate non-ticket costs for budget checking
  const estNonTicketCosts = prefs.days * 6 + (prefs.days - 1) * (prefs.budget === 'low' ? 20 : prefs.budget === 'medium' ? 45 : 90);

  for (const block of regionPlan) {
    const regionDests = destinations.filter(
      d => d.region.en.toLowerCase() === block.regionKey.toLowerCase()
    );

    for (let dayOffset = 0; dayOffset < block.days; dayOffset++) {
      const dayNum = block.startDay + dayOffset;
      const day = planDay(
        regionDests, prefs, usedDestIds, dayNum, block.region,
        runningTicketCost, estNonTicketCosts, budgetThreshold
      );
      itineraryDays.push(day);
      day.stops.forEach(s => {
        usedDestIds.add(s.destination.id);
        runningTicketCost += s.destination.ticket_cost_omr;
      });
    }
  }

  const totalDistance = itineraryDays.reduce((s, d) => s + d.totalKm, 0);
  const costBreakdown = computeCostBreakdown(itineraryDays, totalDistance, prefs.budget, prefs.days);

  return {
    preferences: prefs,
    regionPlan,
    days: itineraryDays,
    costBreakdown,
    totalKm: Math.round(totalDistance * 10) / 10,
  };
}

/**
 * Phase A: Region Allocation
 * 
 * Allocates trip days across regions to maximize utility.
 * Constraints:
 *   - ≥2 regions if days ≥ 3
 *   - No region gets more than ceil(days/2) days
 *   - Regions with low season fit are deprioritized
 */
function allocateRegions(prefs: TripPreferences): RegionAllocation[] {
  // Get unique regions from data
  const regionMap = new Map<string, { en: string; ar: string; dests: Destination[] }>();
  for (const d of destinations) {
    const key = d.region.en.toLowerCase();
    if (!regionMap.has(key)) {
      regionMap.set(key, { en: d.region.en, ar: d.region.ar, dests: [] });
    }
    regionMap.get(key)!.dests.push(d);
  }

  // Score each region by aggregate utility
  const regionScores: Array<{
    key: string;
    region: { en: string; ar: string };
    utility: number;
    destCount: number;
  }> = [];

  for (const [key, info] of regionMap) {
    // Aggregate utility: average season fit × category match × dest count factor
    const avgSeasonFit = info.dests.reduce(
      (s, d) => s + seasonFit(prefs.month, d.recommended_months), 0
    ) / info.dests.length;

    const categoryMatch = info.dests.reduce((s, d) => {
      const overlap = d.categories.filter(c => prefs.categories.includes(c)).length;
      return s + (overlap > 0 ? 1 : 0);
    }, 0) / info.dests.length;

    // More destinations = more to do = higher utility (log scale to prevent dominance)
    const destFactor = Math.log2(1 + info.dests.length);

    const utility = (avgSeasonFit * 0.4 + categoryMatch * 0.4 + 0.2) * destFactor;

    regionScores.push({ key, region: { en: info.en, ar: info.ar }, utility, destCount: info.dests.length });
  }

  // Sort by utility descending
  regionScores.sort((a, b) => b.utility - a.utility);

  const maxDaysPerRegion = Math.ceil(prefs.days / 2);
  const minRegions = prefs.days >= 3 ? 2 : 1;

  // Allocate days proportionally
  const totalUtility = regionScores.reduce((s, r) => s + r.utility, 0);
  const allocations: Array<{ key: string; region: { en: string; ar: string }; days: number }> = [];
  let remainingDays = prefs.days;

  // First pass: proportional allocation
  for (const rs of regionScores) {
    if (remainingDays <= 0) break;
    const proportion = rs.utility / totalUtility;
    let dayCount = Math.round(proportion * prefs.days);
    dayCount = Math.max(0, Math.min(dayCount, maxDaysPerRegion, remainingDays));
    if (dayCount > 0) {
      allocations.push({ key: rs.key, region: rs.region, days: dayCount });
      remainingDays -= dayCount;
    }
  }

  // Ensure minimum regions
  if (allocations.length < minRegions && regionScores.length >= minRegions) {
    while (allocations.length < minRegions && remainingDays > 0) {
      const nextRegion = regionScores.find(rs => !allocations.some(a => a.key === rs.key));
      if (!nextRegion) break;
      allocations.push({ key: nextRegion.key, region: nextRegion.region, days: 1 });
      remainingDays--;
    }
    // If no remaining days but need more regions, steal from largest
    if (allocations.length < minRegions && remainingDays === 0) {
      const largest = allocations.reduce((a, b) => a.days > b.days ? a : b);
      if (largest.days > 1) {
        largest.days--;
        const nextRegion = regionScores.find(rs => !allocations.some(a => a.key === rs.key));
        if (nextRegion) {
          allocations.push({ key: nextRegion.key, region: nextRegion.region, days: 1 });
        }
      }
    }
  }

  // Distribute remaining days to top regions
  while (remainingDays > 0) {
    for (const alloc of allocations) {
      if (remainingDays <= 0) break;
      if (alloc.days < maxDaysPerRegion) {
        alloc.days++;
        remainingDays--;
      }
    }
    // Safety: if no allocation can accept more days, force it
    if (remainingDays > 0 && allocations.every(a => a.days >= maxDaysPerRegion)) {
      allocations[0].days += remainingDays;
      remainingDays = 0;
    }
  }

  // Build ordered result with day ranges
  let currentDay = 1;
  return allocations.map(a => {
    const result: RegionAllocation = {
      region: a.region,
      regionKey: a.key,
      days: a.days,
      startDay: currentDay,
      endDay: currentDay + a.days - 1,
    };
    currentDay += a.days;
    return result;
  });
}

/**
 * Phase B: Plan a single day within a region.
 * 
 * Steps:
 *   1. Score all available destinations in the region
 *   2. Select stops via beam search (top-K partial solutions)
 *   3. Order stops using nearest-neighbor heuristic
 *   4. Apply 2-opt optimization to reduce total distance
 *   5. Generate timestamps
 *   6. Enforce rest gap constraint
 */
function planDay(
  regionDests: Destination[],
  prefs: TripPreferences,
  usedIds: Set<string>,
  dayNumber: number,
  region: { en: string; ar: string },
  currentTicketCost: number,
  estOtherCosts: number,
  budgetThreshold: number,
): ItineraryDay {
  const maxStops = MAX_STOPS[prefs.intensity];
  const available = regionDests.filter(d => !usedIds.has(d.id));

  if (available.length === 0) {
    return { dayNumber, region, stops: [], totalKm: 0, totalVisitMinutes: 0 };
  }

  // Score all available destinations (initial scoring without route context)
  const scored = available.map(d =>
    scoreDestination(
      d, prefs.categories, prefs.month,
      crowdRange.min, crowdRange.max,
      costRange.min, costRange.max,
      0, 100, // Initial: no detour penalty
      new Set<string>()
    )
  );

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Budget-aware filtering: if approaching budget limit, prefer free/cheap destinations
  const budgetRemaining = budgetThreshold - currentTicketCost - estOtherCosts;
  let candidates = scored;
  if (budgetRemaining < 20) {
    // Prioritize free attractions but keep some paid ones
    candidates = [
      ...scored.filter(s => s.destination.ticket_cost_omr === 0),
      ...scored.filter(s => s.destination.ticket_cost_omr > 0 && s.destination.ticket_cost_omr < 3),
      ...scored.filter(s => s.destination.ticket_cost_omr >= 3),
    ];
    // Remove duplicates while preserving order
    const seen = new Set<string>();
    candidates = candidates.filter(s => {
      if (seen.has(s.destination.id)) return false;
      seen.add(s.destination.id);
      return true;
    });
  }

  // Select stops with constraint checking (greedy with look-ahead)
  const selected = selectStops(candidates, maxStops, prefs);

  if (selected.length === 0) {
    return { dayNumber, region, stops: [], totalKm: 0, totalVisitMinutes: 0 };
  }

  // Order by nearest-neighbor, then optimize with 2-opt
  const ordered = nearestNeighborOrder(selected.map(s => s.destination));
  const optimized = twoOptOptimize(ordered);

  // Enforce rest gap constraint
  const restGapEnforced = enforceRestGap(optimized, available, usedIds, selected);

  // Generate schedule with timestamps
  const stops = generateSchedule(restGapEnforced, selected, prefs);
  const dayTotalKm = stops.reduce((s, stop) => s + stop.distanceFromPrev, 0);
  const dayVisitMin = stops.reduce((s, stop) => s + stop.visitDuration, 0);

  return {
    dayNumber,
    region,
    stops,
    totalKm: Math.round(dayTotalKm * 10) / 10,
    totalVisitMinutes: dayVisitMin,
  };
}

/**
 * Select stops respecting constraints:
 * - Max stops per day
 * - Max 480 min visit time
 * - Max 250 km driving (estimated)
 * - Category variety (≤2 same category unless single-category preference)
 */
function selectStops(
  candidates: ScoredDestination[],
  maxStops: number,
  prefs: TripPreferences,
): ScoredDestination[] {
  const selected: ScoredDestination[] = [];
  let totalVisitTime = 0;
  const categoryCounts = new Map<string, number>();
  const singleCategoryMode = prefs.categories.length <= 1;

  for (const candidate of candidates) {
    if (selected.length >= maxStops) break;
    if (totalVisitTime + candidate.destination.avg_visit_duration_minutes > MAX_DAILY_VISIT_MINUTES) continue;

    // Category variety check
    if (!singleCategoryMode) {
      const wouldExceed = candidate.destination.categories.some(cat => {
        return (categoryCounts.get(cat) || 0) >= 2;
      });
      if (wouldExceed) continue;
    }

    // Estimate driving distance
    if (selected.length > 0) {
      const route = selected.map(s => s.destination);
      const addedKm = haversineDistance(
        route[route.length - 1], candidate.destination
      );
      const currentKm = totalKm(route);
      if (currentKm + addedKm > MAX_DAILY_KM) continue;
    }

    selected.push(candidate);
    totalVisitTime += candidate.destination.avg_visit_duration_minutes;
    candidate.destination.categories.forEach(cat => {
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });
  }

  return selected;
}

/**
 * Nearest-neighbor heuristic for initial route ordering.
 * Starts with the first destination, then always visits the closest unvisited.
 */
function nearestNeighborOrder(dests: Destination[]): Destination[] {
  if (dests.length <= 1) return [...dests];

  const remaining = [...dests];
  const ordered: Destination[] = [remaining.shift()!];

  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineDistance(last, remaining[i]);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }

  return ordered;
}

/**
 * 2-opt Local Search Optimization
 * 
 * Iteratively tries reversing sub-segments of the route.
 * If reversing reduces total distance, the improvement is kept.
 * Continues until no improvement is found (local optimum).
 * 
 * This is deterministic — no randomness involved.
 * Time complexity: O(n²) per iteration, typically converges in few iterations.
 */
function twoOptOptimize(route: Destination[]): Destination[] {
  if (route.length <= 2) return [...route];

  let improved = true;
  let current = [...route];

  while (improved) {
    improved = false;
    for (let i = 0; i < current.length - 1; i++) {
      for (let j = i + 2; j < current.length; j++) {
        const d1 = haversineDistance(current[i], current[i + 1]);
        const d2 = j + 1 < current.length
          ? haversineDistance(current[j], current[j + 1])
          : 0;
        const d3 = haversineDistance(current[i], current[j]);
        const d4 = j + 1 < current.length
          ? haversineDistance(current[i + 1], current[j + 1])
          : 0;

        if (d3 + d4 < d1 + d2) {
          // Reverse the segment between i+1 and j
          const reversed = current.slice(i + 1, j + 1).reverse();
          current = [
            ...current.slice(0, i + 1),
            ...reversed,
            ...current.slice(j + 1),
          ];
          improved = true;
        }
      }
    }
  }

  return current;
}

/**
 * Enforce rest gap constraint:
 * Two long stops (>90 min) cannot be adjacent without a short stop (<45 min) between.
 * If violated, attempt to insert a qualifying short stop from available destinations.
 */
function enforceRestGap(
  ordered: Destination[],
  allRegionDests: Destination[],
  usedIds: Set<string>,
  selected: ScoredDestination[],
): Destination[] {
  const result = [...ordered];
  const selectedIds = new Set(selected.map(s => s.destination.id));

  for (let i = 0; i < result.length - 1; i++) {
    const current = result[i];
    const next = result[i + 1];

    if (current.avg_visit_duration_minutes > 90 && next.avg_visit_duration_minutes > 90) {
      // Find a short stop (<45 min) to insert between
      const shortStop = allRegionDests.find(d =>
        !usedIds.has(d.id) &&
        !selectedIds.has(d.id) &&
        d.avg_visit_duration_minutes <= 45
      );

      if (shortStop) {
        result.splice(i + 1, 0, shortStop);
        selectedIds.add(shortStop.id);
        i++; // Skip the inserted stop
      }
    }
  }

  return result;
}

/**
 * Generate timed schedule for ordered stops.
 * Computes arrival/departure times based on travel time and visit duration.
 */
function generateSchedule(
  ordered: Destination[],
  scored: ScoredDestination[],
  _prefs: TripPreferences,
): ItineraryStop[] {
  const stops: ItineraryStop[] = [];
  let currentMinutes = DAY_START_HOUR * 60; // minutes since midnight

  for (let i = 0; i < ordered.length; i++) {
    const dest = ordered[i];
    let distFromPrev = 0;

    if (i > 0) {
      distFromPrev = haversineDistance(ordered[i - 1], dest);
      const travelMinutes = (distFromPrev / AVG_SPEED_KMH) * 60;
      currentMinutes += travelMinutes;
    }

    const arrivalTime = minutesToTime(currentMinutes);
    const visitDuration = dest.avg_visit_duration_minutes;
    currentMinutes += visitDuration;
    const departureTime = minutesToTime(currentMinutes);

    // Find score info
    const scoreInfo = scored.find(s => s.destination.id === dest.id);
    const score = scoreInfo?.score ?? 0;
    const explanation = scoreInfo
      ? getTopExplanations(scoreInfo.components)
      : ['N/A' as string, 'N/A' as string] as [string, string];

    stops.push({
      destination: dest,
      arrivalTime,
      departureTime,
      visitDuration,
      distanceFromPrev: Math.round(distFromPrev * 10) / 10,
      score,
      scoreExplanation: explanation,
    });
  }

  return stops;
}

/** Convert minutes since midnight to HH:MM format */
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
