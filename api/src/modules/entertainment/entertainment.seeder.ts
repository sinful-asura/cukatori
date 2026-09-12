import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity.js';
import { MediaItem } from './media-item.entity.js';
import { MediaProgress } from './media-progress.entity.js';

type SeedSpec = {
  type: string;
  title: string;
  posterUrl: string;
  status: string;
  subtitle: string;
  totalUnits: number | null;
  currentEpisode: number | null;
  currentPages: number | null;
  rating: number | null;
  hours: number;
  completedAt: Date | null;
};

const DEMO_EMAIL = 'kristijan@local';

/** Public poster URLs only — no user uploads. */
const POSTERS = {
  onePiece: 'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_1_Cover.jpg',
  dune: 'https://covers.openlibrary.org/b/id/9251896-L.jpg',
  theBoys: 'https://upload.wikimedia.org/wikipedia/en/8/80/The_Boys_Season_1.jpg',
  interstellar: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
  spirited: 'https://upload.wikimedia.org/wikipedia/en/d/db/Spirited_Away_Japanese_poster.png',
  deathNote: 'https://covers.openlibrary.org/b/id/12645117-L.jpg',
  hailMary: 'https://covers.openlibrary.org/b/id/12818862-L.jpg',
  arrival: 'https://upload.wikimedia.org/wikipedia/en/d/df/Arrival_%282016_film%29.png',
  youtube: 'https://img.youtube.com/vi/il2ZdvYuV5A/hqdefault.jpg',
};

@Injectable()
export class EntertainmentSeeder {
  constructor(private readonly em: EntityManager) {}

  async seedKristijan(em: EntityManager = this.em): Promise<void> {
    const user = await em.findOne(User, { email: DEMO_EMAIL });
    if (!user) {
      return;
    }
    const existing = await em.count(MediaItem, { user });
    if (existing > 0) {
      await this.ensureHeatmapHistory(em);
      return;
    }

    const now = new Date();
    const daysAgo = (n: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return d;
    };

    const specs: SeedSpec[] = [
      {
        type: 'anime',
        title: 'One Piece',
        posterUrl: POSTERS.onePiece,
        status: 'watching',
        subtitle: 'Toei Animation',
        totalUnits: 1100,
        currentEpisode: 1021,
        currentPages: null,
        rating: 5,
        hours: 11,
        completedAt: null,
      },
      {
        type: 'book',
        title: 'Dune',
        posterUrl: POSTERS.dune,
        status: 'reading',
        subtitle: 'Frank Herbert',
        totalUnits: 412,
        currentEpisode: null,
        currentPages: 280,
        rating: 4.5,
        hours: 4,
        completedAt: null,
      },
      {
        type: 'movie',
        title: 'The Boys',
        posterUrl: POSTERS.theBoys,
        status: 'completed',
        subtitle: 'Season 1',
        totalUnits: 8,
        currentEpisode: 8,
        currentPages: null,
        rating: 5,
        hours: 8,
        completedAt: daysAgo(2),
      },
      {
        type: 'movie',
        title: 'Interstellar',
        posterUrl: POSTERS.interstellar,
        status: 'completed',
        subtitle: 'Christopher Nolan',
        totalUnits: 1,
        currentEpisode: 1,
        currentPages: null,
        rating: 5,
        hours: 2.5,
        completedAt: daysAgo(5),
      },
      {
        type: 'anime',
        title: 'Spirited Away',
        posterUrl: POSTERS.spirited,
        status: 'completed',
        subtitle: 'Studio Ghibli',
        totalUnits: 1,
        currentEpisode: 1,
        currentPages: null,
        rating: 4.5,
        hours: 2,
        completedAt: daysAgo(9),
      },
      {
        type: 'manga',
        title: 'Death Note',
        posterUrl: POSTERS.deathNote,
        status: 'completed',
        subtitle: 'Tsugumi Ohba',
        totalUnits: 108,
        currentEpisode: null,
        currentPages: 108,
        rating: 4.5,
        hours: 6,
        completedAt: daysAgo(12),
      },
      {
        type: 'novel',
        title: 'Project Hail Mary',
        posterUrl: POSTERS.hailMary,
        status: 'completed',
        subtitle: 'Andy Weir',
        totalUnits: 476,
        currentEpisode: null,
        currentPages: 476,
        rating: 4,
        hours: 5,
        completedAt: daysAgo(16),
      },
      {
        type: 'youtube',
        title: 'Veritasium — The Universe is Hostile to Computers',
        posterUrl: POSTERS.youtube,
        status: 'completed',
        subtitle: 'YouTube',
        totalUnits: 1,
        currentEpisode: 1,
        currentPages: null,
        rating: 4,
        hours: 1.5,
        completedAt: daysAgo(20),
      },
      {
        type: 'movie',
        title: 'Arrival',
        posterUrl: POSTERS.arrival,
        status: 'completed',
        subtitle: 'Denis Villeneuve',
        totalUnits: 1,
        currentEpisode: 1,
        currentPages: null,
        rating: 4.5,
        hours: 2,
        completedAt: daysAgo(7),
      },
    ];

    const created = specs.map((spec) =>
      em.create(MediaItem, {
        user,
        type: spec.type,
        title: spec.title,
        posterUrl: spec.posterUrl,
        status: spec.status,
        subtitle: spec.subtitle,
        totalUnits: spec.totalUnits,
        currentEpisode: spec.currentEpisode,
        currentPages: spec.currentPages,
        rating: spec.rating,
        hours: spec.hours,
        completedAt: spec.completedAt,
      }),
    );
    await em.persist(created).flush();

    const onePiece = created.find((item) => item.title === 'One Piece')!;
    const dune = created.find((item) => item.title === 'Dune')!;

    const logs: MediaProgress[] = [
      em.create(MediaProgress, {
        media: onePiece,
        episode: 1020,
        hours: 0.4,
        note: 'Wano stretch',
      }),
      em.create(MediaProgress, {
        media: dune,
        pages: 255,
        hours: 0.5,
        note: 'Read 25 pages',
      }),
      em.create(MediaProgress, {
        media: onePiece,
        episode: 1021,
        hours: 0.4,
      }),
    ];
    logs[0].createdAt = daysAgo(2);
    logs[1].createdAt = daysAgo(1);
    logs[2].createdAt = daysAgo(0);
    await em.persist(logs).flush();
    await this.ensureHeatmapHistory(em);
  }

