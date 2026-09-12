# Exercise core integration

Do not edit hotspots from this scenario. Orchestrator should apply the notes below.

## Nest (`api/src/app.module.ts`)

Import both modules. MikroORM already globs `src/**/*.entity.ts`, so `mikro-orm.config.ts` does not need a change.

```ts
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { ExerciseModule } from './modules/exercise/exercise.module.js';

imports: [
  // …
  CatalogModule,
  ExerciseModule,
]
```

`ExerciseModule` already imports `CatalogModule`, `ActivityModule`, and `AuthModule`. Importing `ExerciseModule` alone also registers `GET /api/exercises`. Listing both keeps ownership obvious.

## Shared barrel (`shared/index.ts`)

Frontend imports `@ascend-os/shared/exercise` (path-mapped). Optional barrel add:

```ts
export * from './exercise';
```

## Nest contracts (`api/src/contracts/exercise.ts`)

Optional copy of `shared/exercise`. Types used by Nest live under `api/src/modules/{catalog,exercise}` so the API does not import repo-root `shared/`.

## Routes

`/os/exercise` already lazy-loads `EXERCISE_ROUTES`. No `app.routes.ts` change.

## Activity

`POST /api/workouts/:id/complete` emits `WORKOUT_COMPLETED` (180 XP) and one `PERSONAL_RECORD` (40 XP) per new max weight / reps / e1RM / lift volume. This module does not write `XpLedger` or `Streak`.

## Demo

First authenticated `GET /api/workouts` or `GET /api/exercises` seeds ~109 catalog lifts plus Kristijan’s Back & Biceps pair (Wed Sep 10, 6,420 kg, 14 sets, 3 PRs, possible +8%). Until the modules are registered, the page shows that snapshot from local fallback data.
