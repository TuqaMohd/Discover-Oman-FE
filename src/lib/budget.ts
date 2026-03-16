/**
 * Budget Calculation Module
 * 
 * Computes full cost breakdown for a trip based on:
 * - Fuel: total_km / 12 * fuel_price (0.2 OMR/liter)
 * - Tickets: sum of ticket_cost_omr for all stops
 * - Food: 6 OMR × days
 * - Hotel: varies by budget tier per night
 * 
 * Budget Thresholds (documented):
 * - Low: 80 OMR/day (budget travelers, camping/hostels)
 * - Medium: 150 OMR/day (mid-range hotels, some attractions)
 * - Luxury: 300 OMR/day (premium hotels, all attractions)
 */

import type { BudgetTier, CostBreakdown, ItineraryDay } from '@/types/destination';

const FUEL_PRICE_PER_LITER = 0.2;  // OMR
const KM_PER_LITER = 12;
const FOOD_PER_DAY = 6;            // OMR

const HOTEL_RATES: Record<BudgetTier, number> = {
  low: 20,
  medium: 45,
  luxury: 90,
};

/** Budget threshold per day for each tier */
const BUDGET_THRESHOLDS: Record<BudgetTier, number> = {
  low: 80,
  medium: 150,
  luxury: 300,
};

/**
 * Compute full cost breakdown for the trip.
 * Pure function — deterministic output for given inputs.
 */
export function computeCostBreakdown(
  days: ItineraryDay[],
  totalKm: number,
  budget: BudgetTier,
  numDays: number
): CostBreakdown {
  const fuel = (totalKm / KM_PER_LITER) * FUEL_PRICE_PER_LITER;
  const tickets = days.reduce(
    (sum, day) => sum + day.stops.reduce(
      (s, stop) => s + stop.destination.ticket_cost_omr, 0
    ), 0
  );
  const food = FOOD_PER_DAY * numDays;
  const hotel = HOTEL_RATES[budget] * (numDays - 1); // No hotel on last night
  const total = fuel + tickets + food + hotel;
  const budgetThreshold = BUDGET_THRESHOLDS[budget] * numDays;

  return {
    fuel: Math.round(fuel * 100) / 100,
    tickets: Math.round(tickets * 100) / 100,
    food,
    hotel,
    total: Math.round(total * 100) / 100,
    withinBudget: total <= budgetThreshold,
    budgetThreshold,
  };
}

/**
 * Get the budget threshold for a tier.
 */
export function getBudgetThreshold(budget: BudgetTier, days: number): number {
  return BUDGET_THRESHOLDS[budget] * days;
}

/**
 * Check if adding a destination would exceed budget.
 * Used during planning to favor lower-cost alternatives when budget is tight.
 */
export function wouldExceedBudget(
  currentTicketTotal: number,
  additionalCost: number,
  estimatedOtherCosts: number,
  threshold: number
): boolean {
  return (currentTicketTotal + additionalCost + estimatedOtherCosts) > threshold;
}
