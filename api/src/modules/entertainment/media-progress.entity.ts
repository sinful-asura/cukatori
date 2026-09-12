import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { MediaItem } from './media-item.entity.js';

@Entity({ tableName: 'media_progress' })
export class MediaProgress {
  [OptionalProps]?: 'episode' | 'pages' | 'rating' | 'hours' | 'note' | 'completedAt' | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => MediaItem, { deleteRule: 'cascade' })
  @Index()
  media!: MediaItem;

  @Property({ type: 'int', nullable: true })
  episode: number | null = null;

  @Property({ type: 'int', nullable: true })
  pages: number | null = null;

  @Property({ type: 'float', nullable: true })
  rating: number | null = null;

  @Property({ type: 'float', nullable: true })
  hours: number | null = null;

  @Property({ type: 'text', nullable: true })
  note: string | null = null;

  @Property({ type: 'datetime', nullable: true })
  completedAt: Date | null = null;

  @Property()
  createdAt: Date = new Date();
}
