import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { Table } from 'primeng/table';
import {
  PageHeader,
  PosBarChart,
  PosChartToggle,
  type PosChartMode,
  PosLineChart,
  PosPanelHeader,
  PosStat,
} from '../../shared/ui/pos';
import { SettingsStore } from '../settings/settings.store';
import { DashboardStore, type ModuleFilter, type RangeFilter } from './dashboard.store';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    FormsModule,
    Button,
    Card,
    Select,
    Skeleton,
    Table,
    PageHeader,
    PosBarChart,
    PosChartToggle,
    PosLineChart,
    PosPanelHeader,
    PosStat,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  readonly store = inject(DashboardStore);
  private readonly settings = inject(SettingsStore);

  readonly activityMode = signal<PosChartMode>('line');
  readonly mixMode = signal<PosChartMode>('line');

  readonly moduleOptions: { label: string; value: ModuleFilter }[] = [
    { label: 'All modules', value: 'all' },
    { label: 'Exercise', value: 'exercise' },
    { label: 'Habits', value: 'habit' },
    { label: 'Reading', value: 'entertainment' },
    { label: 'Finance', value: 'finance' },
  ];

  readonly rangeOptions: { label: string; value: RangeFilter }[] = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 14 days', value: 14 },
    { label: 'Last 30 days', value: 30 },
  ];

  ngOnInit(): void {
    this.settings.applyTheme(this.settings.settings().theme);
    this.store.hydrate();
  }
}
