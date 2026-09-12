# Goals module

Wire in `api/src/app.module.ts` (hotspot — orchestrator only):

```ts
import { GoalsModule } from './modules/goals/goals.module.js';

imports: [
  // ...
  GoalsModule,
]
```

Mikro already globs `src/**/*.entity.ts`. Do not edit `mikro-orm.config.ts`.

Endpoints (AuthGuard + CurrentUser):

- `GET/POST /api/goals`
- `GET/PATCH/DELETE /api/goals/:id`
- `POST /api/goals/:id/progress` `{ delta?: number, current?: number }`
  - `GOAL_PROGRESSED` (10 XP) while active
  - `GOAL_COMPLETED` (60 XP) when current first reaches target

Empty users receive the Kristijan demo (12 books 8/12, save €2,000 at 48%, workout 3×/week at 80%).
