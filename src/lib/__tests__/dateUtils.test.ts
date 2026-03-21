import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  toISODate,
  addDays,
  isSameDay,
  isBeforeToday,
  formatShortDate,
  formatMediumDate,
  getDatesInRange,
} from '../dateUtils';

describe('toISODate', () => {
  it('formats a Date as YYYY-MM-DD', () => {
    expect(toISODate(new Date('2026-03-20T00:00:00Z'))).toBe('2026-03-20');
  });
});

describe('addDays', () => {
  it('adds days to a date', () => {
    const result = addDays(new Date(2026, 2, 20), 3); // Mar 20 local
    expect(result.getDate()).toBe(23);
  });

  it('handles month boundary crossing', () => {
    const result = addDays(new Date(2026, 2, 20), 15); // Mar 20 local
    expect(result.getMonth()).toBe(3); // April = 3
    expect(result.getDate()).toBe(4);
  });
});

describe('isSameDay', () => {
  it('returns true for the same date', () => {
    expect(isSameDay(new Date('2026-03-20'), new Date('2026-03-20'))).toBe(true);
  });

  it('returns false for different dates', () => {
    expect(isSameDay(new Date('2026-03-20'), new Date('2026-03-21'))).toBe(false);
  });
});

describe('isBeforeToday', () => {
  afterEach(() => { vi.useRealTimers(); });

  it('returns true for yesterday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-20T12:00:00'));
    expect(isBeforeToday('2026-03-19')).toBe(true);
  });

  it('returns false for tomorrow', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-20T12:00:00'));
    expect(isBeforeToday('2026-03-21')).toBe(false);
  });
});

describe('formatShortDate', () => {
  it('formats as "Mon DD"', () => {
    // Use T00:00 to avoid UTC midnight → local day-before shift
    const result = formatShortDate('2026-03-20T00:00');
    expect(result).toMatch(/Mar\s+20/);
  });
});

describe('formatMediumDate', () => {
  it('formats as "Mon DD, YYYY"', () => {
    const result = formatMediumDate('2026-03-20T00:00');
    expect(result).toMatch(/Mar\s+20,\s+2026/);
  });
});

describe('getDatesInRange', () => {
  it('returns inclusive date range', () => {
    const dates = getDatesInRange('2026-03-20', '2026-03-23');
    expect(dates).toHaveLength(4);
    expect(dates[0]).toBe('2026-03-20');
    expect(dates[3]).toBe('2026-03-23');
  });

  it('returns single date when start equals end', () => {
    const dates = getDatesInRange('2026-03-20', '2026-03-20');
    expect(dates).toHaveLength(1);
    expect(dates[0]).toBe('2026-03-20');
  });
});
