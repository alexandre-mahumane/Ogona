/** Utilitários de data (UTC date-only). */

export function toDateOnly(value: Date | string): Date {
  if (typeof value === 'string') {
    const [y, m, d] = value.split('-').map(Number) as [number, number, number];
    return new Date(Date.UTC(y, m - 1, d));
  }
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

export function formatDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function diffNights(checkIn: Date, checkOut: Date): number {
  const ms = toDateOnly(checkOut).getTime() - toDateOnly(checkIn).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export function eachDateInclusive(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  let cursor = toDateOnly(start);
  const last = toDateOnly(end);
  while (cursor.getTime() <= last.getTime()) {
    dates.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

export function eachDateExclusiveEnd(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  let cursor = toDateOnly(start);
  const last = toDateOnly(end);
  while (cursor.getTime() < last.getTime()) {
    dates.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

export function startOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1));
}

export function endOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 0));
}
