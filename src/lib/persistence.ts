/**
 * Persistence Module
 * 
 * Manages localStorage persistence for:
 * - Saved destination interests (for planner input)
 * - User trip preferences
 * - Generated itinerary plans
 * - Cost breakdowns
 * 
 * All data persists across refresh and navigation.
 */

import type { GeneratedItinerary, TripPreferences } from '@/types/destination';

const KEYS = {
  savedInterests: 'oman_saved_interests',
  tripPreferences: 'oman_trip_preferences',
  generatedPlan: 'oman_generated_plan',
  language: 'oman_language',
} as const;

/** Save a destination ID to interests */
export function saveInterest(id: string): void {
  const interests = getSavedInterests();
  if (!interests.includes(id)) {
    interests.push(id);
    localStorage.setItem(KEYS.savedInterests, JSON.stringify(interests));
  }
}

/** Remove a destination ID from interests */
export function removeInterest(id: string): void {
  const interests = getSavedInterests().filter(i => i !== id);
  localStorage.setItem(KEYS.savedInterests, JSON.stringify(interests));
}

/** Toggle a destination interest */
export function toggleInterest(id: string): boolean {
  const interests = getSavedInterests();
  if (interests.includes(id)) {
    removeInterest(id);
    return false;
  } else {
    saveInterest(id);
    return true;
  }
}

/** Get all saved interest IDs */
export function getSavedInterests(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.savedInterests);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Check if a destination is saved */
export function isInterestSaved(id: string): boolean {
  return getSavedInterests().includes(id);
}

/** Save trip preferences */
export function saveTripPreferences(prefs: TripPreferences): void {
  localStorage.setItem(KEYS.tripPreferences, JSON.stringify(prefs));
}

/** Get saved trip preferences */
export function getTripPreferences(): TripPreferences | null {
  try {
    const raw = localStorage.getItem(KEYS.tripPreferences);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Save generated itinerary */
export function saveGeneratedPlan(plan: GeneratedItinerary): void {
  localStorage.setItem(KEYS.generatedPlan, JSON.stringify(plan));
}

/** Get saved generated plan */
export function getGeneratedPlan(): GeneratedItinerary | null {
  try {
    const raw = localStorage.getItem(KEYS.generatedPlan);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Save language preference */
export function saveLanguage(lang: string): void {
  localStorage.setItem(KEYS.language, lang);
}

/** Get saved language */
export function getSavedLanguage(): string {
  return localStorage.getItem(KEYS.language) || 'en';
}
