import type { ParsedQuickLog, WorkoutSet } from './types';

const EXERCISE_ALIASES: Array<{ match: RegExp; name: string }> = [
  { match: /^(bench(?:\s+press)?)$/i, name: 'Bench Press' },
  { match: /^(incline\s+bench(?:\s+press)?)$/i, name: 'Incline Bench Press' },
  { match: /^(ohp|overhead(?:\s+press)?|shoulder\s+press)$/i, name: 'Overhead Press' },
  { match: /^(squat|back\s+squat)$/i, name: 'Back Squat' },
  { match: /^(front\s+squat)$/i, name: 'Front Squat' },
  { match: /^(deadlift|dl)$/i, name: 'Deadlift' },
  { match: /^(rdl|romanian\s+deadlift)$/i, name: 'Romanian Deadlift' },
  { match: /^(barbell\s+row|row)$/i, name: 'Barbell Row' },
  { match: /^(pull[-\s]?ups?)$/i, name: 'Pull-Up' },
  { match: /^(chin[-\s]?ups?)$/i, name: 'Chin-Up' },
  { match: /^(curl|bicep(?:s)?\s+curl|barbell\s+curl)$/i, name: 'Barbell Curl' },
];

const SET_FOR =
  /(\d+(?:[.,]\d+)?)\s*(?:kg|kilos?|kilo)?\s*(?:x|×|for|@)\s*(\d+)\s*(?:reps?)?/gi;
const SET_KG_REPS = /(\d+(?:[.,]\d+)?)\s*(?:kg|kilos?|kilo)\s+(\d+)\s*(?:reps?)?/gi;

export function parseQuickLog(input: string): ParsedQuickLog {
  const text = collapse(input);
  if (!text) {
    return { kind: 'unknown', text: '' };
  }

  const workoutDone = parseWorkoutComplete(text);
  if (workoutDone) {
    return workoutDone;
  }

  const expense = parseExpense(text);
  if (expense) {
    return expense;
  }

  const mediaDone = parseMediaComplete(text);
  if (mediaDone) {
    return mediaDone;
  }

  const mediaProgress = parseMediaProgress(text);
  if (mediaProgress) {
    return mediaProgress;
  }

  const habit = parseHabit(text);
  if (habit) {
    return habit;
  }

  const journal = parseJournal(text);
  if (journal) {
    return journal;
  }

  const sets = parseWorkoutSets(text);
  if (sets) {
    return sets;
  }

  return { kind: 'unknown', text };
}

export function formatQuickLog(parsed: ParsedQuickLog): string {
  switch (parsed.kind) {
    case 'workout_set':
      return `${parsed.exercise} ${parsed.sets.map((set) => `${trimNum(set.weightKg)} kg × ${set.reps}`).join(', ')}`;
    case 'workout_complete':
      return "Completed today's workout";
    case 'expense': {
      const where = parsed.merchant ? ` on ${parsed.merchant}` : '';
      return `Spent €${trimNum(parsed.amount)}${where}`;
    }
    case 'media_complete':
      return `Finished ${parsed.verb} ${parsed.title}`;
    case 'media_progress':
      if (parsed.pages != null) {
        return parsed.title
          ? `Read ${parsed.pages} pages of ${parsed.title}`
          : `Read ${parsed.pages} pages`;
      }
      return parsed.title ? `Progress on ${parsed.title}` : 'Media progress';
    case 'habit':
      return `Completed ${parsed.title}`;
    case 'journal':
      return parsed.title ? `Journal: ${parsed.title}` : 'Journal entry';
    default:
      return parsed.text;
  }
}

