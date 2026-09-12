import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ActivityCategory, ActivityType } from '@ascend-os/shared';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { Timeline } from 'primeng/timeline';
import { SettingsStore } from '../settings/settings.store';
import { TimelineStore, type DatePreset } from './timeline.store';

type FilterOption<T> = { label: string; value: T };

@Component({
  selector: 'app-timeline-page',
  imports: [DatePipe, FormsModule, Button, Select, Skeleton, Tag, Timeline],
  templateUrl: './timeline-page.html',
  styleUrl: './timeline-page.scss',
})
export class TimelinePage implements OnInit {
  readonly store = inject(TimelineStore);
  private readonly settings = inject(SettingsStore);

  readonly categories: FilterOption<ActivityCategory>[] = [
    { label: 'Exercise', value: 'exercise' },
    { label: 'Finance', value: 'finance' },
    { label: 'Entertainment', value: 'entertainment' },
    { label: 'Habit', value: 'habit' },
    { label: 'Goal', value: 'goal' },
    { label: 'Journal', value: 'journal' },
    { label: 'System', value: 'system' },
  ];

  readonly types: FilterOption<ActivityType>[] = [
    { label: 'Workout completed', value: 'WORKOUT_COMPLETED' },
    { label: 'Personal record', value: 'PERSONAL_RECORD' },
    { label: 'Habit completed', value: 'HABIT_COMPLETED' },
    { label: 'Goal progressed', value: 'GOAL_PROGRESSED' },
    { label: 'Goal completed', value: 'GOAL_COMPLETED' },
    { label: 'Expense', value: 'EXPENSE_CREATED' },
    { label: 'Income', value: 'INCOME_CREATED' },
    { label: 'Media progress', value: 'MEDIA_PROGRESS' },
    { label: 'Media completed', value: 'MEDIA_COMPLETED' },
    { label: 'Journal', value: 'JOURNAL_CREATED' },
    { label: 'Achievement', value: 'ACHIEVEMENT_UNLOCKED' },
    { label: 'Level up', value: 'LEVEL_UP' },
    { label: 'Streak', value: 'STREAK_UPDATED' },
  ];

  readonly dates: FilterOption<DatePreset>[] = [
    { label: 'All dates', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' },
  ];

  ngOnInit(): void {
    this.settings.applyTheme(this.settings.settings().theme);
    this.store.hydrate();
  }

  tagOptions(): FilterOption<string>[] {
    return this.store.tags().map((tag) => ({ label: `#${tag}`, value: tag }));
  }

  typeLabel(type: string): string {
    return type
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  severity(category: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (category) {
      case 'exercise':
        return 'danger';
      case 'finance':
        return 'info';
      case 'entertainment':
        return 'warn';
      case 'habit':
      case 'goal':
        return 'success';
      case 'journal':
        return 'secondary';
      default:
        return 'contrast';
    }
  }
}
