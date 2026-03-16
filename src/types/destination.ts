/**
 * Core type definitions for the Oman Tourism platform.
 * All destination data follows this schema, supporting bilingual (EN/AR) content.
 */

export type Category = 'mountain' | 'beach' | 'culture' | 'desert' | 'nature' | 'food';

export type RegionKey = 'muscat' | 'dakhiliya' | 'sharqiya' | 'dhofar' | 'batinah' | 'dhahira';

export type BudgetTier = 'low' | 'medium' | 'luxury';

export type Intensity = 'relaxed' | 'balanced' | 'packed';

export type Language = 'en' | 'ar';

export interface Bilingual {
  en: string;
  ar: string;
}

export interface Destination {
  id: string;
  name: Bilingual;
  lat: number;
  lng: number;
  region: Bilingual;
  categories: Category[];
  company: Bilingual;
  avg_visit_duration_minutes: number;
  ticket_cost_omr: number;
  recommended_months: number[];
  crowd_level: number;
}

/** User preferences for the trip planner */
export interface TripPreferences {
  days: number;           // 1–7
  budget: BudgetTier;
  month: number;          // 1–12
  intensity: Intensity;
  categories: Category[];
}

/** A single stop in the itinerary */
export interface ItineraryStop {
  destination: Destination;
  arrivalTime: string;      // HH:MM format
  departureTime: string;    // HH:MM format
  visitDuration: number;    // minutes
  distanceFromPrev: number; // km
  score: number;
  /** Top 2 score components explaining why this stop was selected */
  scoreExplanation: [string, string];
}

/** A single day in the itinerary */
export interface ItineraryDay {
  dayNumber: number;
  region: Bilingual;
  stops: ItineraryStop[];
  totalKm: number;
  totalVisitMinutes: number;
}

/** Region allocation in Phase A */
export interface RegionAllocation {
  region: Bilingual;
  regionKey: string;
  days: number;
  startDay: number;
  endDay: number;
}

/** Complete generated itinerary */
export interface GeneratedItinerary {
  preferences: TripPreferences;
  regionPlan: RegionAllocation[];
  days: ItineraryDay[];
  costBreakdown: CostBreakdown;
  totalKm: number;
}

/** Detailed cost breakdown */
export interface CostBreakdown {
  fuel: number;
  tickets: number;
  food: number;
  hotel: number;
  total: number;
  withinBudget: boolean;
  budgetThreshold: number;
}

/** Scored destination with explanation */
export interface ScoredDestination {
  destination: Destination;
  score: number;
  components: Record<string, number>;
}
