---
name: pos-habits-goals
description: Implements habits and goals APIs and pages for Cukatori. Use when implementing the habits-goals scenario, habit completion, or goal progress.
---

# Habits + goals

Project skill only. Allowed: `api/src/modules/{habits,goals}/**`, `src/app/features/{habits,goals}/**`, `src/app/core/api/{habits,goals}.api.ts`, `shared/{habits,goals}/**`.

## Contracts

- Habit: title, schedule, xp hint. `POST /api/habits/:id/complete` → `ActivityBus.emit` `HABIT_COMPLETED` (default 25 XP).
- Goal: title, kind, target, current, unit, deadline, status. `POST /api/goals/:id/progress` → `GOAL_PROGRESSED` / `GOAL_COMPLETED` (60 XP on milestone).
- Seed-shaped demo: gym / read 20 pages / log expenses / water; goals read 12 books 8/12, save €2000, workout 3×/week.

## UI

Match landing dashboard: checklist rows with XP hints; goal meters (thin bars, muted labels, 67% / 48% / 80%). Dark cards, 20px radius. Export `habits.routes.ts` and `goals.routes.ts`.

## Do not

- Build the dashboard composition page.
- Write streaks/XP tables yourself — emit only.
- Edit `app.module.ts` or `app.routes.ts`; note imports in `INTEGRATION.md`.
