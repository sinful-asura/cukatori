import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

export const PHOTO_TYPES = ['front', 'back', 'side', 'other'] as const;
export type PhotoType = (typeof PHOTO_TYPES)[number];

@Entity({ tableName: 'progress_photos' })
export class Photo {
  [OptionalProps]?: 'takenAt' | 'bodyweight' | 'notes' | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  @Index()
  type!: PhotoType;

  @Property()
  takenAt: Date = new Date();

  @Property({ type: 'float', nullable: true })
  bodyweight: number | null = null;

  @Property({ type: 'text', nullable: true })
  notes: string | null = null;

  @Property()
  mimeType!: string;

  @Property()
  storageKey!: string;

  @Property()
  originalName!: string;

  @Property()
  createdAt: Date = new Date();
}
