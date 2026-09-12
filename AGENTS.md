# Ascend OS agent notes

Read this before writing UI. Spec lives in [PROJECT.md](PROJECT.md). Visual source is [`.cursor/references/ui-landing.jpg`](.cursor/references/ui-landing.jpg). Swarm ownership is [`.cursor/rules/swarm-ownership.mdc`](.cursor/rules/swarm-ownership.mdc).

## Stack

Angular 22 standalone **SPA** (no SSR / no hydration) + NestJS + MikroORM 7 + Postgres 18. Shared DTOs in `shared/`. Nest cannot import repo-root `shared/` — keep `api/src/contracts/` in sync. Do not add `provideClientHydration`, `src/server.ts`, or `@angular/ssr`.

Local: Docker for Postgres only (`:5433`). API `:3000`, FE `:4200`. `.env` `PORT` is Nest; `npm run local -- fe` unsets it.

Routes: `/` → `/landing`. Signed-in shell is `/os/*`. Old `/app/*` redirects to `/os/*`.

## PrimeNG (required)

Use **PrimeNG 22** from [primeng.dev](https://primeng.dev/). Do **not** rebuild tables, dialogs, tabs, toasts, menus, meters, file upload, or galleries from scratch.

Installed:

- `primeng` 22.1.x
- `@primeuix/themes` (Aura preset, not `@primeng/themes`)
- `primeicons`
- `@angular/cdk` (peer)

Wiring (already on `main`, do not re-add):

- `providePrimeNG` + `ascendPreset` in `src/app/app.config.ts`
- Dark mode locked via `<html class="app-dark">` and `darkModeSelector: '.app-dark'`
- Global `<p-toast>` on `App` + `MessageService`
- Tokens: primary `#ff4d3a`, surfaces `#07070b` / `#101014` / `#141418`

Import only the component you use:

```ts
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Table } from 'primeng/table';
```

Theme overrides go through `definePreset` / design tokens, not `::ng-deep`.

`Chart` and `Editor` are deprecated in v22 (PrimeUI PRO). Use `MeterGroup` / `ProgressBar` / KPI `Card`s instead of a donut library.

License: PrimeNG 22 shows an **Invalid PrimeUI License** badge without a key. Register a free community license at [primeui.dev/licenses/community](https://primeui.dev/licenses/community) (individuals / small orgs) and put it in `.env` as `PRIME_NG_LICENCE` (or `PRIME_NG_LICENSE`). `npm run local -- fe` / `npm run build -- fe` inject it into `environment.primeNgLicense`. Do not invent a key or commit `.env`. The key is not a secret (it ships in the bundle) but do not publish someone else’s.

## Component picks

| Surface | Use these | Do not |
|---|---|---|
| Shell rail / chrome | `Menu`, `Menubar`, `Avatar`, `Badge`, `Chip` | Custom sidebar kits, game HUD |
| Landing CTAs | `Button` | Homegrown pills if a `p-button` fits |
| Quick-log / search | `CommandMenu`, `InputText`, `IconField` | Autonomous agent chat UI |
| Goals | `Card`, `Tabs`, `MeterGroup`, `Tag`, `Button` | Custom CSS-only meters |
| Habits | `Card`, `Checkbox`, `Tag`, `Button` | Custom checklist widgets |
| Dashboard | `Card`, `MeterGroup`, `Chip`, `Skeleton`, `Tag` | Re-layout the shell |
| Timeline | `Timeline`, `Tag`, `Select` | Custom event list chrome |
| Achievements | `Card`, `Tag`, `Badge` | Inventory / RPG grids |
| Settings | `Select`, `ToggleButton`, `InputText`, `Button` | |
| Exercise log / PRs | `Tabs`, `Table`, `Tag`, `ProgressBar`, `Card` | Medical body-comp UI |
| Body map / insights | SVG map is custom; wrap chrome in `Card` / `Tabs` / `Message` / `Tag` | Reimplement workout table |
| Photos | `FileUpload`, `Gallery`, `Compare` | Public image URLs |
| Entertainment | `DataView`, `Tabs`, `Gallery`, `Rating`, `Select`, `Dialog` | Public user uploads |
| Finance | `Table`, `Tabs`, `Select`, `DatePicker`, `InputNumber`, `FileUpload`, `MeterGroup`, `Tag` | Community `Chart` (deprecated) |
| Journal | `Textarea`, `InputText`, `Dialog`, `FileUpload`, `Tag` | Store plaintext bodies |
| Reports | `Card`, `Tabs`, `Table`, `Button` (print), `Tag` | LLM copy |
| Celebrations | `Toast` via `MessageService` | Game overlays |
| Confirmations | `ConfirmDialog` / `ConfirmPopup` | `window.confirm` |

## v22 names (do not use the old ones)

| Deprecated | Use instead |
|---|---|
| Galleria / Image | `Gallery` |
| ColorPicker | `InputColor` |
| Password component | `pInputPassword` |
| MultiSelect | `Select` with `multiple` |
| ScrollPanel | `ScrollArea` |
| ImageCompare | `Compare` |
| PanelMenu | `Menu` with `toggleable` |
| `pTemplate` | `ng-template` + template ref |
| `@primeng/themes` | `@primeuix/themes` |

## Swarm

One scenario → one skill under `.cursor/skills/` → one Cursor worktree (`/worktree`, under `~/.cursor/worktrees/`) when isolation is needed. Stay in `allowedPaths`. Hotspots are orchestrator-only. Emit through `ActivityBus`; never write `XpLedger` / `Streak` from a feature module. Prefer `INTEGRATION.md` over editing `app.module.ts` / `app.routes.ts`.
