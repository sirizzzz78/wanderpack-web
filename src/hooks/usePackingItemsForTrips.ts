import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Trip, PackingItem } from '../db/models';

export function usePackingItemsForTrips(trips: Trip[]): Record<string, PackingItem[]> {
  // Sort IDs to stabilize the dependency — reordering trips won't re-query
  const stableKey = useMemo(
    () => trips.map(t => t.id).sort().join(','),
    [trips]
  );

  const ids = useMemo(() => trips.map(t => t.id), [stableKey]);

  const items = useLiveQuery(
    async () => {
      if (ids.length === 0) return [];
      return db.packingItems.where('tripId').anyOf(ids).toArray();
    },
    [stableKey]
  ) ?? [];

  const grouped: Record<string, PackingItem[]> = {};
  for (const item of items) {
    if (!grouped[item.tripId]) grouped[item.tripId] = [];
    grouped[item.tripId].push(item);
  }
  return grouped;
}
