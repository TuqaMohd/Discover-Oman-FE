/**
 * Haversine Distance Module
 * 
 * Implements great-circle distance calculation between two GPS coordinates.
 * Used for all distance computations in the planner — no external routing APIs.
 * 
 * Reference: https://en.wikipedia.org/wiki/Haversine_formula
 */

const EARTH_RADIUS_KM = 6371;

interface GeoPoint {
  lat: number;
  lng: number;
}

/** Convert degrees to radians */
const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Compute Haversine distance between two geographic points.
 * @returns Distance in kilometers
 */
export function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Compute total distance for a sequence of points (route).
 * @returns Total distance in km
 */
export function totalKm(route: GeoPoint[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversineDistance(route[i - 1], route[i]);
  }
  return total;
}

/**
 * Compute the detour penalty for inserting a candidate stop into an existing route.
 * Finds the insertion point that minimizes additional distance.
 * @returns Minimum additional km required to include the candidate
 */
export function detourKm(route: GeoPoint[], candidate: GeoPoint): number {
  if (route.length === 0) return 0;
  if (route.length === 1) return haversineDistance(route[0], candidate);

  let minDetour = Infinity;

  // Try inserting between each consecutive pair
  for (let i = 0; i < route.length - 1; i++) {
    const currentDist = haversineDistance(route[i], route[i + 1]);
    const newDist = haversineDistance(route[i], candidate) +
      haversineDistance(candidate, route[i + 1]);
    minDetour = Math.min(minDetour, newDist - currentDist);
  }

  // Try appending at the end
  const appendDist = haversineDistance(route[route.length - 1], candidate);
  minDetour = Math.min(minDetour, appendDist);

  return Math.max(0, minDetour);
}
