# Finance integration

Hotspot edits are left to the orchestrator. This slice stays inside the finance allowed paths.

## Nest (`api/src/app.module.ts`)

Register the module so controllers come up:

```ts
import { FinanceModule } from './modules/finance/finance.module.js';

@Module({
  imports: [
    // existing modules…
    FinanceModule,
  ],
})
export class AppModule {}
```

Entities are `*.entity.ts` under `api/src/modules/finance/` and are already covered by the MikroORM glob in `mikro-orm.config.ts`. No config change.

`FinanceModule` imports `AuthModule` (cookie JWT guard) and `ActivityModule` (`ActivityBus`).

## Angular

`/os/finance` already lazy-loads `FINANCE_ROUTES` from `src/app/features/finance/finance.routes.ts`. No `app.routes.ts` change.

HTTP client: `src/app/core/api/finance.api.ts`.

## Shared

DTOs live in `shared/finance`. The feature imports `@ascend-os/shared/finance`. Optionally re-export from `shared/index.ts`:

```ts
export * from './finance';
```

Nest keeps an inlined copy at `api/src/modules/finance/finance.contracts.ts` (Nest cannot import repo-root `shared/`).

## Activity / XP

Expense create and XML import emit `EXPENSE_CREATED` (10 XP) via `ActivityBus`. Income emits `INCOME_CREATED`. This module never writes `XpLedger` or `Streak`.

Budget overshoot is not a separate activity type. It is flagged on the same event:

- `payload.budgetOvershoot`
- `payload.overBy`
- `payload.notify.kind = 'budget_overshoot'`
- tag `budget-overshoot`

Notifications / notes can subscribe later. There is no notes API in this worktree.

## Demo + fixture

First finance request for a user seeds default categories and the Take control September 2026 demo (€2,431 / food / shopping / transport, McDonald's, budgets). Seed writes do **not** emit XP.

XML sample: `api/fixtures/bank-sample.xml` (generic `{date,amount,merchant,category}` list; extra rows import after the demo seed, duplicates are skipped).
