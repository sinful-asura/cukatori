import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import {
  LIBRARY_PAGE_SIZE,
  type LibraryDifficulty,
  type LibraryExerciseDto,
  type LibraryFallbackReason,
  type LibrarySource,
} from '@ascend-os/shared/exercise';
import { ExerciseLibraryApi } from '../../../core/api/exercise-library.api';
import { exerciseMediaUrl } from '../exercise-media';
import { PosPanelHeader } from '../../../shared/ui/pos/pos-panel-header';

export type LibraryPreview = { kind: 'video' | 'image'; src: string };

interface Option {
  label: string;
  value: string;
}

@Component({
  selector: 'app-exercise-library',
  imports: [
    FormsModule,
    Button,
    Card,
    IconField,
    InputIcon,
    InputText,
    Message,
    Select,
    Tag,
    PosPanelHeader,
  ],
  templateUrl: './exercise-library.html',
  styleUrl: './exercise-library.scss',
})
export class ExerciseLibrary implements OnInit {
  private readonly api = inject(ExerciseLibraryApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput = new Subject<string>();

  readonly log = output<LibraryExerciseDto>();

  readonly exercises = signal<LibraryExerciseDto[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly error = signal<string | null>(null);
  readonly source = signal<LibrarySource>('fallback');
  readonly fallbackReason = signal<LibraryFallbackReason | null>(null);
  readonly selected = signal<LibraryExerciseDto | null>(null);
  readonly videoIndex = signal(0);

  readonly muscleOptions = signal<Option[]>([]);
  readonly categoryOptions = signal<Option[]>([]);
  readonly difficultyOptions = signal<Option[]>([]);

  search = '';
  muscle: string | null = null;
  category: string | null = null;
  difficulty: LibraryDifficulty | null = null;

  readonly hasMore = computed(() => this.exercises().length < this.total());

  readonly activeVideo = computed(() => {
    const videos = this.selected()?.videos ?? [];
    return videos[this.videoIndex()] ?? videos[0] ?? null;
  });

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

  readonly fallbackNotice = computed(() => {
    if (this.fallbackReason() === 'upstream-unavailable') {
      return 'MuscleWiki is not responding right now — showing the starter catalogue.';
    }
    return null;
  });

  readonly subtitle = computed(() => {
    const count = this.total();
    const source = this.source() === 'musclewiki' ? 'MuscleWiki' : 'bundled starter set';
    return `${count} movement${count === 1 ? '' : 's'} from the ${source}.`;
  });

  ngOnInit(): void {
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

  loadMore(): void {
    if (this.loadingMore() || !this.hasMore()) {
      return;
    }
    this.loadingMore.set(true);
    this.fetch(this.exercises().length);
  }

  muscleLabel(exercise: LibraryExerciseDto): string {
    return exercise.primaryMuscles.join(' · ') || 'Full body';
  }

  preview(exercise: LibraryExerciseDto): LibraryPreview | null {
    const clip = exercise.videos.find((video) => video.url);
    if (clip?.url) {
      return { kind: 'video', src: clip.url };
    }
    const gif = exerciseMediaUrl(exercise.name);
    return gif ? { kind: 'image', src: gif } : null;
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
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

  private describe(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
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
