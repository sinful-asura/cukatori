# Reports integration

Do not edit these from the reports worktree. Orchestrator-only.

## API (`api/src/app.module.ts`)

Import `ReportsModule` (already on this branch):

```ts
import { ReportsModule } from './modules/reports/reports.module.js';
```

No new entities. Aggregation reads `ActivityEvent` via `EntityManager` (no feature-service imports).

## Shared (`shared/index.ts`)

```ts
export * from './recap';
```

Frontend imports `@ascend-os/shared/recap`.

## Shell (`src/app/core/layout/app-shell/app-shell.ts`)

Rail link (already present):

```ts
{ path: '/os/reports', label: 'Reports', icon: 'pi pi-chart-bar' }
```

## Routes

`/os/reports` is already lazy-loaded from `src/app/app.routes.ts`. No route hotspot change.

## Print

The page calls `window.print()` and toggles `body.reports-printing`. Feature CSS hides the rail while printing.

## Contracts

Cookie-auth, deterministic templates, no LLM:

- `GET /api/reports/week?start=YYYY-MM-DD` — week KPIs (workouts, PRs, pages, spend), activity bars, highlights, sections
- `GET /api/reports/period?range=month|year&start=YYYY-MM-DD` — month/year aggregation for the Reports tabs
- `GET /api/reports/coach` — print/export JSON (frequency, volume, PRs, progression, muscle mix, consistency, history)
