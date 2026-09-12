import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

@Entity({ tableName: 'notes' })
export class Note {
  [OptionalProps]?: 'tags' | 'createdAt' | 'updatedAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  @Index()
  user!: User;

  @Property()
  @Index()
  entityType!: string;

  @Property()
  @Index()
  entityId!: string;

  @Property({ type: 'text' })
  body!: string;

  @Property({ type: 'array' })
  tags: string[] = [];

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
