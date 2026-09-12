/** Keep in sync with `shared/exercise/math`. Nest cannot import repo-root shared/. */

export function estimated1Rm(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) {
    return 0;
  }
  if (reps === 1) {
    return round1(weightKg);
  }
  return round1(weightKg * (1 + reps / 30));
}

export function setVolume(weightKg: number, reps: number): number {
  return Math.round(weightKg * reps);
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function volumeChangePct(current: number, previous: number): number {
  if (previous <= 0) {
    return 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export function formatKg(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} kg`;
}

export const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Chest',
  'front-delts': 'Front Delts',
  'side-delts': 'Side Delts',
  'rear-delts': 'Rear Delts',
  lats: 'Lats',
  traps: 'Traps',
  'upper-back': 'Upper Back',
  'lower-back': 'Lower Back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  obliques: 'Obliques',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  adductors: 'Adductors',
  abductors: 'Abductors',
};

export function muscleLabel(slug: string): string {
  return MUSCLE_LABELS[slug] ?? slug.replace(/-/g, ' ');
}

export function sessionCopy(input: {
  title: string;
  durationMin: number;
  setCount: number;
  volumeKg: number;
  volumeChangePct: number | null;
  prCount: number;
}): string {
  const volume = formatKg(input.volumeKg);
  const change =
    input.volumeChangePct == null
      ? 'no prior equivalent session to compare'
      : `possible ${input.volumeChangePct > 0 ? '+' : ''}${input.volumeChangePct}% vs last equivalent session`;
  const prs =
    input.prCount === 0
      ? 'no new personal records logged'
      : `${input.prCount} personal record${input.prCount === 1 ? '' : 's'} logged`;
  return `${input.title} — ${input.durationMin} min, ${input.setCount} sets, ${volume} total volume, ${change}, ${prs}.`;
}

export interface MuscleMixItem {
  muscle: string;
  label: string;
  volumeKg: number;
  percent: number;
}

export function buildMuscleMix(
  contributions: Array<{ muscle: string; volumeKg: number }>,
): MuscleMixItem[] {
  const totals = new Map<string, number>();
  for (const row of contributions) {
    if (row.volumeKg <= 0) {
      continue;
    }
    totals.set(row.muscle, (totals.get(row.muscle) ?? 0) + row.volumeKg);
  }
  const grand = [...totals.values()].reduce((sum, value) => sum + value, 0);
  if (grand <= 0) {
    return [];
  }
  return [...totals.entries()]
    .map(([muscle, volumeKg]) => ({
      muscle,
      label: muscleLabel(muscle),
      volumeKg: Math.round(volumeKg),
      percent: Math.round((volumeKg / grand) * 100),
    }))
    .sort((a, b) => b.volumeKg - a.volumeKg);
}
