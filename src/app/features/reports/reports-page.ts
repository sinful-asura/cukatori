import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import type { CoachReportDto, PeriodRecapDto, RecapRow, RecapSeries, WeekRecapDto } from '@ascend-os/shared/recap';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Table } from 'primeng/table';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { forkJoin } from 'rxjs';
import { ReportsApi } from '../../core/api/reports.api';
import { PageHeader, PosBarChart, PosStat } from '../../shared/ui/pos';

const PRINT_CLASS = 'reports-printing';

type RangeTab = 'week' | 'month' | 'year';

@Component({
  selector: 'app-reports-page',
  imports: [
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    Button,
    Card,
    DatePipe,
    NgTemplateOutlet,
    PageHeader,
    PosBarChart,
    PosStat,
    Table,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tag,
  ],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ReportsPage {
  private readonly api = inject(ReportsApi);

  readonly cursor = signal<string | undefined>(undefined);
  readonly recap = signal<WeekRecapDto | null>(null);
  readonly month = signal<PeriodRecapDto | null>(null);
  readonly year = signal<PeriodRecapDto | null>(null);
  readonly coach = signal<CoachReportDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly rangeTab = signal<RangeTab>('week');
  openHighlight: string | number | (string | number)[] | null | undefined = 'fitness';

  readonly rangeLabel = computed(() => {
    const tab = this.rangeTab();
    if (tab === 'month') {
      const month = this.month();
      return month ? `${formatUtcDay(month.start)} – ${formatUtcDay(month.end)}` : '';
    }
    if (tab === 'year') {
      const year = this.year();
      return year ? `${formatUtcDay(year.start)} – ${formatUtcDay(year.end)}` : '';
    }
    const recap = this.recap();
    return recap ? `${formatUtcDay(recap.start)} – ${formatUtcDay(recap.end)}` : '';
  });

  readonly weekActivity = computed(() => this.recap()?.activity ?? emptySeries());
  readonly monthActivity = computed(() => this.month()?.activity ?? emptySeries());
  readonly weekInsight = computed(() => {
    const recap = this.recap();
    if (!recap) {
      return '';
    }
    return recap.insight || recap.insights.join(' ');
  });
  readonly weekHighlights = computed(() => this.recap()?.highlights ?? []);

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    const start = this.cursor();
    forkJoin({
      week: this.api.week(start),
      month: this.api.period('month', start),
      year: this.api.period('year', start),
      coach: this.api.coach(),
    }).subscribe({
      next: ({ week, month, year, coach }) => {
        this.recap.set(week);
        this.month.set(month);
        this.year.set(year);
        this.coach.set(coach);
        this.cursor.set(start ?? week.start);
        this.loading.set(false);
      },
      error: (err: { status?: number }) => {
        this.error.set(err.status === 401 ? 'Sign in to see your week.' : 'Could not load reports.');
        this.loading.set(false);
      },
    });
  }

  onRange(value: string | number | undefined): void {
    if (value === 'week' || value === 'month' || value === 'year') {
      this.rangeTab.set(value);
    }
  }

  shift(delta: number): void {
    const tab = this.rangeTab();
    if (tab === 'month') {
      const start = this.month()?.start;
      if (!start) {
        return;
      }
      const date = parseUtc(start);
      date.setUTCMonth(date.getUTCMonth() + delta);
      this.cursor.set(isoUtc(date));
      this.reload();
      return;
    }
    if (tab === 'year') {
      const start = this.year()?.start;
      if (!start) {
        return;
      }
      const date = parseUtc(start);
      date.setUTCFullYear(date.getUTCFullYear() + delta);
      this.cursor.set(isoUtc(date));
      this.reload();
      return;
    }
    const start = this.recap()?.start ?? this.cursor();
    if (!start) {
      return;
    }
    const date = parseUtc(start);
    date.setUTCDate(date.getUTCDate() + delta * 7);
    this.cursor.set(isoUtc(date));
    this.reload();
  }

  rowsFor(week: WeekRecapDto, id: string): RecapRow[] {
    return week.sections.find((section) => section.id === id)?.rows ?? [];
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

function emptySeries(): RecapSeries {
  return { title: 'Activity', labels: [], values: [], yLabels: ['1', '0'] };
}

function parseUtc(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function isoUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatUtcDay(isoDate: string): string {
  return parseUtc(isoDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
