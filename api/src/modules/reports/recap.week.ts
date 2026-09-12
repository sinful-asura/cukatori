const DAY_MS = 24 * 60 * 60 * 1000;

export function isoDateUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseIsoDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Monday of the UTC week containing `now`. */
export function isoMondayUtc(now = new Date()): Date {
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const weekday = day.getUTCDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  return addUtcDays(day, diff);
}

export function resolveWeekStart(start?: string): Date {
  const raw = start?.trim() ?? '';
  const datePart = raw.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  if (datePart) {
    const parsed = parseIsoDate(datePart);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return isoMondayUtc();
}

export function inRange(date: Date, start: Date, endExclusive: Date): boolean {
  const time = date.getTime();
  return time >= start.getTime() && time < endExclusive.getTime();
}

export function uniqueIsoDays(dates: Date[]): string[] {
  return [...new Set(dates.map(isoDateUtc))].sort();
}

export function longestConsecutiveDays(dates: Date[]): number {
  const days = uniqueIsoDays(dates);
  if (days.length === 0) {
    return 0;
  }
  let best = 1;
  let current = 1;
  for (let i = 1; i < days.length; i += 1) {
    const prev = parseIsoDate(days[i - 1]).getTime();
    const next = parseIsoDate(days[i]).getTime();
    if (next - prev === DAY_MS) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}

/** Keep in sync with `shared/xp/table.ts`. */
export function xpForLevel(level: number): number {
  return Math.round(100 * level * 1.15 ** (level - 1));
}

export function levelForXp(total: number): { level: number; into: number; next: number } {
  let level = 1;
  let consumed = 0;
  while (true) {
    const need = xpForLevel(level);
    if (consumed + need > total) {
      return { level, into: total - consumed, next: need };
    }
    consumed += need;
    level += 1;
  }
}
