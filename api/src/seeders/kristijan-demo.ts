export const KRISTIJAN_EMAIL = 'kristijan@local';
export const KRISTIJAN_PASSWORD = 'ascend';
export const DEMO_TODAY = '2026-09-11';

export const KRISTIJAN_DEMO = {
  slug: 'kristijan-landing',
  user: {
    email: KRISTIJAN_EMAIL,
    displayName: 'Kristijan',
    timezone: 'Europe/Belgrade',
    theme: 'dark',
  },
  gamification: {
    level: 18,
    xpInto: 2840,
    xpNext: 3000,
    streakDays: 12,
    quote: 'Discipline today, freedom tomorrow.',
  },
  exercise: {
    lastSession: {
      name: 'Back & Biceps',
      date: '2026-09-10',
      durationMin: 48,
      volumeKg: 6420,
      sets: 14,
      prs: 3,
      deltaPct: 8,
    },
  },
  finance: {
    month: '2026-09',
    spendEur: 2431,
    incomeEur: 4200,
    leftoverEur: 1769,
  },
  entertainment: {
    watching: 'One Piece',
    reading: 'Dune',
    hours: 42,
    completed: 7,
    rating: 4.5,
    streak: 3,
  },
  habits: [
    { title: 'Gym time', xpHint: 100, done: true },
    { title: 'Read 20 pages', xpHint: 20, done: true },
    { title: "Log today's expenses", xpHint: 10, done: false },
    { title: 'Drink 2L of water', xpHint: 10, done: false },
    { title: 'Review goals', xpHint: 0, done: false },
    { title: 'Journal entry', xpHint: 15, done: false },
  ],
  goals: [
    { title: 'Read 12 books', current: 8, target: 12, unit: 'books', percent: 67 },
    { title: 'Save €2,000', current: 650, target: 2000, unit: 'EUR', percent: 48 },
    { title: 'Workout 3× per week', current: 8, target: 10, unit: 'sessions', percent: 80 },
  ],
  journal: [
    { title: 'Great session today', iv: 'AAECAwQFBgcICQoLDA0ODw==', ciphertext: 'q8K3n1p0xY4mVw9c2e0=' },
    { title: 'Shoulder discomfort', iv: 'EBESExQVFhcYGRobHB0eHw==', ciphertext: 'mN4tL0sQa2x8vR1b7c=' },
    { title: 'Trip to Italy', iv: 'ICEiIyQlJicoKSorLC0uLw==', ciphertext: 'uPq9wE2zH5kL0n8d4=' },
    { title: "What I'm grateful for", iv: 'MDEyMzQ1Njc4OTo7PD0+Pw==', ciphertext: 'zR7cV2aB1oT6yS3=' },
  ],
} as const;

export type KristijanDemo = typeof KRISTIJAN_DEMO;
