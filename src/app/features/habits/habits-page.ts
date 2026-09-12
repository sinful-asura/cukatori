import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DEMO_HABITS, xpHintLabel, type HabitDto, type HabitSchedule } from '@ascend-os/shared/habits';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox, type CheckboxChangeEvent } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { HabitsApi } from '../../core/api/habits.api';

type ScheduleOption = { label: string; value: HabitSchedule };

@Component({
  selector: 'app-habits-page',
  imports: [
    NgTemplateOutlet,
    FormsModule,
    Button,
    Card,
    Checkbox,
    Dialog,
    InputNumber,
    InputText,
    Select,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Tag,
  ],
  templateUrl: './habits-page.html',
  styleUrl: './habits-page.scss',
})
export class HabitsPage implements OnInit {
  private readonly api = inject(HabitsApi);
  private readonly messages = inject(MessageService);

  readonly habits = signal<HabitDto[]>([]);
  readonly tab = signal('today');
  readonly createOpen = signal(false);
  readonly saving = signal(false);
  readonly usingFallback = signal(false);

  readonly scheduleOptions: ScheduleOption[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekdays', value: 'weekdays' },
    { label: 'Weekly', value: 'weekly' },
  ];

  draft = {
    title: '',
    schedule: 'daily' as HabitSchedule,
    xpHint: 25,
  };

  readonly todayHabits = computed(() =>
    this.habits()
      .filter((habit) => habit.schedule === 'daily' || habit.schedule === 'weekdays')
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  readonly allHabits = computed(() => this.habits().slice().sort((a, b) => a.sortOrder - b.sortOrder));

  readonly visibleHabits = computed(() => (this.tab() === 'all' ? this.allHabits() : this.todayHabits()));

  readonly xpLabel = xpHintLabel;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.list().subscribe({
      next: (rows) => {
        this.usingFallback.set(false);
        this.habits.set(rows);
      },
      error: () => {
        this.usingFallback.set(true);
        this.habits.set(DEMO_HABITS.map((habit) => ({ ...habit })));
      },
    });
  }

  onTab(value: string | number | undefined): void {
    if (typeof value === 'string') {
      this.tab.set(value);
    }
  }

  showAll(): void {
    this.tab.set('all');
  }

  onCheck(habit: HabitDto, event: CheckboxChangeEvent): void {
    if (!event.checked || habit.completedToday) {
      return;
    }
    this.complete(habit);
  }

  complete(habit: HabitDto): void {
    if (this.usingFallback()) {
      this.replace({ ...habit, completedToday: true, lastCompletedAt: new Date().toISOString() });
      this.toast(habit);
      return;
    }
    this.api.complete(habit.id).subscribe({
      next: (res) => {
        this.replace(res.habit);
        if (!res.alreadyCompleted) {
          this.toast(res.habit);
        }
      },
      error: () => {
        this.replace({ ...habit, completedToday: true, lastCompletedAt: new Date().toISOString() });
        this.toast(habit);
      },
    });
  }

  openCreate(): void {
    this.draft = { title: '', schedule: 'daily', xpHint: 25 };
    this.createOpen.set(true);
  }

  create(): void {
    const title = this.draft.title.trim();
    if (!title || this.saving()) {
      return;
    }
    this.saving.set(true);
    if (this.usingFallback()) {
      const next: HabitDto = {
        id: `habit-local-${crypto.randomUUID()}`,
        title,
        schedule: this.draft.schedule,
        xpHint: this.draft.xpHint,
        completedToday: false,
        lastCompletedAt: null,
        sortOrder: this.habits().length,
      };
      this.habits.update((rows) => [...rows, next]);
      this.saving.set(false);
      this.createOpen.set(false);
      this.tab.set('all');
      return;
    }
    this.api
      .create({ title, schedule: this.draft.schedule, xpHint: this.draft.xpHint })
      .subscribe({
        next: (habit) => {
          this.habits.update((rows) => [...rows, habit]);
          this.saving.set(false);
          this.createOpen.set(false);
          this.tab.set('all');
        },
        error: () => {
          this.saving.set(false);
        },
      });
  }

  private replace(habit: HabitDto): void {
    this.habits.update((rows) => rows.map((row) => (row.id === habit.id ? habit : row)));
  }

  private toast(habit: HabitDto): void {
    this.messages.add({
      severity: 'success',
      summary: habit.title,
      detail: xpHintLabel(habit.xpHint),
      life: 2400,
    });
  }
}
