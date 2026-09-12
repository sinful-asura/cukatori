import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import type { ExerciseDto, WorkoutDto } from '@ascend-os/shared/exercise';
import { ExerciseApi } from '../../core/api/exercise.api';
import {
  LIBRARY_PAGE_SIZE,
  type LibraryDifficulty,
  type LibraryExerciseDto,
  type LibraryFallbackReason,
  type LibrarySource,
} from '@ascend-os/shared/exercise';
import { ExerciseLibraryApi } from './data/exercise-library.api';

interface Option {
  label: string;
  value: string;
}

@Component({
  selector: 'app-exercise-library-page',
  imports: [
    FormsModule,
    Button,
    Card,
    Dialog,
    IconField,
    InputIcon,
    InputNumber,
    InputText,
    Message,
    Select,
    Tag,
  ],
  templateUrl: './exercise-library-page.html',
  styleUrl: './exercise-library-page.scss',
})
export class ExerciseLibraryPage implements OnInit {
  private readonly api = inject(ExerciseLibraryApi);
  private readonly workoutApi = inject(ExerciseApi);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput = new Subject<string>();

  readonly exercises = signal<LibraryExerciseDto[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly error = signal<string | null>(null);
  readonly source = signal<LibrarySource>('fallback');
  readonly fallbackReason = signal<LibraryFallbackReason | null>(null);
  readonly selected = signal<LibraryExerciseDto | null>(null);
  /** Which clip angle the detail panel is showing; upstream ships front and side. */
  readonly videoIndex = signal(0);

  readonly muscleOptions = signal<Option[]>([]);
  readonly categoryOptions = signal<Option[]>([]);
  readonly difficultyOptions = signal<Option[]>([]);

  search = '';
  muscle: string | null = null;
  category: string | null = null;
  difficulty: LibraryDifficulty | null = null;

  readonly hasMore = computed(() => this.exercises().length < this.total());

  ngOnInit(): void {
    // Typing fires on every keystroke; upstream is metered, so only the pause hits the API.
    this.searchInput
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());

    this.api.filters().subscribe({
      next: (filters) => {
        this.muscleOptions.set(filters.muscles.map((value) => ({ label: value, value })));
        this.categoryOptions.set(filters.categories.map((value) => ({ label: value, value })));
        this.difficultyOptions.set(
          filters.difficulties.map((value) => ({ label: this.titleCase(value), value })),
        );
      },
      error: () => undefined,
    });

    this.reload();
  }

  onSearch(value: string): void {
    this.search = value;
    this.searchInput.next(value.trim());
  }

  reload(): void {
    this.loading.set(true);
    this.selected.set(null);
    this.fetch(0);
  }

  clearFilters(): void {
    this.search = '';
    this.muscle = null;
    this.category = null;
    this.difficulty = null;
    this.reload();
  }

  get filtered(): boolean {
    return Boolean(this.search || this.muscle || this.category || this.difficulty);
  }

  select(exercise: LibraryExerciseDto): void {
    this.selected.set(exercise);
    this.videoIndex.set(0);
    // The list response is already detailed; only fetch again if steps are missing.
    if (exercise.steps.length === 0) {
      this.api.byId(exercise.id).subscribe({
        next: (full) => {
          if (this.selected()?.id === full.id) {
            this.selected.set(full);
          }
        },
        error: () => undefined,
      });
    }
  }

  closeDetail(): void {
    this.selected.set(null);
  }

  showVideo(index: number): void {
    this.videoIndex.set(index);
  }

  /** The clip currently on screen, or null when upstream published none for this lift. */
  readonly activeVideo = computed(() => {
    const videos = this.selected()?.videos ?? [];
    return videos[this.videoIndex()] ?? videos[0] ?? null;
  });

  /** Label/value rows for the detail summary, skipping anything upstream left null. */
  readonly detailFacts = computed(() => {
    const exercise = this.selected();
    if (!exercise) {
      return [];
    }
    const facts: { label: string; value: string }[] = [
      { label: 'Equipment', value: exercise.category ?? '—' },
      { label: 'Difficulty', value: exercise.difficulty ?? '—' },
      { label: 'Mechanic', value: exercise.mechanic ?? '—' },
      { label: 'Force', value: exercise.force ?? '—' },
    ];
    if (exercise.grips.length) {
      facts.push({ label: 'Grips', value: exercise.grips.join(', ') });
    }
    return facts.filter((fact) => fact.value !== '—');
  });

  loadMore(): void {
    if (this.loadingMore() || !this.hasMore()) {
      return;
    }
    this.loadingMore.set(true);
    this.fetch(this.exercises().length);
  }

  /** The banner is the only place a user learns why the catalogue looks short. */
  readonly fallbackNotice = computed(() => {
    switch (this.fallbackReason()) {
      case 'unconfigured':
        return 'Showing the bundled starter catalogue. Set MUSCLEWIKI_API_KEY in .env to serve the full MuscleWiki library.';
      case 'tier-restricted':
        return 'Showing the bundled starter catalogue. The MuscleWiki key is valid but its plan only allows playground access — direct API access needs their paid tier.';
      case 'upstream-unavailable':
        return 'Showing the bundled starter catalogue. MuscleWiki is not responding right now.';
      default:
        return null;
    }
  });

