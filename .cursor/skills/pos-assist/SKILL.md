---
name: pos-assist
description: Implements quick-log NLP, speech-to-text wiring, celebration toasts, and Kristijan demo seed. Use when implementing the assist scenario, voice logging, or demo seeder.
---

# Assist + seed

Project skill only. Allowed: `shared/nlp/**`, `api/src/modules/quick-log/**`, `api/src/seeders/**`, `src/app/core/quick-log/**`, `src/app/shared/ui/celebration-host/**`.

## Parser (`shared/nlp`)

Deterministic tokens/regex, used by Angular and Nest:

- `Bench 100 kilos 8 reps` → Bench Press 100 kg × 8
- Multi-set `Bench 100 for 8, 100 for 7, 95 for 9`
- `Spent 35 euros on lunch`
- `Finished watching Dune` / `Read 20 pages` / `Completed today's workout`

`POST /api/quick-log` `{ text }` dispatches to the owning module if present; otherwise persist a typed stub + `ActivityBus.emit`.

Web Speech API fills the same text field. No autonomous agent loop.

## UI

Restyle quick-log + celebrations to Personal OS (`.cursor/references/DESIGN.md`). PrimeNG `CommandMenu` / `Dialog` / `InputText` / `Toast` via `MessageService`. Elevated `#222221` buttons, `#3b3a37` hairlines, Geist. No coral, no game HUD.

## Seed

Kristijan matching the landing mockup: level 18, 2840/3000 XP, 12-day streak, Back & Biceps 6420 kg, media One Piece + Dune, finance €2431, journal titles only (ciphertext placeholders).

## Do not

- Edit `app.module.ts` except if you are the only one creating `QuickLogModule` — still prefer `INTEGRATION.md`.
