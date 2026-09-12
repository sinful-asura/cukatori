# Reports integration

Do not edit these from the reports worktree. Orchestrator-only.

## API (`api/src/app.module.ts`)

Import `ReportsModule`:

```ts
import { ReportsModule } from './modules/reports/reports.module.js';

@Module({
  imports: [
    // …
    ReportsModule,
  ],
})
export class AppModule {}
```

No new entities. Aggregation reads `ActivityEvent` via `EntityManager` (no feature-service imports).

## Shared (`shared/index.ts`)

Optional barrel:

```ts
export * from './recap';
```

The frontend already imports `@ascend-os/shared/recap` via the existing path alias.

## Shell (`src/app/core/layout/app-shell/app-shell.ts`)

Add a rail link (Understand group):

```ts
{ path: '/os/reports', label: 'Reports' }
```

## Routes

`/os/reports` is already lazy-loaded from `src/app/app.routes.ts`. No route hotspot change.

## Print

The page calls `window.print()` and toggles `body.reports-printing`. Feature CSS hides the rail/header while printing. Optional global print rules can live in `src/styles.scss` later.

## Contracts

`GET /api/reports/week?start=YYYY-MM-DD` and `GET /api/reports/coach` are cookie-auth. Week start is UTC Monday when `start` is omitted. Copy is deterministic templates over `ActivityEvent` payloads — no LLM.
