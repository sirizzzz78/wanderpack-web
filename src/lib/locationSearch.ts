export interface LocationResult {
  name: string;
  country: string;
  admin1?: string; // state/province
  latitude: number;
  longitude: number;
}

let abortController: AbortController | null = null;

/**
 * Searches for locations using the Open-Meteo geocoding API.
 * Debounce should be handled by the caller.
 */
export async function searchLocations(query: string): Promise<LocationResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // Cancel any in-flight request
  if (abortController) abortController.abort();
  abortController = new AbortController();

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`;

  try {
    const res = await fetch(url, { signal: abortController.signal });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((r: any) => ({
      name: r.name,
      country: r.country ?? '',
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch {
    return [];
  }
}

/** Formats a location result as a display string. */
export function formatLocation(loc: LocationResult): string {
  const parts = [loc.name];
  if (loc.admin1) parts.push(loc.admin1);
  if (loc.country) parts.push(loc.country);
  return parts.join(', ');
}
