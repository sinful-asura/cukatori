import type { CelebrationHint, ParsedQuickLog } from './nlp.types.js';
import type { ActivityEventDto } from '../../contracts/activity.js';

export const EXERCISE_QUICK_LOG_HANDLER = 'ExerciseQuickLogHandler';
export const FINANCE_QUICK_LOG_HANDLER = 'FinanceQuickLogHandler';
export const ENTERTAINMENT_QUICK_LOG_HANDLER = 'EntertainmentQuickLogHandler';
export const HABITS_QUICK_LOG_HANDLER = 'HabitsQuickLogHandler';
export const JOURNAL_QUICK_LOG_HANDLER = 'JournalQuickLogHandler';

export const HANDLER_TOKEN_BY_KIND: Record<Exclude<ParsedQuickLog['kind'], 'unknown'>, string> = {
  workout_set: EXERCISE_QUICK_LOG_HANDLER,
  workout_complete: EXERCISE_QUICK_LOG_HANDLER,
  expense: FINANCE_QUICK_LOG_HANDLER,
  media_complete: ENTERTAINMENT_QUICK_LOG_HANDLER,
  media_progress: ENTERTAINMENT_QUICK_LOG_HANDLER,
  habit: HABITS_QUICK_LOG_HANDLER,
  journal: JOURNAL_QUICK_LOG_HANDLER,
};

export interface QuickLogHandlerResult {
  dispatchedTo: string;
  activity?: ActivityEventDto;
  celebrations?: CelebrationHint[];
}

export interface QuickLogHandler {
  handle(userId: string, parsed: ParsedQuickLog, raw: string): Promise<QuickLogHandlerResult | null>;
}
