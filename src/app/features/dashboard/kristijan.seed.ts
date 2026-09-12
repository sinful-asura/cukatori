import type { ActivityEventDto } from '@ascend-os/shared';
import { XP_AWARDS } from '@ascend-os/shared';

export const KRISTIJAN_NAME = 'Kristijan';
export const KRISTIJAN_LEVEL = 18;
export const KRISTIJAN_XP_INTO = 2840;
export const KRISTIJAN_XP_NEXT = 3000;
export const KRISTIJAN_STREAK_DAYS = 12;
export const KRISTIJAN_WEEKLY_XP = 240;
export const KRISTIJAN_QUOTE = 'Discipline today, freedom tomorrow.';
export const KRISTIJAN_SUBTITLE = 'Small steps every day lead to big results.';

export interface HabitSeed {
  id: string;
  title: string;
  xpHint: number | null;
  completed: boolean;
}

export interface GoalSeed {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: 'books' | 'eur' | 'sessions';
}

export const KRISTIJAN_HABITS: HabitSeed[] = [
  { id: 'habit-gym', title: 'Gym time', xpHint: 100, completed: true },
  { id: 'habit-pages', title: 'Read 20 pages', xpHint: 20, completed: false },
  { id: 'habit-expenses', title: "Log today's expenses", xpHint: null, completed: false },
  { id: 'habit-water', title: 'Drink 2L of water', xpHint: 10, completed: false },
  { id: 'habit-goals', title: 'Review goals', xpHint: null, completed: false },
  { id: 'habit-journal', title: 'Journal entry', xpHint: 15, completed: false },
];

export const KRISTIJAN_GOALS: GoalSeed[] = [
  { id: 'goal-books', title: 'Read 12 books', current: 8, target: 12, unit: 'books' },
  { id: 'goal-save', title: 'Save €2,000', current: 960, target: 2000, unit: 'eur' },
  { id: 'goal-workout', title: 'Workout 3× per week', current: 8, target: 10, unit: 'sessions' },
];

