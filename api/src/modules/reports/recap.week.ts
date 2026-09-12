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

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function parseAnchor(start?: string): Date {
  const raw = start?.trim() ?? '';
  const datePart = raw.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  if (datePart) {
    const parsed = parseIsoDate(datePart);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

export function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function addUtcMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

export function startOfUtcYear(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
}

export function addUtcYears(date: Date, years: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear() + years, 0, 1));
}

export function utcWeekdayMon0(date: Date): number {
  const day = date.getUTCDay();
  return day === 0 ? 6 : day - 1;
}

export function seriesYLabels(values: number[]): string[] {
  const max = Math.max(...values, 1);
  return [String(max), String(Math.round(max / 2)), '0'];
}

export function weekdayCounts(dates: Date[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const date of dates) {
    counts[utcWeekdayMon0(date)] += 1;
  }
  return counts;
}

export function monthWeekSlices(
  monthStart: Date,
  monthEnd: Date,
): { label: string; start: Date; end: Date }[] {
  const slices: { label: string; start: Date; end: Date }[] = [];
  let index = 1;
  let cursor = monthStart;
  while (cursor < monthEnd) {
    const next = addUtcDays(cursor, 7);
    slices.push({
      label: `Week ${index}`,
      start: cursor,
      end: next < monthEnd ? next : monthEnd,
    });
    cursor = next;
    index += 1;
  }
  return slices;
}

export function utcMonthLabel(date: Date): string {
  return date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
}

export function startOfUtcQuarter(date: Date): Date {
  const month = Math.floor(date.getUTCMonth() / 3) * 3;
  return new Date(Date.UTC(date.getUTCFullYear(), month, 1));
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
