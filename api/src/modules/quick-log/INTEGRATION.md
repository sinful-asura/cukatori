# Assist — API integration

Do not edit `app.module.ts` from this scenario. Orchestrator wires the following.

## Nest module

```ts
import { QuickLogModule } from './modules/quick-log/quick-log.module.js';

@Module({
  imports: [
    // …
    QuickLogModule,
  ],
})
export class AppModule {}
```

`POST /api/quick-log` `{ text }` is auth-gated (`ao_access`). Cookies stay as they are.

## Seed Kristijan

```ts
import { seedKristijan } from './seeders/seed-kristijan.js';

async onModuleInit() {
  // after schema.update()
  await seedKristijan(this.orm.em.fork());
}
```

Idempotent. `SEED_KRISTIJAN=force` rebuilds demo activity rows. Standalone: `node dist/seeders/run.js` after `nest build`. Point `api` `seeder:run` at that script.

Demo login remains `kristijan@local` / `ascend`. Snapshot shape (level 18, 2840/3000 XP, 12-day streak, Back & Biceps 6420 kg, One Piece + Dune, €2431, journal titles + ciphertext placeholders) is `KRISTIJAN_DEMO` in `api/src/seeders/kristijan-demo.ts` and `GET /api/quick-log/demo`.

Journal bodies are ciphertext + IV only. Other modules should read `KRISTIJAN_DEMO` instead of inventing a second Kristijan.

## Optional owning-module dispatch

Register a handler and quick-log will call it instead of the typed stub:

| Token | Kinds |
|---|---|
| `ExerciseQuickLogHandler` | `workout_set`, `workout_complete` |
| `FinanceQuickLogHandler` | `expense` |
| `EntertainmentQuickLogHandler` | `media_complete`, `media_progress` |
| `HabitsQuickLogHandler` | `habit` |
| `JournalQuickLogHandler` | `journal` |

```ts
{ provide: 'FinanceQuickLogHandler', useExisting: FinanceQuickLogAdapter }
```

Handler: `{ handle(userId, parsed, raw): Promise<{ dispatchedTo, activity?, celebrations? } | null> }`. Return `null` to fall back to stub + `ActivityBus.emit`.

Do not write `XpLedger` / `Streak` from those adapters — emit through `ActivityBus` only.

## Contracts copy

`api/src/modules/quick-log/parse.ts` is a copy of `shared/nlp`. Nest still cannot import repo-root `shared/`. If you add `api/src/contracts/nlp.ts`, replace the local copy.
