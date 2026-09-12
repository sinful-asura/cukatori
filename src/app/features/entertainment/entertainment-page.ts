import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DataView } from 'primeng/dataview';
import { Dialog } from 'primeng/dialog';
import { GalleryModule } from 'primeng/gallery';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { ProgressBar } from 'primeng/progressbar';
import { Rating } from 'primeng/rating';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import type {
  CreateMediaItemRequest,
  MediaItemDto,
  MediaLibraryDto,
  MediaStatus,
  MediaType,
} from '@ascend-os/shared/media';
import { MediaApi } from '../../core/api/media.api';

export type LibraryTab = 'all' | 'anime' | 'manga' | 'books' | 'youtube';

type Option<T extends string> = { label: string; value: T };

@Component({
  selector: 'app-entertainment-page',
  imports: [
    FormsModule,
    Button,
    Card,
    DataView,
    Dialog,
    GalleryModule,
    InputNumber,
    InputText,
    ProgressBar,
    Rating,
    Select,
    Tag,
    TabsModule,
  ],
  templateUrl: './entertainment-page.html',
  styleUrl: './entertainment-page.scss',
})
export class EntertainmentPage {
  private readonly api = inject(MediaApi);
  private readonly messages = inject(MessageService);

  readonly tab = signal<LibraryTab>('all');
  readonly library = signal<MediaLibraryDto | null>(null);
  readonly loading = signal(true);
  readonly addOpen = signal(false);
  readonly detailOpen = signal(false);
  readonly galleryOpen = signal(false);
  readonly galleryIndex = signal(0);
  readonly selected = signal<MediaItemDto | null>(null);
  readonly saving = signal(false);

  readonly typeOptions: Option<MediaType>[] = [
    { label: 'Anime', value: 'anime' },
    { label: 'Manga', value: 'manga' },
    { label: 'Book', value: 'book' },
    { label: 'Novel', value: 'novel' },
    { label: 'Movie', value: 'movie' },
    { label: 'YouTube', value: 'youtube' },
  ];

  readonly statusOptions: Option<MediaStatus>[] = [
    { label: 'Planned', value: 'planned' },
    { label: 'Watching', value: 'watching' },
    { label: 'Reading', value: 'reading' },
    { label: 'Completed', value: 'completed' },
    { label: 'Paused', value: 'paused' },
    { label: 'Dropped', value: 'dropped' },
  ];

  add: CreateMediaItemRequest = this.emptyAdd();
  progressEpisode: number | null = null;
  progressPages: number | null = null;
  progressHours: number | null = null;
  progressRating: number | null = null;
  progressNote = '';
  markComplete = false;

