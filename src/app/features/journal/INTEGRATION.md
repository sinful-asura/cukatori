# Journal integration

## Nest (`api/src/app.module.ts`)

Import the module. MikroORM already globs `src/**/*.entity.ts`, so `journal.entity.ts` and `journal-vault.entity.ts` are picked up without a config change.

```ts
import { JournalModule } from './modules/journal/journal.module.js';

@Module({
  imports: [
    // …
    JournalModule,
  ],
})
export class AppModule {}
```

## Angular

`/os/journal` already lazy-loads `JOURNAL_ROUTES`. Optional: `export * from './journal'` in `shared/index.ts` if you want `@ascend-os/shared` root re-exports. Feature code imports `@ascend-os/shared/journal`.

## Activity

`POST /api/journal` emits `JOURNAL_CREATED` through `ActivityBus` with `{ entryId }` only — no body, no ciphertext. XP comes from the shared table (15). This module does not write `XpLedger` or `Streak`.
