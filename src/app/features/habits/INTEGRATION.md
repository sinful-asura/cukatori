# Habits + goals integration

Routes `/os/habits` and `/os/goals` already lazy-load `HABITS_ROUTES` / `GOALS_ROUTES`. Do not edit `app.routes.ts`.

Pages use Personal OS chrome: `app-page-header`, `p-card.pos-panel`, PrimeNG `Checkbox` / `ProgressBar` / `Tabs` / `Select` / `Tag` / `Button`, plus read-only `app-pos-stat` / `app-pos-line-chart`.

## Nest (`api/src/app.module.ts`)

```ts
import { GoalsModule } from './modules/goals/goals.module.js';
import { HabitsModule } from './modules/habits/habits.module.js';

imports: [
  HabitsModule,
  GoalsModule,
]
```

## Shared barrel (`shared/index.ts`)

Optional — feature pages import `@ascend-os/shared/habits` and `@ascend-os/shared/goals` directly.

```ts
export * from './habits';
export * from './goals';
```

## Dashboard

Compose Today + Goals with `HabitsApi` and `GoalsApi`. Demo seed: gym / 20 pages / expenses / water; books 8/12 (67%), save €960/€2,000 (48%), workout 8/10 sessions (80%).
