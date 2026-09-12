import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, of, timeout } from 'rxjs';
import type { ActivityEventDto } from '@ascend-os/shared';
import { environment } from '../../core/environment';
import { SessionService } from '../../core/session.service';
import { SettingsStore } from '../settings/settings.store';
import {
  KRISTIJAN_EVENTS,
  KRISTIJAN_GOALS,
  KRISTIJAN_HABITS,
  KRISTIJAN_LEVEL,
  KRISTIJAN_NAME,
  KRISTIJAN_QUOTE,
  KRISTIJAN_STREAK_DAYS,
  KRISTIJAN_SUBTITLE,
  KRISTIJAN_WEEKLY_XP,
  KRISTIJAN_XP_INTO,
  KRISTIJAN_XP_NEXT,
  buildWeeklyHeatmap,
  type GoalSeed,
  type HabitSeed,
  type HeatDay,
} from './kristijan.seed';

export interface MeStats {
  displayName: string;
  subtitle: string;
  quote: string;
  level: number;
  xp: number;
  xpNext: number;
  streakDays: number;
  weeklyXp: number;
}

export interface GoalView extends GoalSeed {
  percent: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly settings = inject(SettingsStore);

  readonly loading = signal(false);
  private hydrated = false;
  readonly me = signal<MeStats>(seedMe());
  readonly habits = signal<HabitSeed[]>(cloneHabits());
  readonly goals = signal<GoalView[]>(KRISTIJAN_GOALS.map(toGoalView));
  readonly events = signal<ActivityEventDto[]>([...KRISTIJAN_EVENTS]);
  readonly heatmap = signal<HeatDay[]>(buildWeeklyHeatmap());

  readonly displayName = computed(
    () =>
      this.session.user()?.displayName ??
      this.settings.settings().displayName ??
      this.me().displayName,
  );
  readonly greeting = computed(() => `Good morning, ${this.displayName()}`);
  readonly xpLabel = computed(() => {
    const { xp, xpNext, level } = this.me();
    return `Level ${level} · ${formatInt(xp)} / ${formatInt(xpNext)} XP`;
  });
  readonly streakLabel = computed(() => `${this.me().streakDays} day streak`);
  readonly weeklyXpLabel = computed(() => `+${formatInt(this.me().weeklyXp)} XP this week`);
  readonly xpMeters = computed(() => [{ label: 'XP', value: this.me().xp, color: '#3dd68c' }]);
  readonly goalMeters = computed(() =>
    this.goals().map((goal) => ({
      id: goal.id,
      title: goal.title,
      detail: formatGoalDetail(goal),
      percentLabel: `${goal.percent}%`,
      meters: [{ label: goal.title, value: goal.percent, color: '#3dd68c' }],
    })),
  );

