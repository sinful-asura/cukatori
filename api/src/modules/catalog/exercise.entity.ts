import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';

@Entity({ tableName: 'exercises' })
export class Exercise {
  [OptionalProps]?: 'secondaryMuscles' | 'aliases' | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property()
  name!: string;

  @Property()
  @Unique()
  slug!: string;

  @Property()
  @Index()
  primaryMuscle!: string;

  @Property({ type: 'array' })
  secondaryMuscles: string[] = [];

  @Property()
  equipment!: string;

  @Property()
  pattern!: string;

  @Property()
  kind!: string;

  @Property()
  difficulty!: string;

  @Property({ type: 'array' })
  aliases: string[] = [];

  @Property()
  createdAt: Date = new Date();
}
