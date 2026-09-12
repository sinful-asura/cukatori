---
name: pos-activity-xp
description: Implements ActivityBus, activity events, XP, levels, streaks, achievements, notes, and notifications. Use when implementing the activity-xp scenario or gamification spine.
---

# Activity + XP

Project skill only. Allowed: `api/src/modules/{activity,gamification,notes,notifications}/**`, `src/app/core/api/activity.api.ts`, `src/app/core/api/me.api.ts`.

If `shared/activity` or `shared/xp` are missing, add types there (additive). Prefer existing `@cukatori/shared` exports.

## Backend

1. `ActivityEvent` entity: category, type, occurredAt, title, summary, xpAwarded, payload jsonb, tags text[].
2. `ActivityBus.emit(userId, ActivityEmitInput)` persists the event, looks up XP from `shared/xp` unless overridden, then calls XpService, StreakService, AchievementService.
3. `GET /api/activity` and `GET /api/timeline` with filters: category, type, from, to, tag.
4. `XpLedger`, level curve `xpFor(level) = 100 * level * 1.15^(level-1)`. Target seed: level 18, 2840 / 3000.
5. `Streak` kinds: `training`, `overall`, `habit:{id}`.
6. `AchievementDef` + `UserAchievement`. Unlock on emit (first workout, 10 workouts, 7-day streak, level-up, PR — evaluate if payload allows).
7. `Note` (entityType, entityId, body, tags) and `Notification`.
8. `GET /api/me/stats` → level, xp, xpNext, streaks.

## Frontend

`ActivityApi` and `MeApi` Http clients only. No pages (dashboard scenario owns those).

## Do not

- Edit `app.module.ts`. Leave `INTEGRATION.md` listing the modules to import.
- Award XP inside other feature services — they must call `ActivityBus`.
