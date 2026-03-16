import type { Destination, Category } from '@/types/destination';
import rawData from './data.json';

/** All destinations from the dataset */
export const destinations: Destination[] = rawData as Destination[];

/** Unique regions extracted from data */
export const regions = [...new Set(destinations.map(d => d.region.en))];

/** Unique categories extracted from data */
export const categories: Category[] = [...new Set(destinations.flatMap(d => d.categories))] as Category[];

/** Get destinations by region */
export function getByRegion(regionEn: string): Destination[] {
  return destinations.filter(d => d.region.en.toLowerCase() === regionEn.toLowerCase());
}

/** Get destinations by category */
export function getByCategory(cat: Category): Destination[] {
  return destinations.filter(d => d.categories.includes(cat));
}

/** Get a destination by ID */
export function getById(id: string): Destination | undefined {
  return destinations.find(d => d.id === id);
}

/** Get min/max crowd levels */
export const crowdRange = {
  min: Math.min(...destinations.map(d => d.crowd_level)),
  max: Math.max(...destinations.map(d => d.crowd_level)),
};

/** Get min/max ticket costs */
export const costRange = {
  min: Math.min(...destinations.map(d => d.ticket_cost_omr)),
  max: Math.max(...destinations.map(d => d.ticket_cost_omr)),
};

/** Category display info with icons */
export const categoryInfo: Record<Category, { emoji: string }> = {
  mountain: { emoji: '⛰️' },
  beach: { emoji: '🏖️' },
  culture: { emoji: '🏛️' },
  desert: { emoji: '🏜️' },
  nature: { emoji: '🌿' },
  food: { emoji: '🍽️' },
};
