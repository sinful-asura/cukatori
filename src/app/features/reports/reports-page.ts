import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import type { CoachReportDto, WeekRecapDto } from '@ascend-os/shared/recap';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Table } from 'primeng/table';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { forkJoin } from 'rxjs';
import { ReportsApi } from '../../core/api/reports.api';

const PRINT_CLASS = 'reports-printing';

@Component({
  selector: 'app-reports-page',
  imports: [Button, Card, Table, Tabs, TabList, Tab, TabPanels, TabPanel, Tag, DatePipe, NgTemplateOutlet],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ReportsPage {
  private readonly api = inject(ReportsApi);

  readonly weekStart = signal<string | undefined>(undefined);
  readonly recap = signal<WeekRecapDto | null>(null);
  readonly coach = signal<CoachReportDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal('fitness');

  readonly rangeLabel = computed(() => {
    const recap = this.recap();
    if (!recap) {
      return '';
    }
    return `${formatUtcDay(recap.start)} – ${formatUtcDay(recap.end)}`;
  });

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      week: this.api.week(this.weekStart()),
      coach: this.api.coach(),
    }).subscribe({
      next: ({ week, coach }) => {
        this.recap.set(week);
        this.coach.set(coach);
        this.weekStart.set(week.start);
        this.loading.set(false);
      },
      error: (err: { status?: number }) => {
        this.error.set(err.status === 401 ? 'Sign in to see your week.' : 'Could not load reports.');
        this.loading.set(false);
      },
    });
  }

  shiftWeek(delta: number): void {
    const start = this.recap()?.start ?? this.weekStart();
    if (!start) {
      return;
    }
    const date = new Date(`${start}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + delta * 7);
    this.weekStart.set(date.toISOString().slice(0, 10));
    this.reload();
  }

  onTab(value: string | number | undefined): void {
    if (value != null) {
      this.activeTab.set(String(value));
    }
  }

  print(): void {
    document.body.classList.add(PRINT_CLASS);
    const cleanup = () => {
      document.body.classList.remove(PRINT_CLASS);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  }
}

function formatUtcDay(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00.000Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
