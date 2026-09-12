import { describe, expect, it } from 'vitest';
import { formatQuickLog, parseQuickLog } from './parse.js';

describe('parseQuickLog', () => {
  it('parses a single bench set with kilos', () => {
    const parsed = parseQuickLog('Bench 100 kilos 8 reps');
    expect(parsed).toEqual({
      kind: 'workout_set',
      exercise: 'Bench Press',
      sets: [{ weightKg: 100, reps: 8 }],
    });
    expect(formatQuickLog(parsed)).toBe('Bench Press 100 kg × 8');
  });

  it('parses multi-set bench shorthand', () => {
    const parsed = parseQuickLog('Bench 100 for 8, 100 for 7, 95 for 9');
    expect(parsed).toEqual({
      kind: 'workout_set',
      exercise: 'Bench Press',
      sets: [
        { weightKg: 100, reps: 8 },
        { weightKg: 100, reps: 7 },
        { weightKg: 95, reps: 9 },
      ],
    });
    expect(formatQuickLog(parsed)).toBe('Bench Press 100 kg × 8, 100 kg × 7, 95 kg × 9');
  });

  it('parses an euro expense', () => {
    const parsed = parseQuickLog('Spent 35 euros on lunch');
    expect(parsed).toEqual({
      kind: 'expense',
      amount: 35,
      currency: 'EUR',
      merchant: 'lunch',
    });
    expect(formatQuickLog(parsed)).toBe('Spent €35 on lunch');
  });

  it('parses finished watching', () => {
    const parsed = parseQuickLog('Finished watching Dune');
    expect(parsed).toEqual({
      kind: 'media_complete',
      verb: 'watching',
      title: 'Dune',
    });
  });

  it('parses page progress', () => {
    const parsed = parseQuickLog('Read 20 pages');
    expect(parsed).toEqual({
      kind: 'media_progress',
      pages: 20,
    });
    expect(formatQuickLog(parsed)).toBe('Read 20 pages');
  });

  it('parses a completed workout', () => {
    expect(parseQuickLog("Completed today's workout")).toEqual({
      kind: 'workout_complete',
    });
  });

  it('leaves unknown text as a stub kind', () => {
    expect(parseQuickLog('hello there')).toEqual({
      kind: 'unknown',
      text: 'hello there',
    });
  });
});
