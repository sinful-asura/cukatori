import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, of, timeout } from 'rxjs';
import type { ActivityEventDto, GoalDto, HabitDto, MeStatsDto } from '@ascend-os/shared';
import { ActivityApi } from '../../core/api/activity.api';
import { GoalsApi } from '../../core/api/goals.api';
import { HabitsApi } from '../../core/api/habits.api';
import { MeApi } from '../../core/api/me.api';
import {
  KRISTIJAN_EVENTS,
  KRISTIJAN_LEVEL,
  KRISTIJAN_STREAK_DAYS,
  KRISTIJAN_XP_INTO,
  KRISTIJAN_XP_NEXT,
  SEED_HABITS_DONE,
  SEED_HOURLY_ROWS,
  SEED_MIX_SERIES,
  SEED_PAGES,
  SEED_SPENT,
  SEED_WEEK_ACTIVITY,
  SEED_WORKOUTS,
  WEEK_ACTIVITY_LABELS,
  type HourlyRow,
} from './kristijan.seed';

export type ModuleFilter = 'all' | 'exercise' | 'habit' | 'entertainment' | 'finance';
export type RangeFilter = 7 | 14 | 30;

export interface DashStat {
  label: string;
  value: string;
}

export interface MixSeries {
  label: string;
  color: string;
  values: number[];
}

const MODULE_MATCH: Record<Exclude<ModuleFilter, 'all'>, ActivityEventDto['category']> = {
  exercise: 'exercise',
  habit: 'habit',
  entertainment: 'entertainment',
  finance: 'finance',
};

