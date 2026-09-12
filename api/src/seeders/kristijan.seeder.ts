import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { seedKristijan } from './seed-kristijan.js';

export class KristijanSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await seedKristijan(em);
  }
}
