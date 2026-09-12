import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { timeout } from 'rxjs';
import { Badge } from 'primeng/badge';
import { Card } from 'primeng/card';
import { Skeleton } from 'primeng/skeleton';
import {
  AchievementsApi,
  SEED_ACHIEVEMENTS,
  type AchievementDto,
} from '../../core/api/achievements.api';
import { PageHeader } from '../../shared/ui/pos';
import { SettingsStore } from '../settings/settings.store';

@Component({
  selector: 'app-achievements-page',
  imports: [DatePipe, Badge, Card, Skeleton, PageHeader],
  templateUrl: './achievements-page.html',
  styleUrl: './achievements-page.scss',
})
export class AchievementsPage implements OnInit {
  private readonly api = inject(AchievementsApi);
  private readonly settings = inject(SettingsStore);

  readonly loading = signal(false);
  readonly items = signal<AchievementDto[]>(SEED_ACHIEVEMENTS);

  readonly unlocked = computed(() => this.items().filter((item) => item.unlockedAt));
  readonly locked = computed(() => this.items().filter((item) => !item.unlockedAt));
  readonly grid = computed(() => [...this.unlocked(), ...this.locked()]);

  ngOnInit(): void {
    this.settings.applyTheme(this.settings.settings().theme);
    this.api
      .list()
      .pipe(timeout(2000))
      .subscribe({
        next: (rows) => {
          if (rows.length) {
            this.items.set(rows);
          }
        },
        error: () => undefined,
      });
  }
}