function parseWorkoutComplete(text: string): ParsedQuickLog | null {
  if (/^(?:completed|finished|logged)\s+(?:today['’]?s\s+)?workout$/i.test(text)) {
    return { kind: 'workout_complete' };
  }
  return null;
}

function parseExpense(text: string): ParsedQuickLog | null {
  const withCurrency = text.match(
    /^(?:spent|paid)\s+(\d+(?:[.,]\d+)?)\s*(?:€|euros?|eur)\s*(?:on|at|for)?\s*(.*)$/i,
  );
  if (withCurrency) {
    return expenseOf(withCurrency[1], withCurrency[2]);
  }
  const bare = text.match(/^(?:spent|paid)\s+(\d+(?:[.,]\d+)?)\s+(?:on|at|for)\s+(.+)$/i);
  if (bare) {
    return expenseOf(bare[1], bare[2]);
  }
  const leadingEuro = text.match(/^€\s*(\d+(?:[.,]\d+)?)\s+(?:on|at|for)\s+(.+)$/i);
  if (leadingEuro) {
    return expenseOf(leadingEuro[1], leadingEuro[2]);
  }
  return null;
}

function expenseOf(amountRaw: string, merchantRaw: string | undefined): ParsedQuickLog {
  const merchant = merchantRaw?.trim().replace(/^[.]+/, '').trim();
  return {
    kind: 'expense',
    amount: toNumber(amountRaw),
    currency: 'EUR',
    ...(merchant ? { merchant } : {}),
  };
}

function parseMediaComplete(text: string): ParsedQuickLog | null {
  const watching = text.match(/^(?:finished|completed)\s+watching\s+(.+)$/i);
  if (watching) {
    return { kind: 'media_complete', verb: 'watching', title: titleCase(watching[1]) };
  }
  const reading = text.match(/^(?:finished|completed)\s+reading\s+(.+)$/i);
  if (reading) {
    return { kind: 'media_complete', verb: 'reading', title: titleCase(reading[1]) };
  }
  return null;
}

function parseMediaProgress(text: string): ParsedQuickLog | null {
  const pages = text.match(/^read\s+(\d+)\s+pages?(?:\s+(?:of|from)\s+(.+))?$/i);
  if (pages) {
    return {
      kind: 'media_progress',
      pages: Number(pages[1]),
      ...(pages[2] ? { title: titleCase(pages[2]) } : {}),
    };
  }
  return null;
}

function parseHabit(text: string): ParsedQuickLog | null {
  const labeled = text.match(/^(?:completed|logged)\s+habit\s+(.+)$/i);
  if (labeled) {
    return { kind: 'habit', title: titleCase(labeled[1]) };
  }
  const prefix = text.match(/^habit(?:\s+completed)?:\s*(.+)$/i);
  if (prefix) {
    return { kind: 'habit', title: titleCase(prefix[1]) };
  }
  return null;
}

function parseJournal(text: string): ParsedQuickLog | null {
  const match = text.match(/^journal(?:ed)?(?:\s*[:—-]\s*|\s+)(.+)$/i);
  if (match) {
    return { kind: 'journal', title: titleCase(match[1]) };
  }
  if (/^journal(?:ed)?$/i.test(text)) {
    return { kind: 'journal' };
  }
  return null;
}

function parseWorkoutSets(text: string): ParsedQuickLog | null {
  const digitAt = text.search(/\d/);
  if (digitAt <= 0) {
    return null;
  }
  const namePart = text.slice(0, digitAt).trim();
  const rest = text.slice(digitAt);
  if (!namePart) {
    return null;
  }

  let sets = collectSets(rest, SET_FOR);
  if (!sets.length) {
    sets = collectSets(rest, SET_KG_REPS);
  }
  if (!sets.length) {
    return null;
  }

  return {
    kind: 'workout_set',
    exercise: resolveExercise(namePart),
    sets,
  };
}

function collectSets(source: string, pattern: RegExp): WorkoutSet[] {
  const sets: WorkoutSet[] = [];
  const regex = new RegExp(pattern.source, pattern.flags);
  for (const match of source.matchAll(regex)) {
    sets.push({ weightKg: toNumber(match[1]), reps: Number(match[2]) });
  }
  return sets;
}

function resolveExercise(raw: string): string {
  const cleaned = raw.replace(/[.,]+$/g, '').trim();
  for (const alias of EXERCISE_ALIASES) {
    if (alias.match.test(cleaned)) {
      return alias.name;
    }
  }
  return titleCase(cleaned);
}

function collapse(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function toNumber(raw: string): number {
  return Number(raw.replace(',', '.'));
}

function trimNum(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}

function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (/^(and|of|the|a|an)$/i.test(word)) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
