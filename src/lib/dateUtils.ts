export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function isBeforeToday(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatMediumDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function dayOfWeek(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
}

export function dayOfMonth(dateStr: string): string {
  return new Date(dateStr).getDate().toString();
}

export function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    dates.push(toISODate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
