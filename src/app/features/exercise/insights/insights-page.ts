import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';
import { ProgressBar } from 'primeng/progressbar';
import { Select } from 'primeng/select';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import {
  CatalogExercise,
  DeloadDto,
  DiscomfortDto,
  InsightsApi,
  PlateauItem,
  SubstituteResponse,
} from '../../../core/api/insights.api';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { PosHeatmap, PosPanelHeader, PosStat } from '../../../shared/ui/pos';
import { BodyMap, MUSCLE_LABELS } from '../body-map/body-map';

@Component({
  selector: 'ascend-insights-page',
  imports: [
    FormsModule,
    RouterLink,
    BodyMap,
    Button,
    Card,
    Message,
    PageHeader,
    PosHeatmap,
    PosPanelHeader,
    PosStat,
    ProgressBar,
    Select,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Tag,
    Textarea,
  ],
  templateUrl: './insights-page.html',
  styleUrl: './insights-page.scss',
})
export class InsightsPage {
  private readonly api = inject(InsightsApi);
  private readonly messages = inject(MessageService);

  readonly tab = signal('insights');
  readonly selectedMuscle = signal<string | null>(null);
  readonly description = signal('');
  readonly side = signal<'left' | 'right' | 'both'>('both');
  readonly severity = signal<number | null>(null);
  readonly exerciseId = signal<string | null>(null);
  readonly heatmapKind = signal('training');
  readonly year = new Date().getFullYear();

  readonly catalog = signal<CatalogExercise[]>([]);
  readonly discomfort = signal<DiscomfortDto[]>([]);
  readonly plateaus = signal<PlateauItem[]>([]);
  readonly deload = signal<DeloadDto | null>(null);
  readonly heatmap = signal<{ days: { date: string; count: number; intensity: number }[]; streak: number } | null>(
    null,
  );
  readonly substitutes = signal<SubstituteResponse | null>(null);

  readonly flagged = computed(() => [...new Set(this.discomfort().map((note) => note.region))]);
  readonly regionNotes = computed(() => {
    const region = this.selectedMuscle();
    return region ? this.discomfort().filter((note) => note.region === region) : [];
  });
  readonly regionExercises = computed(() => {
    const region = this.selectedMuscle();
    const all = this.catalog();
    if (!region) {
      return all;
    }
    return all.filter(
      (item) => item.primaryMuscle === region || item.secondaryMuscles.includes(region),
    );
  });
  readonly heatmapDays = computed(() => {
    const days = this.heatmap()?.days ?? [];
    if (!days.length) {
      return [];
    }
    const first = new Date(`${days[0].date}T00:00:00`);
    const pad = first.getDay();
    return [
      ...Array.from({ length: pad }, () => 0),
      ...days.map((day) => Math.max(0, Math.min(4, day.intensity))),
    ];
  });
  readonly flaggedCount = computed(() => String(this.flagged().length));
  readonly plateauCount = computed(() => String(this.plateaus().length));
  readonly streakLabel = computed(() => String(this.heatmap()?.streak ?? 0));
  readonly kindOptions = [
    { label: 'Training', value: 'training' },
    { label: 'Habits', value: 'habits' },
    { label: 'Activity', value: 'activity' },
  ];
  readonly sideOptions = [
    { label: 'Both', value: 'both' },
    { label: 'Left', value: 'left' },
    { label: 'Right', value: 'right' },
  ];
  readonly severityOptions = [
    { label: 'Unspecified', value: null },
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
  ];

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.api.catalog().subscribe({
      next: (res) => this.catalog.set(res.exercises),
      error: () => this.catalog.set([]),
    });
    this.api.listDiscomfort().subscribe({
      next: (rows) => this.discomfort.set(rows),
      error: () => this.discomfort.set([]),
    });
    this.api.plateaus().subscribe({
      next: (res) => this.plateaus.set(res.items),
      error: () => this.plateaus.set([]),
    });
    this.api.deload().subscribe({
      next: (res) => this.deload.set(res),
      error: () => this.deload.set(null),
    });
    this.loadHeatmap();
  }

  loadHeatmap(): void {
    this.api.heatmap(this.heatmapKind(), this.year).subscribe({
      next: (res) => this.heatmap.set(res),
      error: () => this.heatmap.set(null),
    });
  }

  onMuscleChange(id: string | null): void {
    this.selectedMuscle.set(id);
    const first = this.regionExercises()[0];
    if (first && !this.exerciseId()) {
      this.exerciseId.set(first.id);
    }
    this.loadSubstitutes();
  }

  loadSubstitutes(): void {
    const id = this.exerciseId();
    if (!id) {
      this.substitutes.set(null);
      return;
    }
    const region = this.selectedMuscle();
    const flagged = region && this.discomfort().some((note) => note.region === region) ? region : undefined;
    this.api.substitutes(id, flagged).subscribe({
      next: (res) => this.substitutes.set(res),
      error: () => this.substitutes.set(null),
    });
  }

  saveDiscomfort(): void {
    const region = this.selectedMuscle();
    const description = this.description().trim();
    if (!region || !description) {
      this.messages.add({
        severity: 'warn',
        summary: 'Add a note',
        detail: 'Select a region and describe what you marked.',
      });
      return;
    }
    this.api
      .createDiscomfort({
        region,
        description,
        side: this.side(),
        severity: this.severity() ?? undefined,
        exerciseId: this.exerciseId() ?? undefined,
      })
      .subscribe({
        next: (note) => {
          this.discomfort.update((rows) => [note, ...rows]);
          this.description.set('');
          this.messages.add({ severity: 'success', summary: note.summary });
          this.loadSubstitutes();
        },
        error: () =>
          this.messages.add({
            severity: 'error',
            summary: 'Could not save the note',
          }),
      });
  }

  removeNote(id: string): void {
    this.api.removeDiscomfort(id).subscribe({
      next: () => {
        this.discomfort.update((rows) => rows.filter((row) => row.id !== id));
        this.loadSubstitutes();
      },
    });
  }

  dismissDeload(): void {
    this.api.dismissDeload().subscribe({
      next: (res) => this.deload.set(res),
    });
  }

  muscleLabel(id: string): string {
    return MUSCLE_LABELS[id] ?? id;
  }

  discomfortCopy(id: string): string {
    const noun = id === 'shoulders' ? 'shoulder' : (MUSCLE_LABELS[id] ?? id).toLowerCase();
    return `You marked ${noun} discomfort`;
  }

  scorePct(score: number): number {
    return Math.max(8, Math.min(100, Math.round(score)));
  }
}
