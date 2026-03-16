/**
 * Multi-Objective Scoring Model
 * 
 * Computes a deterministic score for each destination based on user preferences.
 * All components are normalized to [0,1] before weighting.
 * 
 * Score Formula:
 *   score(i) = w_interest  * Jaccard(categories_user, categories_i)
 *            + w_season    * SeasonFit(month, recommended_months_i)
 *            - w_crowd     * Normalize(crowd_level_i)
 *            - w_cost      * Normalize(ticket_cost_omr_i)
 *            - w_detour    * DetourPenalty(i, current_route)
 *            + w_diversity * DiversityGain(i, selected_set)
 * 
 * Weight Rationale:
 * - interest (0.30): Category match is the primary driver — users want what they selected
 * - season (0.20): Visiting in-season dramatically improves experience quality
 * - crowd (0.15): Less crowded locations provide better experiences
 * - cost (0.10): Cost matters but is secondary to experience quality
 * - detour (0.15): Route efficiency prevents excessive driving and fatigue
 * - diversity (0.10): Category variety enriches the overall trip experience
 */

import type { Category, Destination, ScoredDestination } from '@/types/destination';

export const WEIGHTS = {
  interest: 0.30,
  season: 0.20,
  crowd: 0.15,
  cost: 0.10,
  detour: 0.15,
  diversity: 0.10,
} as const;

/**
 * Jaccard Similarity: |A ∩ B| / |A ∪ B|
 * Measures overlap between user-preferred categories and destination categories.
 * Returns 1 when sets are identical, 0 when disjoint.
 */
export function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Season Fit: Binary match — 1 if the travel month is in recommended months, 0 otherwise.
 */
export function seasonFit(month: number, recommendedMonths: number[]): number {
  return recommendedMonths.includes(month) ? 1 : 0;
}

/**
 * Normalize a value to [0,1] given known min/max bounds.
 * Returns 0 when min === max (all values equal).
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Diversity Gain: Measures how many new categories a candidate introduces
 * relative to the already-selected set. Returns [0,1].
 */
export function diversityGain(
  candidateCategories: string[],
  selectedCategories: Set<string>
): number {
  if (candidateCategories.length === 0) return 0;
  const newCats = candidateCategories.filter(c => !selectedCategories.has(c));
  return newCats.length / candidateCategories.length;
}

/**
 * Compute normalized detour penalty [0,1].
 * Uses the provided detour km and normalizes against max possible detour.
 */
export function normalizedDetour(detourKmValue: number, maxDetour: number): number {
  if (maxDetour <= 0) return 0;
  return Math.min(1, detourKmValue / maxDetour);
}

/**
 * Score a single destination given context.
 * Pure function — identical inputs always produce identical outputs.
 */
export function scoreDestination(
  dest: Destination,
  userCategories: Category[],
  month: number,
  crowdMin: number,
  crowdMax: number,
  costMin: number,
  costMax: number,
  detourKmValue: number,
  maxDetour: number,
  selectedCategories: Set<string>
): ScoredDestination {
  const interestScore = jaccard(userCategories, dest.categories);
  const seasonScore = seasonFit(month, dest.recommended_months);
  const crowdScore = normalize(dest.crowd_level, crowdMin, crowdMax);
  const costScore = normalize(dest.ticket_cost_omr, costMin, costMax);
  const detourScore = normalizedDetour(detourKmValue, maxDetour);
  const divScore = diversityGain(dest.categories, selectedCategories);

  const score =
    WEIGHTS.interest * interestScore +
    WEIGHTS.season * seasonScore -
    WEIGHTS.crowd * crowdScore -
    WEIGHTS.cost * costScore -
    WEIGHTS.detour * detourScore +
    WEIGHTS.diversity * divScore;

  // Build component map for explanation
  const components: Record<string, number> = {
    'Category Match': WEIGHTS.interest * interestScore,
    'Season Fit': WEIGHTS.season * seasonScore,
    'Low Crowd': -WEIGHTS.crowd * crowdScore,
    'Low Cost': -WEIGHTS.cost * costScore,
    'Route Efficiency': -WEIGHTS.detour * detourScore,
    'Diversity': WEIGHTS.diversity * divScore,
  };

  return { destination: dest, score, components };
}

/**
 * Get the top 2 positive contributing score components for explanation.
 */
export function getTopExplanations(components: Record<string, number>): [string, string] {
  const sorted = Object.entries(components)
    .sort(([, a], [, b]) => b - a);
  return [
    `${sorted[0][0]} (${(sorted[0][1] >= 0 ? '+' : '')}${sorted[0][1].toFixed(2)})`,
    `${sorted[1][0]} (${(sorted[1][1] >= 0 ? '+' : '')}${sorted[1][1].toFixed(2)})`,
  ];
}
