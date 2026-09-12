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
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { ProgressBar } from 'primeng/progressbar';
import { Select } from 'primeng/select';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { GoalsApi } from '../../core/api/goals.api';
import {
  PageHeader,
  PosBarChart,
  PosChartToggle,
  PosLineChart,
  PosStat,
  type PosChartMode,
  type PosChartSeries,
} from '../../shared/ui/pos';
import {
  GOAL_MONTHS,
  chartYLabels,
  isOnPace,
  toGoalView,
  type GoalView,
} from './goal-presentation';

type KindOption = { label: string; value: GoalKind };

@Component({
  selector: 'app-goals-page',
  imports: [
    FormsModule,
    AccordionModule,
    Button,
    Card,
    Dialog,
    InputNumber,
    InputText,
    ProgressBar,
    Select,
    Tabs,
    TabList,
    Tab,
    Tag,
    PageHeader,
    PosBarChart,
    PosChartToggle,
    PosLineChart,
    PosStat,
  ],
  templateUrl: './goals-page.html',
  styleUrl: './goals-page.scss',
})
export class GoalsPage implements OnInit {
  private readonly api = inject(GoalsApi);
  private readonly messages = inject(MessageService);

  readonly goals = signal<GoalDto[]>([]);
  readonly tab = signal('active');
  readonly selectedId = signal<string | null>(null);
  readonly chartMode = signal<PosChartMode>('line');
  readonly milestoneOpen = signal<string | number | (string | number)[] | undefined>('m0');
  readonly createOpen = signal(false);
  readonly saving = signal(false);
  readonly usingFallback = signal(false);

  readonly monthLabels = GOAL_MONTHS;

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

  readonly views = computed(() => this.goals().map(toGoalView));

  readonly activeViews = computed(() =>
    this.views()
      .filter((goal) => goal.status !== 'completed')
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  readonly completedViews = computed(() =>
    this.views()
      .filter((goal) => goal.status === 'completed')
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  readonly visibleViews = computed(() =>
    this.tab() === 'completed' ? this.completedViews() : this.activeViews(),
  );

  readonly selected = computed(() => {
    const list = this.visibleViews();
    const id = this.selectedId();
    return list.find((goal) => goal.id === id) ?? list[0] ?? null;
  });

  readonly activeCount = computed(() => String(this.activeViews().length));
  readonly averagePct = computed(() => {
    const rows = this.views();
    if (!rows.length) {
      return '0';
    }
    return String(Math.round(rows.reduce((sum, goal) => sum + goal.percent, 0) / rows.length));
  });
  readonly onPaceCount = computed(() => String(this.views().filter((goal) => isOnPace(goal)).length));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.list().subscribe({
      next: (rows) => {
        this.usingFallback.set(false);
        this.setGoals(rows);
      },
      error: () => {
        this.usingFallback.set(true);
        this.setGoals(DEMO_GOALS.map((goal) => ({ ...goal })));
      },
    });
  }

  onTab(value: string | number | undefined): void {
    if (typeof value === 'string') {
      this.tab.set(value);
    }
  }

  select(id: string): void {
    this.selectedId.set(id);
    this.chartMode.set('line');
    this.milestoneOpen.set('m0');
  }

  series(goal: GoalView): PosChartSeries[] {
    return [{ label: goal.title, color: goal.color, values: goal.series }];
  }

  yLabels(goal: GoalView): string[] {
    return chartYLabels(goal);
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
      this.toast(next, next.status === 'completed');
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
      this.selectedId.set(next.id);
      this.saving.set(false);
      this.createOpen.set(false);
      return;
    }
    this.api.create({ ...this.draft, title }).subscribe({
      next: (goal) => {
        this.goals.update((rows) => [...rows, goal]);
        this.selectedId.set(goal.id);
        this.saving.set(false);
        this.createOpen.set(false);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  private setGoals(rows: GoalDto[]): void {
    this.goals.set(rows);
    if (!this.selectedId() && rows[0]) {
      this.selectedId.set(rows[0].id);
    }
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
