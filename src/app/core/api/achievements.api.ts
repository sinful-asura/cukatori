import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment';

export type AchievementCategory = 'training' | 'consistency' | 'progress' | 'life';

export interface AchievementDto {
  id: string;
  key: string;
  title: string;
  description: string;
  category: AchievementCategory;
  unlockedAt: string | null;
}

export const SEED_ACHIEVEMENTS: AchievementDto[] = [
  {
    id: 'ach-first-workout',
    key: 'first-workout',
    title: 'First session',
    description: 'Logged the first workout.',
    category: 'training',
    unlockedAt: '2026-08-02T09:00:00.000Z',
  },
  {
    id: 'ach-ten-workouts',
    key: 'ten-workouts',
    title: 'Ten sessions',
    description: 'Completed 10 workouts.',
    category: 'training',
    unlockedAt: '2026-08-28T11:10:00.000Z',
  },
  {
    id: 'ach-pr',
    key: 'personal-record',
    title: 'New mark',
    description: 'Recorded a personal record.',
    category: 'training',
    unlockedAt: '2026-09-10T12:10:00.000Z',
  },
  {
    id: 'ach-streak-7',
    key: 'streak-7',
    title: 'Seven-day streak',
    description: 'Showed up seven days in a row.',
    category: 'consistency',
    unlockedAt: '2026-09-09T09:00:00.000Z',
  },
  {
    id: 'ach-streak-12',
    key: 'streak-12',
    title: 'Twelve-day streak',
    description: 'Kept a 12-day streak going.',
    category: 'consistency',
    unlockedAt: '2026-09-12T08:16:00.000Z',
  },
  {
    id: 'ach-level-10',
    key: 'level-10',
    title: 'Level 10',
    description: 'Reached level 10.',
    category: 'progress',
    unlockedAt: '2026-07-18T18:00:00.000Z',
  },
  {
    id: 'ach-level-15',
    key: 'level-15',
    title: 'Level 15',
    description: 'Reached level 15.',
    category: 'progress',
    unlockedAt: '2026-08-20T18:00:00.000Z',
  },
  {
    id: 'ach-level-18',
    key: 'level-18',
    title: 'Level 18',
    description: 'Reached level 18.',
    category: 'progress',
    unlockedAt: '2026-09-01T18:00:00.000Z',
  },
  {
    id: 'ach-level-20',
    key: 'level-20',
    title: 'Level 20',
    description: 'Reach level 20.',
    category: 'progress',
    unlockedAt: null,
  },
  {
    id: 'ach-streak-30',
    key: 'streak-30',
    title: 'Thirty-day streak',
    description: 'Keep a 30-day streak.',
    category: 'consistency',
    unlockedAt: null,
  },
  {
    id: 'ach-hundred-workouts',
    key: 'hundred-workouts',
    title: 'Hundred sessions',
    description: 'Complete 100 workouts.',
    category: 'training',
    unlockedAt: null,
  },
  {
    id: 'ach-books',
    key: 'read-12-books',
    title: 'Shelf complete',
    description: 'Finish the 12-book goal.',
    category: 'life',
    unlockedAt: null,
  },
];

@Injectable({ providedIn: 'root' })
export class AchievementsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/achievements`;

  list(): Observable<AchievementDto[]> {
    return this.http.get<AchievementDto[]>(this.base);
  }
}
