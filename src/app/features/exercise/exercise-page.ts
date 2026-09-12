import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { ProgressBar } from 'primeng/progressbar';
import { Select } from 'primeng/select';
import { Table } from 'primeng/table';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import {
  formatKg,
  muscleLabel,
  MUSCLE_LABELS,
  type ExerciseDto,
  type MuscleSlug,
  type PersonalRecordDto,
  type WorkoutDto,
} from '@ascend-os/shared/exercise';
import { ExerciseApi } from '../../core/api/exercise.api';
import {
  FALLBACK_CATALOG,
  FALLBACK_LAST_SESSION,
  FALLBACK_PREVIOUS_SESSION,
  FALLBACK_PRS,
} from './exercise-fallback';

@Component({
  selector: 'app-exercise-page',
  imports: [
    FormsModule,
    DatePipe,
    Button,
    Card,
    Dialog,
    IconField,
    InputIcon,
    InputNumber,
    InputText,
    ProgressBar,
    Select,
    Table,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Tag,
  ],
  templateUrl: './exercise-page.html',
  styleUrl: './exercise-page.scss',
})
export class ExercisePage implements OnInit {
  private readonly api = inject(ExerciseApi);
  private readonly messages = inject(MessageService);

  readonly tab = signal('overview');
  readonly loading = signal(true);
  readonly usingFallback = signal(false);

  readonly workouts = signal<WorkoutDto[]>([]);
  readonly catalog = signal<ExerciseDto[]>([]);
  readonly prs = signal<PersonalRecordDto[]>([]);

  readonly catalogQuery = signal('');
  readonly catalogMuscle = signal<string | null>(null);

  readonly logOpen = signal(false);
  readonly saving = signal(false);
  logTitle = 'Back & Biceps';
  draftExerciseId: string | null = null;
  draftWeight = 60;
  draftReps = 8;
  readonly draft = signal<WorkoutDto | null>(null);

  readonly lastSession = computed(() => {
    const completed = this.workouts()
      .filter((workout) => workout.status === 'completed')
      .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
    return completed[0] ?? null;
  });

