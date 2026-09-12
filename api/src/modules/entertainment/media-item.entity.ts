import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

@Entity({ tableName: 'media_items' })
export class MediaItem {
  [OptionalProps]?:
    | 'posterUrl'
    | 'subtitle'
    | 'totalUnits'
    | 'currentEpisode'
    | 'currentPages'
    | 'rating'
    | 'hours'
    | 'completedAt'
    | 'createdAt'
    | 'updatedAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  @Index()
  user!: User;

  @Property()
  @Index()
  type!: string;

  @Property()
  title!: string;

  @Property({ type: 'string', nullable: true })
  posterUrl: string | null = null;

  @Property()
  @Index()
  status!: string;

  @Property({ type: 'string', nullable: true })
  subtitle: string | null = null;

  @Property({ type: 'int', nullable: true })
  totalUnits: number | null = null;

  @Property({ type: 'int', nullable: true })
  currentEpisode: number | null = null;

  @Property({ type: 'int', nullable: true })
  currentPages: number | null = null;

  @Property({ type: 'float', nullable: true })
  rating: number | null = null;

  @Property({ type: 'float' })
  hours: number = 0;

  @Property({ type: 'datetime', nullable: true })
  completedAt: Date | null = null;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
