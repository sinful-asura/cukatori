import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { Chip } from 'primeng/chip';
import { MeterGroup } from 'primeng/metergroup';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { SettingsStore } from '../settings/settings.store';
import { DashboardStore } from './dashboard.store';

@Component({
  selector: 'app-dashboard-page',
  imports: [FormsModule, RouterLink, Card, Checkbox, Chip, MeterGroup, Skeleton, Tag],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  readonly store = inject(DashboardStore);
  private readonly settings = inject(SettingsStore);

  ngOnInit(): void {
    this.settings.applyTheme(this.settings.settings().theme);
    this.store.hydrate();
  }
}
