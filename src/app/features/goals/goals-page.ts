import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DEMO_GOALS,
  formatGoalProgress,
  goalPercent,
  type CreateGoalRequest,
  type GoalDto,
  type GoalKind,
} from '@ascend-os/shared/goals';
import { MessageService } from 'primeng/api';
import type { MeterItem } from 'primeng/types/metergroup';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { MeterGroup } from 'primeng/metergroup';
import { Select } from 'primeng/select';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { GoalsApi } from '../../core/api/goals.api';

type KindOption = { label: string; value: GoalKind };

@Component({
  selector: 'app-goals-page',
  imports: [
    NgTemplateOutlet,
    FormsModule,
    Button,
    Card,
    Dialog,
    InputNumber,
    InputText,
    MeterGroup,
    Select,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Tag,
  ],
  templateUrl: './goals-page.html',
  styleUrl: './goals-page.scss',
})
export class GoalsPage implements OnInit {
  private readonly api = inject(GoalsApi);
  private readonly messages = inject(MessageService);

  readonly goals = signal<GoalDto[]>([]);
  readonly tab = signal('active');
  readonly createOpen = signal(false);
  readonly saving = signal(false);
  readonly usingFallback = signal(false);

  readonly kindOptions: KindOption[] = [
    { label: 'Count', value: 'count' },
    { label: 'Currency', value: 'currency' },
    { label: 'Frequency', value: 'frequency' },
  ];

  draft: CreateGoalRequest = {
    title: '',
    kind: 'count',
    target: 12,
    current: 0,
    unit: 'books',
  };

  readonly activeGoals = computed(() =>
    this.goals()
      .filter((goal) => goal.status !== 'completed')
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  readonly completedGoals = computed(() =>
    this.goals()
      .filter((goal) => goal.status === 'completed')
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  readonly visibleGoals = computed(() =>
    this.tab() === 'completed' ? this.completedGoals() : this.activeGoals(),
  );

  readonly progressLabel = formatGoalProgress;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.list().subscribe({
      next: (rows) => {
        this.usingFallback.set(false);
        this.goals.set(rows);
      },
      error: () => {
        this.usingFallback.set(true);
        this.goals.set(DEMO_GOALS.map((goal) => ({ ...goal })));
      },
    });
  }

  onTab(value: string | number | undefined): void {
    if (typeof value === 'string') {
      this.tab.set(value);
    }
  }

  showCompleted(): void {
    this.tab.set('completed');
  }

  meters(goal: GoalDto): MeterItem[] {
    return [{ value: goal.percent, color: '#34d399' }];
  }

  deltaFor(goal: GoalDto): number {
    return goal.kind === 'currency' ? 50 : 1;
  }

  progress(goal: GoalDto): void {
    if (goal.status === 'completed') {
      return;
    }
    const delta = this.deltaFor(goal);
    if (this.usingFallback()) {
      const current = goal.current + delta;
      const next: GoalDto = {
        ...goal,
        current,
        percent: goalPercent(current, goal.target),
        status: current >= goal.target ? 'completed' : goal.status,
      };
      this.replace(next);
      this.toast(next, next.status === 'completed' && goal.status !== 'completed');
      return;
    }
    this.api.progress(goal.id, { delta }).subscribe({
      next: (res) => {
        this.replace(res.goal);
        this.toast(res.goal, res.completedNow);
      },
      error: () => {
        const current = goal.current + delta;
        this.replace({
          ...goal,
          current,
          percent: goalPercent(current, goal.target),
          status: current >= goal.target ? 'completed' : goal.status,
        });
      },
    });
  }

  openCreate(): void {
    this.draft = { title: '', kind: 'count', target: 12, current: 0, unit: 'books' };
    this.createOpen.set(true);
  }

  create(): void {
    const title = this.draft.title.trim();
    if (!title || !this.draft.target || this.saving()) {
      return;
    }
    this.saving.set(true);
    if (this.usingFallback()) {
      const current = this.draft.current ?? 0;
      const next: GoalDto = {
        id: `goal-local-${crypto.randomUUID()}`,
        title,
        kind: this.draft.kind ?? 'count',
        target: this.draft.target,
        current,
        unit: this.draft.unit ?? '',
        deadline: this.draft.deadline ?? null,
        status: current >= this.draft.target ? 'completed' : 'active',
        percent: goalPercent(current, this.draft.target),
        sortOrder: this.goals().length,
      };
      this.goals.update((rows) => [...rows, next]);
      this.saving.set(false);
      this.createOpen.set(false);
      return;
    }
    this.api.create({ ...this.draft, title }).subscribe({
      next: (goal) => {
        this.goals.update((rows) => [...rows, goal]);
        this.saving.set(false);
        this.createOpen.set(false);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  private replace(goal: GoalDto): void {
    this.goals.update((rows) => rows.map((row) => (row.id === goal.id ? goal : row)));
  }

  private toast(goal: GoalDto, completedNow: boolean): void {
    this.messages.add({
      severity: completedNow ? 'success' : 'info',
      summary: goal.title,
      detail: completedNow ? 'Goal completed · +60 XP' : `${formatGoalProgress(goal)} · ${goal.percent}%`,
      life: 2400,
    });
  }
}