  hydrate(): void {
    if (this.hydrated) {
      return;
    }
    this.hydrated = true;
    const api = environment.apiUrl;
    forkJoin({
      me: optionalGet<Record<string, unknown>>(this.http, `${api}/me/stats`),
      habits: optionalGet(this.http, `${api}/habits`),
      goals: optionalGet(this.http, `${api}/goals`),
      timeline: optionalGet(this.http, `${api}/timeline`),
    }).subscribe({
      next: (res) => {
        if (res.me) {
          this.me.set(mapMeStats(res.me, this.displayName()));
        }
        const habits = mapHabits(res.habits);
        if (habits) {
          this.habits.set(habits);
        }
        const goals = mapGoals(res.goals);
        if (goals) {
          this.goals.set(goals);
        }
        const events = mapEvents(res.timeline);
        if (events) {
          this.events.set(events);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleHabit(id: string, completed: boolean): void {
    this.habits.update((rows) => rows.map((row) => (row.id === id ? { ...row, completed } : row)));
  }
}

function seedMe(): MeStats {
  return {
    displayName: KRISTIJAN_NAME,
    subtitle: KRISTIJAN_SUBTITLE,
    quote: KRISTIJAN_QUOTE,
    level: KRISTIJAN_LEVEL,
    xp: KRISTIJAN_XP_INTO,
    xpNext: KRISTIJAN_XP_NEXT,
    streakDays: KRISTIJAN_STREAK_DAYS,
    weeklyXp: KRISTIJAN_WEEKLY_XP,
  };
}

function cloneHabits(): HabitSeed[] {
  return KRISTIJAN_HABITS.map((row) => ({ ...row }));
}

function toGoalView(goal: GoalSeed): GoalView {
  const percent = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
  return { ...goal, percent };
}

function formatInt(value: number): string {
  return value.toLocaleString('en-US');
}

function formatGoalDetail(goal: GoalView): string {
  if (goal.unit === 'eur') {
    return `€${formatInt(goal.current)} / €${formatInt(goal.target)}`;
  }
  return `${goal.current} / ${goal.target}`;
}

function mapMeStats(raw: Record<string, unknown>, displayName: string): MeStats {
  const streaks = raw['streaks'];
  return {
    displayName,
    subtitle: KRISTIJAN_SUBTITLE,
    quote: typeof raw['quote'] === 'string' ? raw['quote'] : KRISTIJAN_QUOTE,
    level: num(raw['level'], KRISTIJAN_LEVEL),
    xp: num(raw['xp'], KRISTIJAN_XP_INTO),
    xpNext: num(raw['xpNext'], KRISTIJAN_XP_NEXT),
    streakDays: readStreakDays(streaks),
    weeklyXp: num(raw['weeklyXp'], KRISTIJAN_WEEKLY_XP),
  };
}

function readStreakDays(raw: unknown): number {
  if (typeof raw === 'number') {
    return raw;
  }
  if (raw && typeof raw === 'object') {
    const row = raw as Record<string, unknown>;
    for (const key of ['overall', 'overallDays', 'days', 'current']) {
      if (typeof row[key] === 'number') {
        return row[key];
      }
    }
  }
  return KRISTIJAN_STREAK_DAYS;
}

function mapHabits(raw: unknown): HabitSeed[] | null {
  const rows = asArray(raw);
  if (!rows) {
    return null;
  }
  return rows.map((row, index) => ({
    id: str(row['id'], `habit-${index}`),
    title: str(row['title'] ?? row['name'], 'Habit'),
    xpHint: nullableNum(row['xpHint'] ?? row['xp']),
    completed: Boolean(row['completed'] ?? row['completedToday'] ?? row['done']),
  }));
}

function mapGoals(raw: unknown): GoalView[] | null {
  const rows = asArray(raw);
  if (!rows) {
    return null;
  }
  return rows.map((row, index) =>
    toGoalView({
      id: str(row['id'], `goal-${index}`),
      title: str(row['title'] ?? row['name'], 'Goal'),
      current: num(row['current'], 0),
      target: num(row['target'], 1),
      unit: readUnit(row['unit']),
    }),
  );
}

function mapEvents(raw: unknown): ActivityEventDto[] | null {
  const rows = asArray(raw);
  if (!rows) {
    return null;
  }
  return rows as unknown as ActivityEventDto[];
}

function asArray(raw: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(raw)) {
    return raw.filter((row) => row && typeof row === 'object') as Record<string, unknown>[];
  }
  if (raw && typeof raw === 'object') {
    const items = (raw as Record<string, unknown>)['items'];
    if (Array.isArray(items)) {
      return items.filter((row) => row && typeof row === 'object') as Record<string, unknown>[];
    }
  }
  return null;
}

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function nullableNum(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readUnit(value: unknown): GoalSeed['unit'] {
  if (value === 'eur' || value === 'EUR' || value === '€') {
    return 'eur';
  }
  if (value === 'sessions' || value === 'workouts') {
    return 'sessions';
  }
  return 'books';
}

function optionalGet<T>(http: HttpClient, url: string) {
  return http.get<T>(url).pipe(
    timeout(2000),
    catchError(() => of(null)),
  );
}
