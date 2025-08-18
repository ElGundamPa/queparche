import { getPreciseDistance } from 'geolib';

export type LatLng = { latitude: number; longitude: number };

export function distanceMeters(a: LatLng, b: LatLng): number {
  return getPreciseDistance(a, b);
}

export function distanceKmLabel(meters?: number | null): string {
  if (meters == null) return '';
  const km = meters / 1000;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}
