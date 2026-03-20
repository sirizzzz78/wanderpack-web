import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Trip, PackingItem } from '../db/models';

export function usePackingItemsForTrips(trips: Trip[]): Record<string, PackingItem[]> {
  const ids = trips.map(t => t.id);
  const items = useLiveQuery(
    async () => {
      if (ids.length === 0) return [];
      return db.packingItems.where('tripId').anyOf(ids).toArray();
    },
    [ids.join(',')]
  ) ?? [];

  const grouped: Record<string, PackingItem[]> = {};
  for (const item of items) {
    if (!grouped[item.tripId]) grouped[item.tripId] = [];
    grouped[item.tripId].push(item);
  }
  return grouped;
}
