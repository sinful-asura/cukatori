import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../users/user.entity.js';
import { ActivityBus } from '../activity/activity.bus.js';
import { EntertainmentSeeder } from './entertainment.seeder.js';
import { MediaItem } from './media-item.entity.js';
import { MediaProgress } from './media-progress.entity.js';
import {
  CreateMediaItemDto,
  LogMediaProgressDto,
  MEDIA_TYPES,
  UpdateMediaItemDto,
} from './media.dto.js';

const HEATMAP_DAYS = 182;

const PRINT_TYPES = new Set(['book', 'manga', 'novel']);
const WATCH_TYPES = new Set(['anime', 'movie', 'youtube']);
const DEMO_EMAIL = 'kristijan@local';

export type MediaItemView = {
  id: string;
  type: (typeof MEDIA_TYPES)[number];
  title: string;
  posterUrl: string | null;
  status: string;
  subtitle: string | null;
  totalUnits: number | null;
  currentEpisode: number | null;
  currentPages: number | null;
  rating: number | null;
  hours: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MediaProgressView = {
  id: string;
  mediaId: string;
  episode: number | null;
  pages: number | null;
  rating: number | null;
  hours: number | null;
  note: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type MediaActivityEcho = {
  type: 'MEDIA_PROGRESS' | 'MEDIA_COMPLETED';
  title: string;
  summary: string;
  xpAwarded: number;
};

@Injectable()
export class EntertainmentService {
  private seedAttempted = false;

  constructor(
    private readonly em: EntityManager,
    private readonly bus: ActivityBus,
    private readonly seeder: EntertainmentSeeder,
  ) {}

  async actor(user?: User): Promise<User> {
    if (user) {
      return user;
    }
    return this.em.findOneOrFail(User, { email: DEMO_EMAIL });
  }

  async ensureSeeded(): Promise<void> {
    if (this.seedAttempted) {
      return;
    }
    this.seedAttempted = true;
    await this.seeder.seedKristijan(this.em.fork());
  }

  async list(user: User, type?: string, status?: string): Promise<MediaItemView[]> {
    await this.ensureSeeded();
    const where: Record<string, unknown> = { user };
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    const items = await this.em.find(MediaItem, where, { orderBy: { updatedAt: 'DESC' } });
    return items.map((item) => this.toItem(item));
  }

  async library(user: User) {
    await this.ensureSeeded();
    const items = await this.em.find(MediaItem, { user }, { orderBy: { updatedAt: 'DESC' } });
    const watching = items.filter((item) => item.status === 'watching');
    const reading = items.filter((item) => item.status === 'reading');
    const completed = items
      .filter((item) => item.status === 'completed')
      .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0));
    const rated = items.filter((item) => item.rating != null);
    const hours = items.reduce((sum, item) => sum + (item.hours ?? 0), 0);
    const averageRating =
      rated.length === 0
        ? 0
        : Math.round(
            (rated.reduce((sum, item) => sum + (item.rating ?? 0), 0) / rated.length) * 10,
          ) / 10;

    return {
      items: items.map((item) => this.toItem(item)),
      currentlyWatching: watching.map((item) => this.toItem(item)),
      currentlyReading: reading.map((item) => this.toItem(item)),
      recentlyCompleted: completed.slice(0, 8).map((item) => this.toItem(item)),
      stats: {
        hours: Math.round(hours * 10) / 10,
        completed: completed.length,
        averageRating,
        streak: await this.streak(user),
      },
      heatmap: await this.heatmap(user, items),
    };
  }

  async getOne(user: User, id: string): Promise<MediaItemView> {
    return this.toItem(await this.requireItem(user, id));
  }

  async create(user: User, dto: CreateMediaItemDto): Promise<MediaItemView> {
    await this.ensureSeeded();
    const status = dto.status ?? (PRINT_TYPES.has(dto.type) ? 'reading' : 'watching');
    const item = this.em.create(MediaItem, {
      user,
      type: dto.type,
      title: dto.title.trim(),
      posterUrl: dto.posterUrl?.trim() || null,
      status,
      subtitle: dto.subtitle?.trim() || null,
      totalUnits: dto.totalUnits ?? null,
      currentEpisode: dto.currentEpisode ?? null,
      currentPages: dto.currentPages ?? null,
      rating: dto.rating ?? null,
      hours: dto.hours ?? 0,
    });
    await this.em.persist(item).flush();
    return this.toItem(item);
  }

  async update(user: User, id: string, dto: UpdateMediaItemDto): Promise<MediaItemView> {
    const item = await this.requireItem(user, id);
    if (dto.type !== undefined) {
      item.type = dto.type;
    }
    if (dto.title !== undefined) {
      item.title = dto.title.trim();
    }
    if (dto.posterUrl !== undefined) {
      item.posterUrl = dto.posterUrl?.trim() || null;
    }
    if (dto.status !== undefined) {
      item.status = dto.status;
    }
    if (dto.subtitle !== undefined) {
      item.subtitle = dto.subtitle?.trim() || null;
    }
    if (dto.totalUnits !== undefined) {
      item.totalUnits = dto.totalUnits;
    }
    if (dto.currentEpisode !== undefined) {
      item.currentEpisode = dto.currentEpisode;
    }
    if (dto.currentPages !== undefined) {
      item.currentPages = dto.currentPages;
    }
    if (dto.rating !== undefined) {
      item.rating = dto.rating;
    }
    if (dto.hours !== undefined) {
      item.hours = dto.hours;
    }
    if (item.status === 'completed' && !item.completedAt) {
      item.completedAt = new Date();
    }
    if (item.status !== 'completed') {
      item.completedAt = null;
    }
    await this.em.flush();
    return this.toItem(item);
  }

  async remove(user: User, id: string): Promise<void> {
    const item = await this.requireItem(user, id);
    await this.em.nativeDelete(MediaProgress, { media: item });
    await this.em.remove(item).flush();
  }

  async listProgress(user: User, id: string): Promise<MediaProgressView[]> {
    const item = await this.requireItem(user, id);
    const rows = await this.em.find(MediaProgress, { media: item }, { orderBy: { createdAt: 'DESC' } });
    return rows.map((row) => this.toProgress(row));
  }

  async logProgress(user: User, id: string, dto: LogMediaProgressDto) {
    const item = await this.requireItem(user, id);
    const wasCompleted = item.status === 'completed';
    const prevPages = item.currentPages ?? 0;
    const prevEpisode = item.currentEpisode ?? 0;
    const print = PRINT_TYPES.has(item.type);
    const watch = WATCH_TYPES.has(item.type);

    if (dto.pages !== undefined) {
      item.currentPages = dto.pages;
    }
    if (dto.episode !== undefined) {
      item.currentEpisode = dto.episode;
    }
    if (dto.rating !== undefined) {
      item.rating = dto.rating;
    }
    if (dto.hours !== undefined) {
      item.hours = (item.hours ?? 0) + dto.hours;
    }

    const pagesDelta = Math.max(0, (item.currentPages ?? 0) - prevPages);
    const episodeDelta = Math.max(0, (item.currentEpisode ?? 0) - prevEpisode);
    const reachedEnd =
      item.totalUnits != null &&
      ((print && (item.currentPages ?? 0) >= item.totalUnits) ||
        (watch && (item.currentEpisode ?? 0) >= item.totalUnits));
    const newlyCompleted = !wasCompleted && (dto.completed === true || reachedEnd);

    if (newlyCompleted) {
      item.status = 'completed';
      item.completedAt = new Date();
    } else if (!wasCompleted) {
      if (print && (pagesDelta > 0 || item.status === 'planned')) {
        item.status = 'reading';
      } else if (watch && (episodeDelta > 0 || item.status === 'planned')) {
        item.status = 'watching';
      }
    }

    const progress = this.em.create(MediaProgress, {
      media: item,
      episode: dto.episode ?? item.currentEpisode,
      pages: dto.pages ?? item.currentPages,
      rating: dto.rating ?? item.rating,
      hours: dto.hours ?? null,
      note: dto.note?.trim() || null,
      completedAt: newlyCompleted ? item.completedAt : null,
    });
    await this.em.persist(progress).flush();

    const events: MediaActivityEcho[] = [];
    const advanced = pagesDelta > 0 || episodeDelta > 0 || (dto.hours ?? 0) > 0;
    if (advanced) {
      const title = this.progressTitle(item, pagesDelta, episodeDelta, dto.hours ?? 0);
      const emitted = await this.bus.emit(user.id, {
        category: 'entertainment',
        type: 'MEDIA_PROGRESS',
        title,
        summary: item.title,
        payload: {
          mediaId: item.id,
          type: item.type,
          episode: item.currentEpisode,
          pages: item.currentPages,
          pagesDelta,
          episodeDelta,
        },
        tags: [item.type, 'media'],
      });
      events.push({
        type: 'MEDIA_PROGRESS',
        title: emitted.title,
        summary: emitted.summary,
        xpAwarded: emitted.xpAwarded,
      });
    }

    if (newlyCompleted) {
      const emitted = await this.bus.emit(user.id, {
        category: 'entertainment',
        type: 'MEDIA_COMPLETED',
        title: `Finished ${item.title}`,
        summary: this.typeLabel(item.type),
        payload: {
          mediaId: item.id,
          type: item.type,
          rating: item.rating,
        },
        tags: [item.type, 'media', 'completed'],
      });
      events.push({
        type: 'MEDIA_COMPLETED',
        title: emitted.title,
        summary: emitted.summary,
        xpAwarded: emitted.xpAwarded,
      });
    }

    return {
      item: this.toItem(item),
      progress: this.toProgress(progress),
      events,
    };
  }

  private async requireItem(user: User, id: string): Promise<MediaItem> {
    await this.ensureSeeded();
    const item = await this.em.findOne(MediaItem, { id, user });
    if (!item) {
      throw new NotFoundException('Media item not found');
    }
    return item;
  }

  private async heatmap(user: User, items: MediaItem[]): Promise<number[]> {
    const counts = new Array<number>(HEATMAP_DAYS).fill(0);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (HEATMAP_DAYS - 1));

    const logs = await this.em.find(MediaProgress, { media: { user } }, { limit: 4000 });
    for (const log of logs) {
      const idx = this.dayOffset(log.createdAt, start);
      if (idx >= 0 && idx < HEATMAP_DAYS) {
        counts[idx] += 1;
      }
    }

    for (const item of items) {
      if (!item.completedAt) {
        continue;
      }
      const idx = this.dayOffset(item.completedAt, start);
      if (idx >= 0 && idx < HEATMAP_DAYS) {
        counts[idx] += 1;
      }
    }

    return counts.map((n) => (n <= 0 ? 0 : Math.min(4, n)));
  }

  private dayOffset(date: Date, start: Date): number {
    const cursor = new Date(date);
    cursor.setHours(0, 0, 0, 0);
    return Math.round((cursor.getTime() - start.getTime()) / 86_400_000);
  }

  private async streak(user: User): Promise<number> {
    const logs = await this.em.find(
      MediaProgress,
      { media: { user } },
      { orderBy: { createdAt: 'DESC' }, limit: 400, populate: ['media'] },
    );
    if (logs.length === 0) {
      return 0;
    }
    const days = new Set(logs.map((log) => this.dayKey(log.createdAt)));
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    if (!days.has(this.dayKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
      if (!days.has(this.dayKey(cursor))) {
        return 0;
      }
    }
    let count = 0;
    while (days.has(this.dayKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  private dayKey(date: Date): string {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private progressTitle(
    item: MediaItem,
    pagesDelta: number,
    episodeDelta: number,
    hours: number,
  ): string {
    if (PRINT_TYPES.has(item.type) && pagesDelta > 0) {
      return `Read ${pagesDelta} page${pagesDelta === 1 ? '' : 's'}`;
    }
    if (WATCH_TYPES.has(item.type) && episodeDelta > 0) {
      return `Watched episode ${item.currentEpisode}`;
    }
    if (hours > 0) {
      return `Logged ${hours}h`;
    }
    return `Updated ${item.title}`;
  }

  private typeLabel(type: string): string {
    switch (type) {
      case 'anime':
        return 'Anime';
      case 'manga':
        return 'Manga';
      case 'book':
        return 'Book';
      case 'novel':
        return 'Novel';
      case 'movie':
        return 'Movie';
      case 'youtube':
        return 'YouTube';
      default:
        return 'Media';
    }
  }

  private toItem(item: MediaItem): MediaItemView {
    return {
      id: item.id,
      type: item.type as MediaItemView['type'],
      title: item.title,
      posterUrl: item.posterUrl,
      status: item.status,
      subtitle: item.subtitle,
      totalUnits: item.totalUnits,
      currentEpisode: item.currentEpisode,
      currentPages: item.currentPages,
      rating: item.rating,
      hours: item.hours,
      completedAt: item.completedAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private toProgress(row: MediaProgress): MediaProgressView {
    return {
      id: row.id,
      mediaId: row.media.id,
      episode: row.episode,
      pages: row.pages,
      rating: row.rating,
      hours: row.hours,
      note: row.note,
      completedAt: row.completedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