const MIX_KEYS: { label: string; color: string; category: ActivityEventDto['category'] }[] = [
  { label: 'Exercise', color: '#0091ff', category: 'exercise' },
  { label: 'Habits', color: '#fde047', category: 'habit' },
  { label: 'Reading', color: '#eab308', category: 'entertainment' },
  { label: 'Finance', color: '#a16207', category: 'finance' },
];

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly meApi = inject(MeApi);
  private readonly habitsApi = inject(HabitsApi);
  private readonly goalsApi = inject(GoalsApi);
  private readonly activityApi = inject(ActivityApi);

  readonly loading = signal(false);
  private hydrated = false;

  readonly level = signal(KRISTIJAN_LEVEL);
  readonly xp = signal(KRISTIJAN_XP_INTO);
  readonly xpNext = signal(KRISTIJAN_XP_NEXT);
  readonly streakDays = signal(KRISTIJAN_STREAK_DAYS);
  readonly habitsDone = signal(SEED_HABITS_DONE);
  readonly workouts = signal(SEED_WORKOUTS);
  readonly pages = signal(SEED_PAGES);
  readonly spent = signal(SEED_SPENT);
  readonly events = signal<ActivityEventDto[]>([...KRISTIJAN_EVENTS]);
  readonly habits = signal<HabitDto[]>([]);
  readonly goals = signal<GoalDto[]>([]);
  readonly liveCharts = signal(false);

  readonly module = signal<ModuleFilter>('all');
  readonly range = signal<RangeFilter>(7);

  readonly weekLabels = [...WEEK_ACTIVITY_LABELS];

  readonly stats = computed<DashStat[]>(() => [
    { label: 'Streak', value: String(this.streakDays()) },
    { label: 'Habits done', value: String(this.habitsDone()) },
    { label: 'Workouts', value: String(this.workouts()) },
    { label: 'Pages read', value: String(this.pages()) },
    { label: 'Spent', value: formatEur(this.spent()) },
    { label: 'XP', value: formatInt(this.xp()) },
  ]);

  readonly filteredEvents = computed(() => {
    const module = this.module();
    const from = rangeStart(this.range());
    return this.events().filter((event) => {
      if (new Date(event.occurredAt) < from) {
        return false;
      }
      if (module === 'all') {
        return true;
      }
      return event.category === MODULE_MATCH[module];
    });
  });

  readonly weekActivity = computed(() => {
    if (!this.liveCharts()) {
      return [...SEED_WEEK_ACTIVITY];
    }
    return countsByWeekday(this.filteredEvents(), () => true);
  });

  readonly activitySeries = computed(() => [
    {
      label: this.moduleLabel(),
      color: '#0091ff',
      values: this.weekActivity(),
    },
  ]);

  readonly mixSeries = computed<MixSeries[]>(() => {
    if (!this.liveCharts()) {
      const module = this.module();
      if (module === 'all') {
        return SEED_MIX_SERIES.map((row) => ({ ...row, values: [...row.values] }));
      }
      const wanted = MIX_KEYS.find((row) => row.category === MODULE_MATCH[module]);
      return SEED_MIX_SERIES.filter((row) => row.label === wanted?.label).map((row) => ({
        ...row,
        values: [...row.values],
      }));
    }
    const events = this.filteredEvents();
    const module = this.module();
    return MIX_KEYS.filter((row) => module === 'all' || row.category === MODULE_MATCH[module]).map((row) => ({
      label: row.label,
      color: row.color,
      values: countsByWeekday(events, (event) => event.category === row.category),
    }));
  });

  readonly activitySubtitle = computed(() => {
    const values = this.weekActivity();
    const avg = values.length ? values.reduce((sum, n) => sum + n, 0) / values.length : 0;
    return `${formatAvg(avg)} / day avg.`;
  });

  readonly mixSubtitle = computed(() => {
    const total = this.mixSeries()
      .flatMap((row) => row.values)
      .reduce((sum, n) => sum + n, 0);
    return `${total} actions`;
  });

  readonly yLabels = computed(() => {
    const max = Math.max(...this.weekActivity(), ...this.mixSeries().flatMap((row) => row.values), 6);
    const top = max <= 6 ? 6 : Math.ceil(max);
    return [String(top), String(Math.round(top / 2)), '0'];
  });

  readonly hourlyRows = computed<HourlyRow[]>(() => {
    if (!this.liveCharts()) {
      return SEED_HOURLY_ROWS;
    }
    const rows = buildHourlyRows(this.filteredEvents());
    return rows.length ? rows : SEED_HOURLY_ROWS;
  });

  readonly tableRangeLabel = computed(() => {
    const rows = this.hourlyRows();
    if (rows.length === 0) {
      return '';
    }
    return `Showing ${rows[rows.length - 1].time} – ${rows[0].time}`;
  });

  readonly moduleLabel = computed(() => {
    switch (this.module()) {
      case 'exercise':
        return 'Exercise';
      case 'habit':
        return 'Habits';
      case 'entertainment':
        return 'Reading';
      case 'finance':
        return 'Finance';
      default:
        return 'All modules';
    }
  });

  hydrate(): void {
    if (this.hydrated) {
      return;
    }
    this.hydrated = true;
    this.loading.set(true);
    forkJoin({
      me: this.meApi.stats().pipe(timeout(2000), catchError(() => of(null))),
      habits: this.habitsApi.list().pipe(timeout(2000), catchError(() => of(null))),
      goals: this.goalsApi.list().pipe(timeout(2000), catchError(() => of(null))),
      events: this.activityApi.timeline().pipe(
        timeout(2000),
        catchError(() => this.activityApi.list().pipe(timeout(2000), catchError(() => of(null)))),
      ),
    }).subscribe({
      next: (res) => {
        if (res.me) {
          this.applyMe(res.me);
        }
        if (res.habits) {
          this.habits.set(res.habits);
          this.habitsDone.set(res.habits.filter((habit) => habit.completedToday).length);
        }
        if (res.goals) {
          this.goals.set(res.goals);
        }
        if (res.events?.length) {
          this.events.set(sorted(res.events));
          this.liveCharts.set(true);
          this.applyEventStats(res.events);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  exportHourlyCsv(): void {
    const rows = this.hourlyRows();
    const lines = [
      ['Time', 'Habit', 'Exercise', 'Media', 'Spend', 'XP'].join(','),
      ...rows.map((row) =>
        [row.time, row.habit, row.exercise, row.media, row.spend, row.xp]
          .map(csvCell)
          .join(','),
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hourly-breakdown.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  private applyMe(raw: MeStatsDto): void {
    this.level.set(raw.level || KRISTIJAN_LEVEL);
    this.xp.set(num(raw.xp, KRISTIJAN_XP_INTO));
    this.xpNext.set(num(raw.xpNext, KRISTIJAN_XP_NEXT));
    const streak = raw.streaks?.find((row) => row.kind === 'overall') ?? raw.streaks?.[0];
    this.streakDays.set(streak?.current ?? KRISTIJAN_STREAK_DAYS);
  }

  private applyEventStats(events: ActivityEventDto[]): void {
    const from = rangeStart(this.range());
    const inRange = events.filter((event) => new Date(event.occurredAt) >= from);
    const workouts = inRange.filter((event) => event.type === 'WORKOUT_COMPLETED').length;
    const pages = inRange.reduce((sum, event) => sum + pagesFrom(event), 0);
    const spent = inRange.reduce((sum, event) => sum + spendFrom(event), 0);
    if (workouts) {
      this.workouts.set(workouts);
    }
    if (pages) {
      this.pages.set(pages);
    }
    if (spent) {
      this.spent.set(spent);
    }
  }
}

function rangeStart(days: RangeFilter): Date {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

function countsByWeekday(
  events: ActivityEventDto[],
  match: (event: ActivityEventDto) => boolean,
): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const event of events) {
    if (!match(event)) {
      continue;
    }
    counts[new Date(event.occurredAt).getDay()] += 1;
  }
  return counts;
}

function buildHourlyRows(events: ActivityEventDto[]): HourlyRow[] {
  const buckets = new Map<string, ActivityEventDto[]>();
  const order: string[] = [];
  const sortedEvents = sorted(events);
  for (const event of sortedEvents) {
    const key = hourKey(event.occurredAt);
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(event);
  }
  return order.map((time) => {
    const group = buckets.get(time) ?? [];
    const habit = firstSummary(group, (event) => event.category === 'habit' || event.category === 'journal');
    const exercise = firstSummary(group, (event) => event.category === 'exercise');
    const media = firstSummary(group, (event) => event.category === 'entertainment');
    const spend = group.reduce((sum, event) => sum + spendFrom(event), 0);
    const xp = group.reduce((sum, event) => sum + (event.xpAwarded || 0), 0);
    return {
      time,
      habit: habit || '—',
      exercise: exercise || '—',
      media: media || '—',
      spend: spend ? formatEur(spend) : '—',
      xp: xp ? `+${xp}` : '—',
    };
  });
}

function firstSummary(events: ActivityEventDto[], match: (event: ActivityEventDto) => boolean): string {
  const hit = events.find(match);
  if (!hit) {
    return '';
  }
  return hit.summary || hit.title;
}

function hourKey(iso: string): string {
  const date = new Date(iso);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const hour = date.getHours();
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${month} ${day}, ${twelve} ${suffix}`;
}

function pagesFrom(event: ActivityEventDto): number {
  const pages = event.payload['pages'];
  if (typeof pages === 'number' && Number.isFinite(pages)) {
    return pages;
  }
  const match = `${event.summary} ${event.title}`.match(/(\d+)\s*(?:p|pages?)/i);
  return match ? Number(match[1]) : 0;
}

function spendFrom(event: ActivityEventDto): number {
  if (event.type !== 'EXPENSE_CREATED' && event.category !== 'finance') {
    return 0;
  }
  if (event.type === 'INCOME_CREATED') {
    return 0;
  }
  const amount = event.payload['amount'];
  if (typeof amount === 'number' && Number.isFinite(amount)) {
    return amount;
  }
  const match = `${event.summary} ${event.title}`.match(/€([\d.]+)/);
  return match ? Number(match[1]) : 0;
}

function sorted(events: ActivityEventDto[]): ActivityEventDto[] {
  return [...events].sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt));
}

function formatInt(value: number): string {
  return value.toLocaleString('en-US');
}

function formatEur(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) {
    return `€${formatInt(rounded)}`;
  }
  return `€${rounded.toFixed(2)}`;
}

function formatAvg(value: number): string {
  const rounded = Math.round(value);
  return String(rounded);
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