function at(daysAgo: number, hours: number, minutes: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export const KRISTIJAN_EVENTS: ActivityEventDto[] = [
  {
    id: 'evt-workout-today',
    category: 'exercise',
    type: 'WORKOUT_COMPLETED',
    occurredAt: at(0, 11, 42),
    title: 'Workout completed',
    summary: 'Chest & Triceps',
    xpAwarded: XP_AWARDS.WORKOUT_COMPLETED,
    payload: { durationMin: 48, volumeKg: 6420 },
    tags: ['workout', 'chest'],
  },
  {
    id: 'evt-lunch',
    category: 'finance',
    type: 'EXPENSE_CREATED',
    occurredAt: at(0, 10, 13),
    title: 'Expense',
    summary: 'Lunch · €14.50',
    xpAwarded: XP_AWARDS.EXPENSE_CREATED,
    payload: { amount: 14.5, currency: 'EUR' },
    tags: ['lunch', 'dining'],
  },
  {
    id: 'evt-dune',
    category: 'entertainment',
    type: 'MEDIA_PROGRESS',
    occurredAt: at(0, 9, 20),
    title: 'Entertainment',
    summary: 'Read 25 pages · Dune',
    xpAwarded: XP_AWARDS.MEDIA_PROGRESS,
    payload: { pages: 25, title: 'Dune' },
    tags: ['dune', 'reading'],
  },
  {
    id: 'evt-gym-habit',
    category: 'habit',
    type: 'HABIT_COMPLETED',
    occurredAt: at(0, 8, 15),
    title: 'Habit completed',
    summary: 'Gym time',
    xpAwarded: XP_AWARDS.HABIT_COMPLETED,
    payload: { habitId: 'habit-gym' },
    tags: ['habit', 'gym'],
  },
  {
    id: 'evt-journal-yday',
    category: 'journal',
    type: 'JOURNAL_CREATED',
    occurredAt: at(1, 21, 6),
    title: 'Journal entry',
    summary: 'Evening reflection',
    xpAwarded: XP_AWARDS.JOURNAL_CREATED,
    payload: {},
    tags: ['journal'],
  },
  {
    id: 'evt-books-progress',
    category: 'goal',
    type: 'GOAL_PROGRESSED',
    occurredAt: at(1, 19, 40),
    title: 'Goal progressed',
    summary: 'Read 12 books · 8 / 12',
    xpAwarded: XP_AWARDS.GOAL_PROGRESSED,
    payload: { goalId: 'goal-books', current: 8, target: 12 },
    tags: ['reading'],
  },
  {
    id: 'evt-one-piece',
    category: 'entertainment',
    type: 'MEDIA_PROGRESS',
    occurredAt: at(1, 18, 5),
    title: 'Entertainment',
    summary: 'One Piece · episode 1021',
    xpAwarded: XP_AWARDS.MEDIA_PROGRESS,
    payload: { title: 'One Piece' },
    tags: ['anime'],
  },
  {
    id: 'evt-streak',
    category: 'system',
    type: 'STREAK_UPDATED',
    occurredAt: at(0, 8, 16),
    title: 'Streak updated',
    summary: '12-day streak',
    xpAwarded: XP_AWARDS.STREAK_UPDATED,
    payload: { days: 12 },
    tags: ['streak'],
  },
  {
    id: 'evt-pr',
    category: 'exercise',
    type: 'PERSONAL_RECORD',
    occurredAt: at(2, 12, 10),
    title: 'Personal record',
    summary: 'Bench press · 100 kg',
    xpAwarded: XP_AWARDS.PERSONAL_RECORD,
    payload: { exercise: 'Bench press', weightKg: 100 },
    tags: ['pr', 'bench'],
  },
  {
    id: 'evt-achievement',
    category: 'system',
    type: 'ACHIEVEMENT_UNLOCKED',
    occurredAt: at(3, 9, 0),
    title: 'Achievement unlocked',
    summary: '7-day streak',
    xpAwarded: XP_AWARDS.ACHIEVEMENT_UNLOCKED,
    payload: { key: 'streak-7' },
    tags: ['achievement'],
  },
  {
    id: 'evt-income',
    category: 'finance',
    type: 'INCOME_CREATED',
    occurredAt: at(4, 14, 22),
    title: 'Income',
    summary: 'Freelance · €420',
    xpAwarded: XP_AWARDS.INCOME_CREATED,
    payload: { amount: 420, currency: 'EUR' },
    tags: ['income'],
  },
  {
    id: 'evt-workout-wed',
    category: 'exercise',
    type: 'WORKOUT_COMPLETED',
    occurredAt: at(3, 11, 5),
    title: 'Workout completed',
    summary: 'Back & Biceps',
    xpAwarded: XP_AWARDS.WORKOUT_COMPLETED,
    payload: { volumeKg: 6420 },
    tags: ['workout', 'back'],
  },
];

export const WEEK_ACTIVITY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const SEED_WEEK_ACTIVITY = [1, 3, 5, 2, 4, 6, 2];

export const SEED_MIX_SERIES: { label: string; color: string; values: number[] }[] = [
  { label: 'Exercise', color: '#0091ff', values: [0, 2, 4, 1, 3, 5, 1] },
  { label: 'Habits', color: '#fde047', values: [1, 1, 2, 1, 2, 2, 1] },
  { label: 'Reading', color: '#eab308', values: [0, 1, 1, 2, 1, 2, 0] },
  { label: 'Finance', color: '#a16207', values: [0, 1, 0, 1, 0, 2, 1] },
];

export interface HourlyRow {
  time: string;
  habit: string;
  exercise: string;
  media: string;
  spend: string;
  xp: string;
}

export const SEED_HOURLY_ROWS: HourlyRow[] = [
  { time: 'Sep 12, 11 AM', habit: '—', exercise: '—', media: 'Dune · 20p', spend: '—', xp: '+20' },
  { time: 'Sep 12, 8 AM', habit: 'Water', exercise: 'Chest & Tri', media: '—', spend: '€14.50', xp: '+115' },
  { time: 'Sep 11, 9 PM', habit: 'Journal', exercise: '—', media: 'One Piece · 3ep', spend: '—', xp: '+15' },
  { time: 'Sep 11, 7 AM', habit: 'Walk', exercise: 'Back & Bi', media: '—', spend: '€9.99', xp: '+80' },
  { time: 'Sep 10, 8 PM', habit: 'Read', exercise: '—', media: 'Dune · 25p', spend: '€64.00', xp: '+20' },
  { time: 'Sep 10, 7 AM', habit: 'Water', exercise: 'Push day', media: '—', spend: '—', xp: '+80' },
];

export const SEED_HABITS_DONE = 1;
export const SEED_WORKOUTS = 4;
export const SEED_PAGES = 86;
export const SEED_SPENT = 312;

export interface HeatDay {
  date: string;
  count: 0 | 1 | 2 | 3 | 4;
}

export function buildWeeklyHeatmap(end = new Date(), weekCount = 16): HeatDay[] {
  const endDay = new Date(end);
  endDay.setHours(12, 0, 0, 0);
  const mondayOffset = (endDay.getDay() + 6) % 7;
  const startMonday = new Date(endDay);
  startMonday.setDate(endDay.getDate() - mondayOffset - (weekCount - 1) * 7);

  const cells: HeatDay[] = [];
  const total = weekCount * 7;
  for (let i = 0; i < total; i += 1) {
    const d = new Date(startMonday);
    d.setDate(startMonday.getDate() + i);
    const iso = toIsoDate(d);
    cells.push({ date: iso, count: d > endDay ? 0 : intensityFor(iso, endDay) });
  }
  return cells;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function intensityFor(iso: string, today: Date): 0 | 1 | 2 | 3 | 4 {
  const d = new Date(`${iso}T12:00:00`);
  const diff = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diff < 0) {
    return 0;
  }
  if (diff < KRISTIJAN_STREAK_DAYS) {
    return ([3, 2, 4, 3, 2, 4, 3] as const)[diff % 7];
  }
  const n = iso.split('-').reduce((sum, part) => sum + Number(part), 0);
  if (n % 5 === 0) {
    return 2;
  }
  if (n % 7 === 0) {
    return 1;
  }
  return 0;
}
