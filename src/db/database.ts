import Dexie, { type Table } from 'dexie';
import type { Trip, PackingItem, LearnedItem } from './models';

class ReadiLiDB extends Dexie {
  trips!: Table<Trip, string>;
  packingItems!: Table<PackingItem, string>;
  learnedItems!: Table<LearnedItem, string>;

  constructor() {
    super('readili');
    this.version(1).stores({
      trips: 'id, startDate',
      packingItems: 'id, tripId, category',
      learnedItems: 'name',
    });
  }
}

export const db = new ReadiLiDB();
