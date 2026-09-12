/** Static ExerciseDB GIFs used by the Personal OS reference (same CDN URLs). */
const EXERCISE_GIFS: Record<string, string> = {
  'lat pulldown': 'https://static.exercisedb.dev/media/LEprlgG.gif',
  'cable lat pulldown': 'https://static.exercisedb.dev/media/LEprlgG.gif',
  'barbell row': 'https://static.exercisedb.dev/media/eZyBC3j.gif',
  'barbell bent over row': 'https://static.exercisedb.dev/media/eZyBC3j.gif',
  'hammer curl': 'https://static.exercisedb.dev/media/slDvUAU.gif',
  'dumbbell hammer curl': 'https://static.exercisedb.dev/media/slDvUAU.gif',
  'machine chest press': 'https://static.exercisedb.dev/media/jHAnWmT.gif',
  'lever incline chest press': 'https://static.exercisedb.dev/media/jHAnWmT.gif',
  'dumbbell bench press': 'https://static.exercisedb.dev/media/SpYC0Kp.gif',
  'smith machine bench': 'https://static.exercisedb.dev/media/trqKQv2.gif',
  'smith bench press': 'https://static.exercisedb.dev/media/trqKQv2.gif',
  'barbell curl': 'https://static.exercisedb.dev/media/slDvUAU.gif',
  'face pull': 'https://static.exercisedb.dev/media/LEprlgG.gif',
};

const ALIASES: Record<string, string> = {
  'lat pulldown': 'cable lat pulldown',
  'barbell row': 'barbell bent over row',
  'hammer curl': 'dumbbell hammer curl',
  'machine chest press': 'lever incline chest press',
  'smith machine bench': 'smith bench press',
};

export type ExerciseSwap = {
  name: string;
  match: number;
  imageUrl: string | null;
};

export function exerciseMediaUrl(name: string): string | null {
  const key = normalize(name);
  if (EXERCISE_GIFS[key]) {
    return EXERCISE_GIFS[key];
  }
  const alias = ALIASES[key];
  if (alias && EXERCISE_GIFS[alias]) {
    return EXERCISE_GIFS[alias];
  }
  for (const [known, url] of Object.entries(EXERCISE_GIFS)) {
    if (key.includes(known) || known.includes(key)) {
      return url;
    }
  }
  return null;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Personal OS chest alternatives shown on the last-session overview. */
export const DEFAULT_EXERCISE_SWAPS: ExerciseSwap[] = [
  { name: 'Machine Chest Press', match: 88, imageUrl: exerciseMediaUrl('Machine Chest Press') },
  { name: 'Dumbbell Bench Press', match: 92, imageUrl: exerciseMediaUrl('Dumbbell Bench Press') },
  { name: 'Smith Machine Bench', match: 81, imageUrl: exerciseMediaUrl('Smith Machine Bench') },
];
