export function eurosToCents(amount: number): number {
  return Math.round(Number(amount) * 100);
}

export function centsToEuros(cents: number): number {
  return Math.round(cents) / 100;
}

export function monthKey(value: Date | string): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
    return value;
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function monthBounds(month: string): { start: Date; end: Date } {
  const [year, mon] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, mon - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, mon, 1, 0, 0, 0, 0));
  return { start, end };
}
