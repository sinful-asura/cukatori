import type { JournalPlaintext } from '@ascend-os/shared/journal';

export type JournalTagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

export interface JournalDemoDraft {
  title: string;
  tags: string[];
  createdAt: string;
  plain: JournalPlaintext;
}

export interface JournalWeekStub {
  workouts: number;
  prs: number;
  booksPages: number;
  spent: number;
  insight: string;
  stillOpen: string;
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

/** Client-only drafts. Encrypted before POST — API never sees plaintext bodies. */
export const JOURNAL_DEMO_DRAFTS: JournalDemoDraft[] = [
  {
    title: 'Great session today',
    tags: ['#progress', '#gym'],
    createdAt: '2026-09-12T12:00:00.000Z',
    plain: {
      body: 'Hit three PRs on back day. Energy was high after a solid sleep. Lat pulldown felt locked in — kept rest short and focused on form. Evening: 25 pages of Dune.',
      image: { mime: 'image/svg+xml', data: btoa(SESSION_SVG) },
    },
  },
  {
    title: 'Quiet morning',
    tags: ['#mindset'],
    createdAt: '2026-09-11T12:00:00.000Z',
    plain: {
      body: 'Slower start. Kept the habit streak alive with a short walk and a simple breakfast log.',
    },
  },
  {
    title: 'Reading on the train',
    tags: ['#reading'],
    createdAt: '2026-09-10T12:00:00.000Z',
    plain: {
      body: 'Forty pages of Dune before the city even started. The train was quiet enough to stay in the chapter. Logged it as soon as I sat down at the desk.',
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
];

/** Local stub so Journal “This week” matches Personal OS without the reports module. */
export const JOURNAL_WEEK_STUB: JournalWeekStub = {
  workouts: 4,
  prs: 3,
  booksPages: 86,
  spent: 312,
  insight:
    'You trained 4/4 planned days, increased volume by 8%, and hit 3 PRs. Reading is on pace; dining spend is 22% above last week.',
  stillOpen: 'Log today’s expenses, finish 20 pages of Dune, and keep the water habit above 3L.',
};

export function tagSeverity(tag: string): JournalTagSeverity {
  const value = tag.toLowerCase();
  if (/(discomfort|pain|sore)/.test(value)) {
    return 'warn';
  }
  if (/(great|session|progress|gym)/.test(value)) {
    return 'success';
  }
  if (/(travel|trip|reading)/.test(value)) {
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

export function entryExcerpt(body: string, max = 110): string {
  const text = body.replace(/\s+/g, ' ').trim();
  if (!text) {
    return '';
  }
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max).trimEnd()}…`;
}
