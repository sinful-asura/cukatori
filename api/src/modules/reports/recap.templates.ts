import { formatEur, plural } from './recap.payload.js';

export function fitnessSentence(input: {
  days: number;
  planned: number;
  volumeDeltaPercent: number | null;
  prs: number;
}): string {
  if (input.days === 0) {
    return 'No training days logged this week.';
  }
  const trained = `You trained ${input.days}/${input.planned} planned days`;
  const prs =
    input.prs === 0
      ? 'logged no PRs'
      : `achieved ${input.prs} ${plural(input.prs, 'PR')}`;
  if (input.volumeDeltaPercent == null) {
    return `${trained} and ${prs}.`;
  }
  const direction = input.volumeDeltaPercent >= 0 ? 'increased' : 'decreased';
  return `${trained}, ${direction} volume by ${Math.abs(input.volumeDeltaPercent)}%, and ${prs}.`;
}

export function goalsSentence(input: {
  progressed: number;
  completed: number;
  behindTitle?: string | null;
  behindPercent?: number | null;
}): string {
  if (input.behindTitle && input.behindPercent != null && input.behindPercent > 0) {
    return `Your ${input.behindTitle} goal is ${input.behindPercent}% behind schedule.`;
  }
  if (input.progressed === 0 && input.completed === 0) {
    return 'No goal progress logged this week.';
  }
  const parts: string[] = [];
  if (input.progressed > 0) {
    parts.push(`progressed ${input.progressed} ${plural(input.progressed, 'goal')}`);
  }
  if (input.completed > 0) {
    parts.push(`completed ${input.completed}`);
  }
  return `You ${parts.join(' and ')}.`;
}

export function habitsSentence(input: { completions: number; ratePercent: number | null }): string {
  if (input.completions === 0) {
    return 'No habit check-ins logged this week.';
  }
  if (input.ratePercent == null) {
    return `You completed ${input.completions} habit ${plural(input.completions, 'check-in')} this week.`;
  }
  return `You completed ${input.completions} habits this week (${input.ratePercent}% of the planned check-ins).`;
}

export function entertainmentSentence(input: {
  books: number;
  movies: number;
  anime: number;
  manga: number;
  progress: number;
}): string {
  const finished: string[] = [];
  if (input.books > 0) {
    finished.push(`${input.books} ${plural(input.books, 'book')}`);
  }
  if (input.movies > 0) {
    finished.push(`${input.movies} ${plural(input.movies, 'movie')}`);
  }
  if (input.anime > 0) {
    finished.push(`${input.anime} anime`);
  }
  if (input.manga > 0) {
    finished.push(`${input.manga} manga`);
  }
  if (finished.length === 0 && input.progress === 0) {
    return 'No entertainment progress logged this week.';
  }
  if (finished.length === 0) {
    return `You logged ${input.progress} media ${plural(input.progress, 'update')} this week.`;
  }
  const head =
    finished.length === 1
      ? `You finished ${finished[0]}`
      : `You finished ${finished.slice(0, -1).join(', ')}, and ${finished[finished.length - 1]}`;
  if (input.progress === 0) {
    return `${head} this week.`;
  }
  return `${head}, and logged ${input.progress} media ${plural(input.progress, 'update')}.`;
}

export function financeSentence(input: {
  spent: number;
  income: number;
  category?: string | null;
  categoryDeltaPercent?: number | null;
}): string {
  if (input.category && input.categoryDeltaPercent != null) {
    const direction = input.categoryDeltaPercent >= 0 ? 'more' : 'less';
    return `You spent ${Math.abs(input.categoryDeltaPercent)}% ${direction} on ${input.category} than last week.`;
  }
  if (input.spent === 0 && input.income === 0) {
    return 'No spending or income logged this week.';
  }
  return `You spent ${formatEur(input.spent)} and earned ${formatEur(input.income)} this week.`;
}

export function overallSentence(input: { xp: number; activities: number; longestStreak: number }): string {
  if (input.activities === 0) {
    return 'No activities logged this week.';
  }
  return `You earned ${input.xp.toLocaleString('en-GB')} XP this week and logged ${input.activities} ${plural(input.activities, 'activity', 'activities')}. Longest streak: ${input.longestStreak} ${plural(input.longestStreak, 'day')}.`;
}

export function coachFrequencySentence(input: {
  workouts: number;
  weeks: number;
  perWeek: number;
}): string {
  if (input.workouts === 0) {
    return `No workouts logged in the last ${input.weeks} weeks.`;
  }
  return `You trained ${input.workouts} ${plural(input.workouts, 'time')} over ${input.weeks} weeks (${input.perWeek}/week).`;
}

export function coachVolumeSentence(input: { totalKg: number; deltaPercent: number | null }): string {
  if (input.totalKg <= 0) {
    return 'No lifting volume recorded in this window.';
  }
  if (input.deltaPercent == null) {
    return `Total volume ${Math.round(input.totalKg).toLocaleString('en-GB')} kg.`;
  }
  const direction = input.deltaPercent >= 0 ? 'up' : 'down';
  return `Total volume ${Math.round(input.totalKg).toLocaleString('en-GB')} kg, ${direction} ${Math.abs(input.deltaPercent)}% versus the prior block.`;
}

export function coachConsistencySentence(input: { ratePercent: number; daysTrained: number }): string {
  return `Consistency ${input.ratePercent}% (${input.daysTrained} training ${plural(input.daysTrained, 'day')}).`;
}

export function yearSentence(input: {
  workouts: number;
  prs: number;
  books: number;
  bookTarget: number | null;
  spent: number;
  volumeDeltaPercent: number | null;
  topCategory: string | null;
}): string {
  const books =
    input.bookTarget != null
      ? `${input.books} of ${input.bookTarget} books`
      : `${input.books} ${plural(input.books, 'book')}`;
  const parts = [
    `${input.workouts} ${plural(input.workouts, 'workout')}, ${input.prs} ${plural(input.prs, 'PR')}, ${books}, and ${formatEur(input.spent)} spent.`,
  ];
  if (input.volumeDeltaPercent != null) {
    parts.push(`Volume is ${input.volumeDeltaPercent >= 0 ? 'up' : 'down'} versus last quarter.`);
  }
  if (input.topCategory) {
    parts.push(`${input.topCategory} is the largest spend category.`);
  }
  return parts.join(' ');
}
