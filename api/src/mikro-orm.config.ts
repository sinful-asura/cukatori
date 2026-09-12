import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';

const clientUrl =
  process.env.DATABASE_URL ??
  'postgresql://ascend:ascend@localhost:5432/ascend';

export default defineConfig({
  clientUrl,
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  metadataProvider: ReflectMetadataProvider,
  extensions: [Migrator, SeedManager],
  schemaGenerator: {
    disableForeignKeys: true,
  },
});
