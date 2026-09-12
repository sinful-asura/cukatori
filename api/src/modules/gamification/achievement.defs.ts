export type AchievementSeed = {
  key: string;
  title: string;
  summary: string;
  rule: string;
};

export const ACHIEVEMENT_DEFS: AchievementSeed[] = [
  {
    key: 'first_workout',
    title: 'First session',
    summary: 'You completed your first workout.',
    rule: 'first_workout',
  },
  {
    key: 'ten_workouts',
    title: 'Ten sessions',
    summary: 'You completed 10 workouts.',
    rule: 'ten_workouts',
  },
  {
    key: 'seven_day_streak',
    title: '7-day streak',
    summary: 'You kept a 7-day streak going.',
    rule: 'seven_day_streak',
  },
  {
    key: 'level_up',
    title: 'Level up',
    summary: 'You reached a new level.',
    rule: 'level_up',
  },
  {
    key: 'personal_record',
    title: 'Personal record',
    summary: 'You set a personal record.',
    rule: 'personal_record',
  },
];
