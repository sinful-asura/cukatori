# Activity + XP integration

`ActivityModule` is already imported in `api/src/app.module.ts`. It now also imports the modules below so their controllers register without a hotspot edit. Orchestrator may still import them explicitly:

```ts
import { ActivityModule } from './modules/activity/activity.module.js';
import { GamificationModule } from './modules/gamification/gamification.module.js';
import { NotesModule } from './modules/notes/notes.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';

@Module({
  imports: [
    // …
    ActivityModule,
    GamificationModule,
    NotesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
```

MikroORM already globs `src/**/*.entity.ts` — no `mikro-orm.config.ts` change.

## Contracts for other scenarios

- Feature modules **only** call `ActivityBus.emit(userId, input)`. Do not write `XpLedger` or `Streak`.
- `GET /api/activity` and `GET /api/timeline` — filters: `category`, `type`, `from`, `to`, `tag`. Auth required.
- `GET /api/me/stats` → `{ level, xp, xpNext, totalXp, streaks }`. `xp` / `xpNext` are progress through the current level bar.
- `GET /api/achievements` — unlocked + locked defs (for dashboard `achievements.api.ts`).
- Notes: `GET|POST /api/notes`, `PATCH|DELETE /api/notes/:id`.
- Notifications: `GET /api/notifications`, `PATCH /api/notifications/:id/read`.
- Frontend: `ActivityApi`, `MeApi` (`providedIn: 'root'`). No pages here.

## Seed (assist)

Level curve is `xpFor(level) = round(100 * level * 1.15^(level-1))` via `totalXpBeforeLevel` + `SEED_LEVEL` / `SEED_XP_INTO` in `shared/xp`. Persist ledger total `totalXpBeforeLevel(18) + 2840` so Kristijan is level 18 with 2840 into the current bar. The landing mockup’s 3,000 next-bar is display copy; `xpNext` follows the curve (`xpFor(18)`), not 3000.

Streak kinds: `training`, `overall`, `habit:{id}`. Touch `training` on `WORKOUT_COMPLETED`; `habit:{id}` when `payload.habitId` is set.

## Achievements evaluated on emit

`first_workout`, `ten_workouts`, `seven_day_streak`, `level_up`, `personal_record` (`PERSONAL_RECORD` or `payload.pr` / `payload.personalRecord`).
