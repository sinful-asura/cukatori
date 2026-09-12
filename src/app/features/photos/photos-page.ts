import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Compare, CompareItem } from 'primeng/compare';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FileUpload } from 'primeng/fileupload';
import { Gallery, GalleryContent, GalleryItem } from 'primeng/gallery';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import { PHOTO_TYPES, PhotoDto, PhotosApi, PhotoType } from '../../core/api/photos.api';

@Component({
  selector: 'ascend-photos-page',
  imports: [
    DatePipe,
    FormsModule,
    Button,
    Card,
    Compare,
    CompareItem,
    ConfirmDialog,
    FileUpload,
    Gallery,
    GalleryContent,
    GalleryItem,
    InputNumber,
    Select,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Tag,
    Textarea,
  ],
  providers: [ConfirmationService],
  templateUrl: './photos-page.html',
  styleUrl: './photos-page.scss',
})
export class PhotosPage {
  private readonly api = inject(PhotosApi);
  private readonly confirm = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly photos = signal<PhotoDto[]>([]);
  readonly tab = signal('gallery');
  readonly photoType = signal<PhotoType>('front');
  readonly notes = signal('');
  readonly bodyweight = signal<number | null>(null);
  readonly beforeId = signal<string | null>(null);
  readonly afterId = signal<string | null>(null);

  readonly typeOptions = PHOTO_TYPES.map((value) => ({
    label: value[0].toUpperCase() + value.slice(1),
    value,
  }));
  readonly photoOptions = computed(() =>
    this.photos().map((photo) => ({
      label: `${photo.type} · ${new Date(photo.takenAt).toLocaleDateString()}`,
      value: photo.id,
    })),
  );
  readonly before = computed(() => this.photos().find((photo) => photo.id === this.beforeId()) ?? null);
  readonly after = computed(() => this.photos().find((photo) => photo.id === this.afterId()) ?? null);

  constructor() {
    this.reload();
  }

  reload(): void {
    this.api.list().subscribe({
      next: (rows) => {
        this.photos.set(rows);
        if (!this.beforeId() && rows[1]) {
          this.beforeId.set(rows[rows.length - 1]?.id ?? null);
        }
        if (!this.afterId() && rows[0]) {
          this.afterId.set(rows[0].id);
        }
      },
      error: () => this.photos.set([]),
    });
  }

  upload(event: { files: File[] }): void {
    if (!file) {
      return;
    }
    this.api
      .upload(file, {
        type: this.photoType(),
        notes: this.notes() || undefined,
        bodyweight: this.bodyweight(),
      })
      .subscribe({
        next: (photo) => {
          this.photos.update((rows) => [photo, ...rows]);
          this.notes.set('');
          this.messages.add({
            severity: 'success',
            summary: 'Photo saved',
            detail: 'Private to your signed-in session.',
          });
        },
        error: () =>
          this.messages.add({
            severity: 'error',
            summary: 'Upload failed',
            detail: 'Stay signed in and use JPEG, PNG, or WebP.',
          }),
      });
  }

  remove(photo: PhotoDto): void {
    this.confirm.confirm({
      header: 'Remove photo',
      message: 'Remove this private photo? This cannot be undone.',
      acceptLabel: 'Remove',
      rejectLabel: 'Keep',
      accept: () => {
        this.api.remove(photo.id).subscribe({
          next: () => {
            this.photos.update((rows) => rows.filter((row) => row.id !== photo.id));
            if (this.beforeId() === photo.id) {
              this.beforeId.set(null);
            }
            if (this.afterId() === photo.id) {
              this.afterId.set(null);
            }
          },
        });
      },
    });
  }
}
