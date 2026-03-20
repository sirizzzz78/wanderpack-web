import Dexie, { type Table } from 'dexie';
import type { Trip, PackingItem, LearnedItem } from './models';

/**
 * Schema Migration Guide
 * ─────────────────────
 * - Each version(N) call defines the schema AT that version.
 * - NEVER remove or reorder previous version() calls — Dexie replays
 *   them sequentially to upgrade users on older schemas.
 * - If you add a new index or table, bump the version number and add
 *   a new .version(N+1).stores({...}) call.
 * - Only list tables whose schema CHANGES in a new version; unchanged
 *   tables inherit from the previous version automatically.
 * - For data migrations, chain .upgrade(tx => { ... }) after .stores().
 * - Avoid compound indexes on boolean fields — IndexedDB doesn't
 *   reliably index booleans across all browsers.
 */

class ReadiLiDB extends Dexie {
  trips!: Table<Trip, string>;
  packingItems!: Table<PackingItem, string>;
  learnedItems!: Table<LearnedItem, string>;

  constructor() {
    super('readili');

    // v1: Initial schema
    this.version(1).stores({
      trips: 'id, startDate',
      packingItems: 'id, tripId, category',
      learnedItems: 'name',
    });

    // v2: Keep same indexes (compound boolean indexes removed —
    // they caused VersionError on some browsers).
    // This version must remain so existing v2 databases don't
    // trigger a downgrade error.
    this.version(2).stores({
      packingItems: 'id, tripId, category',
    });
  }
}

export const db = new ReadiLiDB();
