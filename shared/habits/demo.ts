import type { HabitDto } from './types';

/** Landing Today list: gym / read 20 pages / expenses / water. */
export const DEMO_HABITS: HabitDto[] = [
  {
    id: 'habit-gym',
    title: 'Gym time',
    schedule: 'daily',
    xpHint: 100,
    completedToday: false,
    lastCompletedAt: null,
    sortOrder: 0,
  },
  {
    id: 'habit-pages',
    title: 'Read 20 pages',
    schedule: 'daily',
    xpHint: 20,
    completedToday: false,
    lastCompletedAt: null,
    sortOrder: 1,
  },
  {
    id: 'habit-expenses',
    title: "Log today's expenses",
    schedule: 'daily',
    xpHint: 10,
    completedToday: false,
    lastCompletedAt: null,
    sortOrder: 2,
  },
  {
    id: 'habit-water',
    title: 'Drink 2L of water',
    schedule: 'daily',
    xpHint: 10,
    completedToday: false,
    lastCompletedAt: null,
    sortOrder: 3,
  },
];

export function xpHintLabel(xp: number): string {
  return `+${xp} XP`;
}