  readonly filteredCatalog = computed(() => {
    const q = this.catalogQuery().trim().toLowerCase();
    const muscle = this.catalogMuscle();
    return this.catalog().filter((exercise) => {
      if (muscle && exercise.primaryMuscle !== muscle && !exercise.secondaryMuscles.includes(muscle as MuscleSlug)) {
        return false;
      }
      if (!q) {
        return true;
      }
      const haystack = [exercise.name, exercise.slug, ...exercise.aliases].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  });

  readonly exerciseOptions = computed(() =>
    this.catalog().map((exercise) => ({ label: exercise.name, value: exercise.id })),
  );

  readonly muscleOptions = Object.entries(MUSCLE_LABELS).map(([value, label]) => ({ label, value }));

  readonly muscleVolume = computed(() => {
    const totals = new Map<string, number>();
    for (const workout of this.workouts().filter((row) => row.status === 'completed')) {
      for (const item of workout.summary?.muscleMix ?? []) {
        totals.set(item.muscle, (totals.get(item.muscle) ?? 0) + item.volumeKg);
      }
    }
    const grand = [...totals.values()].reduce((sum, value) => sum + value, 0);
    return [...totals.entries()]
      .map(([muscle, volumeKg]) => ({
        muscle,
        label: muscleLabel(muscle),
        volumeKg,
        percent: grand ? Math.round((volumeKg / grand) * 100) : 0,
      }))
      .sort((a, b) => b.volumeKg - a.volumeKg);
  });

  readonly recentPrs = computed(() => this.prs().slice(0, 6));

  ngOnInit(): void {
    this.reload();
  }

  onTabChange(value: string | number | undefined): void {
    this.tab.set(value == null ? 'overview' : String(value));
  }

  reload(): void {
    this.loading.set(true);
    this.api.listWorkouts().subscribe({
      next: (workouts) => {
        this.workouts.set(workouts);
        this.usingFallback.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.workouts.set([FALLBACK_LAST_SESSION, FALLBACK_PREVIOUS_SESSION]);
        this.usingFallback.set(true);
        this.loading.set(false);
      },
    });
    this.api.listExercises().subscribe({
      next: (rows) => this.catalog.set(rows),
      error: () => this.catalog.set(FALLBACK_CATALOG),
    });
    this.api.listPrs().subscribe({
      next: (rows) => this.prs.set(rows),
      error: () => this.prs.set(FALLBACK_PRS),
    });
  }

  formatKg(value: number): string {
    return formatKg(value);
  }

  muscleName(slug: string): string {
    return muscleLabel(slug);
  }

  changeCopy(workout: WorkoutDto | null): string {
    const pct = workout?.summary?.volumeChangePct;
    if (pct == null) {
      return 'No prior equivalent session to compare.';
    }
    const signed = pct > 0 ? `+${pct}` : `${pct}`;
    return `Possible ${signed}% vs last equivalent session.`;
  }

  openLog(): void {
    if (this.usingFallback()) {
      this.messages.add({
        severity: 'info',
        summary: 'Catalog offline',
        detail: 'Wire CatalogModule and ExerciseModule to log sessions.',
      });
      return;
    }
    this.logTitle = 'Back & Biceps';
    this.draft.set(null);
    this.draftExerciseId = this.catalog()[0]?.id ?? null;
    this.logOpen.set(true);
  }

  ensureDraft(then: (workout: WorkoutDto) => void): void {
    const current = this.draft();
    if (current) {
      then(current);
      return;
    }
    this.saving.set(true);
    this.api.createWorkout({ title: this.logTitle.trim() || 'Workout' }).subscribe({
      next: (workout) => {
        this.draft.set(workout);
        this.saving.set(false);
        then(workout);
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({
          severity: 'warn',
          summary: 'Could not start session',
          detail: 'Sign in and confirm the exercise API is registered.',
        });
      },
    });
  }

  addDraftSet(): void {
    if (!this.draftExerciseId || !this.draftWeight || !this.draftReps) {
      return;
    }
    this.ensureDraft((workout) => {
      this.saving.set(true);
      this.api
        .addSet(workout.id, {
          exerciseId: this.draftExerciseId!,
          reps: this.draftReps,
          weightKg: this.draftWeight,
        })
        .subscribe({
          next: (updated) => {
            this.draft.set(updated);
            this.saving.set(false);
          },
          error: () => {
            this.saving.set(false);
          },
        });
    });
  }

  removeDraftSet(setId: string): void {
    const workout = this.draft();
    if (!workout) {
      return;
    }
    this.saving.set(true);
    this.api.removeSet(workout.id, setId).subscribe({
      next: (updated) => {
        this.draft.set(updated);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  completeDraft(): void {
    const workout = this.draft();
    if (!workout || workout.sets.length === 0) {
      return;
    }
    this.saving.set(true);
    this.api.completeWorkout(workout.id).subscribe({
      next: (completed) => {
        this.saving.set(false);
        this.logOpen.set(false);
        this.draft.set(null);
        this.messages.add({
          severity: 'success',
          summary: completed.title,
          detail: completed.summary?.copy ?? 'Session logged.',
        });
        if (completed.prCount > 0) {
          this.messages.add({
            severity: 'info',
            summary: 'Personal records',
            detail: `You logged ${completed.prCount} personal record${completed.prCount === 1 ? '' : 's'} on this session.`,
          });
        }
        this.reload();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({
          severity: 'warn',
          summary: 'Could not complete session',
          detail: 'Add at least one set, then try again.',
        });
      },
    });
  }

  prKindLabel(kind: PersonalRecordDto['kind']): string {
    switch (kind) {
      case 'weight':
        return 'max weight';
      case 'reps':
        return 'max reps';
      case 'e1rm':
        return 'estimated 1RM';
      case 'volume':
        return 'lift volume';
      default:
        return kind;
    }
  }
}