  readonly items = computed(() => this.filterItems(this.library()?.items ?? []));
  readonly watching = computed(() => this.filterItems(this.library()?.currentlyWatching ?? []));
  readonly reading = computed(() => this.filterItems(this.library()?.currentlyReading ?? []));
  readonly recent = computed(() => this.filterItems(this.library()?.recentlyCompleted ?? []).slice(0, 4));
  readonly galleryImages = computed(() =>
    this.recent()
      .map((item) => item.posterUrl)
      .filter((url): url is string => !!url),
  );
  readonly stats = computed(
    () =>
      this.library()?.stats ?? {
        hours: 0,
        completed: 0,
        averageRating: 0,
        streak: 0,
      },
  );

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.api.library().subscribe({
      next: (lib) => {
        this.library.set(lib);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onTabChange(value: string | number | undefined): void {
    if (
      value === 'all' ||
      value === 'anime' ||
      value === 'manga' ||
      value === 'books' ||
      value === 'youtube'
    ) {
      this.tab.set(value);
    }
  }

  openAdd(): void {
    this.add = this.emptyAdd();
    this.addOpen.set(true);
  }

  saveAdd(): void {
    if (!this.add.title.trim()) {
      return;
    }
    this.saving.set(true);
    const body: CreateMediaItemRequest = {
      ...this.add,
      title: this.add.title.trim(),
      posterUrl: this.add.posterUrl?.trim() || null,
      subtitle: this.add.subtitle?.trim() || null,
    };
    this.api.create(body).subscribe({
      next: () => {
        this.saving.set(false);
        this.addOpen.set(false);
        this.messages.add({
          severity: 'success',
          summary: 'Added to library',
          detail: this.add.title,
        });
        this.reload();
      },
      error: () => this.saving.set(false),
    });
  }

  openItem(item: MediaItemDto): void {
    this.selected.set(item);
    this.progressEpisode = item.currentEpisode;
    this.progressPages = item.currentPages;
    this.progressHours = null;
    this.progressRating = item.rating;
    this.progressNote = '';
    this.markComplete = item.status === 'completed';
    this.detailOpen.set(true);
  }

  openGallery(index: number): void {
    this.galleryIndex.set(index);
    this.galleryOpen.set(true);
  }

  onGalleryIndex(event: unknown): void {
    if (typeof event === 'number') {
      this.galleryIndex.set(event);
      return;
    }
    if (event && typeof event === 'object' && 'value' in event) {
      const value = (event as { value: unknown }).value;
      if (typeof value === 'number') {
        this.galleryIndex.set(value);
      }
    }
  }

  logSelected(): void {
    const item = this.selected();
    if (!item) {
      return;
    }
    this.saving.set(true);
    this.api
      .logProgress(item.id, {
        episode: this.progressEpisode ?? undefined,
        pages: this.progressPages ?? undefined,
        hours: this.progressHours ?? undefined,
        rating: this.progressRating ?? undefined,
        note: this.progressNote.trim() || undefined,
        completed: this.markComplete || undefined,
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.detailOpen.set(false);
          this.selected.set(res.item);
          for (const event of res.events) {
            this.messages.add({
              severity: event.type === 'MEDIA_COMPLETED' ? 'success' : 'info',
              summary: event.title,
              detail: `${event.summary} · +${event.xpAwarded} XP`,
            });
          }
          if (res.events.length === 0) {
            this.messages.add({
              severity: 'secondary',
              summary: 'Saved',
              detail: res.item.title,
            });
          }
          this.reload();
        },
        error: () => this.saving.set(false),
      });
  }

  progressLabel(item: MediaItemDto): string {
    if (this.isPrint(item) && item.currentPages != null) {
      return item.totalUnits
        ? `${item.currentPages} / ${item.totalUnits} pages`
        : `${item.currentPages} pages`;
    }
    if (item.currentEpisode != null) {
      return item.totalUnits
        ? `Episode ${item.currentEpisode} / ${item.totalUnits}`
        : `Episode ${item.currentEpisode}`;
    }
    return this.statusLabel(item.status);
  }

  progressPct(item: MediaItemDto): number {
    if (!item.totalUnits) {
      return 0;
    }
    const current = this.isPrint(item) ? (item.currentPages ?? 0) : (item.currentEpisode ?? 0);
    return Math.min(100, Math.round((current / item.totalUnits) * 100));
  }

  statusSeverity(status: string): 'success' | 'info' | 'warn' | 'secondary' | 'danger' {
    switch (status) {
      case 'completed':
        return 'success';
      case 'watching':
      case 'reading':
        return 'info';
      case 'paused':
        return 'warn';
      case 'dropped':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  statusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  typeLabel(type: string): string {
    return type === 'youtube' ? 'YouTube' : type.charAt(0).toUpperCase() + type.slice(1);
  }

  isPrint(item: MediaItemDto): boolean {
    return item.type === 'book' || item.type === 'manga' || item.type === 'novel';
  }

  poster(item: MediaItemDto): string {
    return item.posterUrl || 'https://covers.openlibrary.org/b/id/10958382-L.jpg';
  }

  private filterItems(items: MediaItemDto[]): MediaItemDto[] {
    const tab = this.tab();
    if (tab === 'all') {
      return items;
    }
    if (tab === 'books') {
      return items.filter((item) => item.type === 'book' || item.type === 'novel');
    }
    return items.filter((item) => item.type === tab);
  }

  private emptyAdd(): CreateMediaItemRequest {
    return {
      type: 'anime',
      title: '',
      posterUrl: '',
      status: 'planned',
      subtitle: '',
      totalUnits: null,
    };
  }
}