  muscleLabel(exercise: LibraryExerciseDto): string {
    return exercise.primaryMuscles.join(' · ') || 'Full body';
  }

  private fetch(offset: number): void {
    this.error.set(null);
    this.api
      .list({
        search: this.search.trim() || undefined,
        muscle: this.muscle ?? undefined,
        category: this.category ?? undefined,
        difficulty: this.difficulty ?? undefined,
        limit: LIBRARY_PAGE_SIZE,
        offset,
      })
      .subscribe({
        next: (page) => {
          this.exercises.set(offset === 0 ? page.results : [...this.exercises(), ...page.results]);
          this.total.set(page.total);
          this.source.set(page.source);
          this.fallbackReason.set(page.fallbackReason ?? null);
          this.loading.set(false);
          this.loadingMore.set(false);
        },
        error: (err: unknown) => {
          this.error.set(this.describe(err));
          this.loading.set(false);
          this.loadingMore.set(false);
        },
      });
  }

  // ---- Workout logging -------------------------------------------------------
  // Library ids ('bench-press', or a MuscleWiki number) are not the catalog UUIDs that
  // `POST /workouts/:id/sets` expects, so the dialog matches by name against /catalog.

  readonly logOpen = signal(false);
  readonly logSaving = signal(false);
  readonly logError = signal<string | null>(null);
  readonly draft = signal<WorkoutDto | null>(null);
  readonly catalogOptions = signal<Option[]>([]);

  logTitle = 'Workout';
  logExerciseId: string | null = null;
  logWeight = 60;
  logReps = 8;

  openLog(exercise: LibraryExerciseDto): void {
    this.logTitle = `${exercise.primaryMuscles[0] ?? 'Full body'} session`;
    this.logError.set(null);
    this.draft.set(null);
    this.logOpen.set(true);

    this.workoutApi.listExercises().subscribe({
      next: (rows) => {
        this.catalogOptions.set(rows.map((row) => ({ label: row.name, value: row.id })));
        this.logExerciseId = this.matchCatalog(exercise, rows);
      },
      error: (err: unknown) => {
        this.catalogOptions.set([]);
        this.logError.set(
          err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)
            ? 'Sign in to log workouts — sessions are saved to your account.'
            : 'Could not load the loggable lift list.',
        );
      },
    });
  }

  closeLog(): void {
    this.logOpen.set(false);
  }

  addSet(): void {
    if (!this.logExerciseId || !this.logReps || this.logWeight == null) {
      return;
    }
    this.logSaving.set(true);
    this.logError.set(null);
    this.withDraft((workout) => {
      this.workoutApi
        .addSet(workout.id, {
          exerciseId: this.logExerciseId!,
          reps: this.logReps,
          weightKg: this.logWeight,
        })
        .subscribe({
          next: (updated) => {
            this.draft.set(updated);
            this.logSaving.set(false);
          },
          error: (err: unknown) => {
            this.logSaving.set(false);
            this.logError.set(this.describeLog(err, 'Could not add that set.'));
          },
        });
    });
  }

  finishWorkout(): void {
    const workout = this.draft();
    if (!workout) {
      return;
    }
    this.logSaving.set(true);
    this.workoutApi.completeWorkout(workout.id).subscribe({
      next: (done) => {
        this.logSaving.set(false);
        this.logOpen.set(false);
        this.draft.set(null);
        this.messages.add({
          severity: 'success',
          summary: 'Workout logged',
          detail: done.summary?.copy ?? `${done.setCount} sets · ${done.volumeKg} kg total volume.`,
        });
      },
      error: (err: unknown) => {
        this.logSaving.set(false);
        this.logError.set(this.describeLog(err, 'Could not complete the session.'));
      },
    });
  }

  /** Sets need a workout to hang off; create one lazily on the first set. */
  private withDraft(then: (workout: WorkoutDto) => void): void {
    const current = this.draft();
    if (current) {
      then(current);
      return;
    }
    this.workoutApi.createWorkout({ title: this.logTitle.trim() || 'Workout' }).subscribe({
      next: (workout) => {
        this.draft.set(workout);
        then(workout);
      },
      error: (err: unknown) => {
        this.logSaving.set(false);
        this.logError.set(this.describeLog(err, 'Could not start a session.'));
      },
    });
  }

  /** Best-effort name match between the MuscleWiki library and the loggable catalog. */
  private matchCatalog(exercise: LibraryExerciseDto, rows: ExerciseDto[]): string | null {
    const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const target = norm(exercise.name);
    const exact = rows.find((row) => norm(row.name) === target);
    if (exact) {
      return exact.id;
    }
    const partial = rows.find(
      (row) => norm(row.name).includes(target) || target.includes(norm(row.name)),
    );
    return partial?.id ?? rows[0]?.id ?? null;
  }

  private describeLog(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
      return 'Sign in to log workouts — sessions are saved to your account.';
    }
    return fallback;
  }

  /** A 401 and an unreachable API need different fixes, so don't report them alike. */
  private describe(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401 || err.status === 403) {
        return 'Sign in to browse the exercise library.';
      }
      if (err.status === 0) {
        return 'Could not reach the API. Check that it is running on port 3000.';
      }
      return `The exercise library request failed (${err.status}).`;
    }
    return 'Could not load the exercise library.';
  }

  private titleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
