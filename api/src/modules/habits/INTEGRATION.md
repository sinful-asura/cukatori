# Habits module

Wire in `api/src/app.module.ts` (hotspot — orchestrator only):

```ts
import { HabitsModule } from './modules/habits/habits.module.js';

imports: [
  // ...
  HabitsModule,
]
```

Mikro already globs `src/**/*.entity.ts`. Do not edit `mikro-orm.config.ts`.

Endpoints (AuthGuard + CurrentUser):

- `GET/POST /api/habits`
- `GET/PATCH/DELETE /api/habits/:id`
- `POST /api/habits/:id/complete` → `ActivityBus.emit` `HABIT_COMPLETED` (xp from habit `xpHint`, default 25)

Empty users receive the Kristijan demo list (gym / 20 pages / expenses / water).