  /**
   * Spread Kristijan watch/read logs across the last 6 months so the
   * Entertainment heatmap matches Personal OS (seed 42, 182 days).
   */
  async ensureHeatmapHistory(em: EntityManager = this.em): Promise<void> {
    const user = await em.findOne(User, { email: DEMO_EMAIL });
    if (!user) {
      return;
    }
    const marked = await em.count(MediaProgress, { media: { user }, note: 'demo-heatmap' });
    if (marked > 0) {
      return;
    }

    const onePiece = await em.findOne(MediaItem, { user, title: 'One Piece' });
    const dune = await em.findOne(MediaItem, { user, title: 'Dune' });
    if (!onePiece || !dune) {
      return;
    }

    const intensities = buildHeatmap(42, 182);
    const now = new Date();
    const logs: MediaProgress[] = [];
    for (let i = 0; i < intensities.length; i++) {
      const intensity = intensities[i];
      if (intensity <= 0) {
        continue;
      }
      const day = new Date(now);
      day.setHours(12, 0, 0, 0);
      day.setDate(day.getDate() - (intensities.length - 1 - i));
      const media = i % 2 === 0 ? onePiece : dune;
      for (let n = 0; n < intensity; n++) {
        const row = em.create(MediaProgress, {
          media,
          episode: media === onePiece ? 980 + (i % 40) : null,
          pages: media === dune ? 180 + (i % 90) : null,
          hours: 0.25,
          note: 'demo-heatmap',
        });
        row.createdAt = new Date(day.getTime() + n * 60_000);
        logs.push(row);
      }
    }
    if (logs.length > 0) {
      await em.persist(logs).flush();
    }
  }
}

function buildHeatmap(seed: number, count: number): number[] {
  const days: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 16807) % 2147483647;
    const v = s % 10;
    days.push(v < 1 ? 0 : v < 3 ? 1 : v < 6 ? 2 : v < 8 ? 3 : 4);
  }
  return days;
}
