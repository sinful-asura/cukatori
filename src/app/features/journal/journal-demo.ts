import type { JournalPlaintext } from '@ascend-os/shared/journal';

export type JournalTagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

export interface JournalDemoDraft {
  title: string;
  tags: string[];
  createdAt: string;
  plain: JournalPlaintext;
}

const SESSION_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" fill="none">
  <rect width="640" height="360" fill="#121218"/>
  <rect y="230" width="640" height="130" fill="#0c0c10"/>
  <rect x="268" y="172" width="104" height="14" rx="4" fill="#c4c4cc"/>
  <rect x="210" y="150" width="58" height="58" rx="8" fill="#2a2a32" stroke="#8b8b93"/>
  <rect x="372" y="150" width="58" height="58" rx="8" fill="#2a2a32" stroke="#8b8b93"/>
  <rect x="194" y="158" width="16" height="42" rx="3" fill="#3f3f46"/>
  <rect x="430" y="158" width="16" height="42" rx="3" fill="#3f3f46"/>
</svg>`;

export const JOURNAL_DEMO_DRAFTS: JournalDemoDraft[] = [
  {
    title: 'Great session today',
    tags: ['Great session'],
    createdAt: '2026-09-11T18:20:00.000Z',
    plain: {
      body: 'Felt strong on bench press today. Hit a new personal best after a couple of weeks of consistent training. Need to keep an eye on right shoulder tonight, but overall a great session. Grateful for the time and energy.',
      image: { mime: 'image/svg+xml', data: btoa(SESSION_SVG) },
    },
  },
  {
    title: 'Shoulder discomfort',
    tags: ['Discomfort'],
    createdAt: '2026-08-28T20:05:00.000Z',
    plain: {
      body: 'You marked shoulder discomfort after pressing work. Consider a lighter week on overhead movements and keep notes on how it feels tomorrow.',
    },
  },
  {
    title: 'Trip to Italy',
    tags: ['Travel'],
    createdAt: '2026-07-04T16:40:00.000Z',
    plain: {
      body: 'Long walks through Rome and a quiet morning in Florence. Noted the food, the light, and how much slower the days felt.',
    },
  },
  {
    title: "What I'm grateful for",
    tags: ['Gratitude'],
    createdAt: '2026-07-02T21:10:00.000Z',
    plain: {
      body: 'A full night of sleep, a message from family, and enough energy to train. Small things, stacked.',
    },
  },
];

export function tagSeverity(tag: string): JournalTagSeverity {
  const value = tag.toLowerCase();
  if (/(discomfort|pain|sore)/.test(value)) {
    return 'warn';
  }
  if (/(great|session)/.test(value)) {
    return 'success';
  }
  if (/(travel|trip)/.test(value)) {
    return 'info';
  }
  return 'secondary';
}

export function discomfortNote(title: string, tags: string[]): string | null {
  const blob = `${title} ${tags.join(' ')}`.toLowerCase();
  if (!/(discomfort|pain|sore|soreness)/.test(blob)) {
    return null;
  }
  if (blob.includes('shoulder')) {
    return 'You marked shoulder discomfort';
  }
  return 'You marked discomfort';
}
