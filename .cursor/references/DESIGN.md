# UI source of truth

**Primary:** the Personal OS reference at `.cursor/references/personal-os/` (copied from `/mnt/c/Users/itkri/Downloads/personal-os`). Match that 1440w warm-dark dashboard **exactly**.

`ui-landing.jpg` is secondary (marketing layout only). When tokens or chrome conflict, Personal OS wins.

## Canvas (do not approximate)

| Token | Value | Use |
|---|---|---|
| `--bg-root` | `#111110` | Page + sidebar |
| `--bg-card` | `#191918` | Panel / card body |
| `--bg-elevated` | `#222221` | Active nav, buttons, table header, workspace chip |
| `--bg-hover` | `#2a2a28` | Hover + chart grid |
| `--border` | `#3b3a37` | Hairlines |
| `--text` | `#eeeeec` | Primary |
| `--text-secondary` | `#b5b3ad` | Stat labels |
| `--text-muted` | `#7d7b74` | Nav idle, axis |
| `--text-dim` | `#6f6d67` | Icons dim |
| `--accent` | `#0091ff` | Charts, heatmap, selection |
| `--accent-positive` | `#34d56b` | |
| `--accent-warning` | `#eab308` | |
| `--accent-ai` | `#8b5cf6` | |
| `--accent-warm` | `#fde047` | Habits series |

Radius: 4 / 8 / 12 / 16 (`--radius-1` … `--radius-4`). Cards `16px`. Nav items `12px`. Buttons `8px`.

Type: **Geist** 400/500. Page title `20px/28px` medium. Body `14px/20px`. Stat figures `32px/40px`. Section `16px`. Panel title `14px`.

Layout chrome: **296px** sidebar, **1200px** content column, `24px` horizontal page padding, `16px` card padding, `12px` nav rows, `8px` buttons. Full-bleed canvas — **no** floating rounded app frame, **no** coral hero glow.

## Shell

Copy `.cursor/references/personal-os/shell/Sidebar.tsx` + `AppShell.tsx`.

- Workspace chip (27px circle + “Kristijan’s workspace”)
- Primary: Dashboard, Goals, Habits, Exercise, Entertainment
- Secondary: Finance, Journal, Reports, Timeline, Achievements, Settings
- Keep Insights + Photos in secondary (Ascend extra)
- User row: avatar + Kristijan + search (opens quick-log). No top search bar.
- Icons: PrimeIcons. Active row `bg-elevated` + `--text`. Idle `--text-muted`.

## PrimeNG (required)

Do **not** port the React primitives as custom kits. Map:

| Personal OS | PrimeNG 22 |
|---|---|
| `Button` / `MenuButton` | `Button` / `SelectButton` / `Select` |
| `Panel` | `Card` (`styleClass="pos-panel"`) |
| `PageHeader` | page `<header class="pos-page-header">` (shared component) |
| table | `Table` |
| tabs | `Tabs` |
| progress | `ProgressBar` / `MeterGroup` |
| chips | `Chip` / `Tag` |
| dialogs | `Dialog` |
| line/bar/donut | SVG from `primitives.tsx` is allowed (PrimeNG `Chart` is deprecated). Prefer `MeterGroup` / KPI numbers when a full chart is not needed. |

Theme tokens go through `ascendPreset` + `:root`. No `::ng-deep`.

Shared Angular ports of the Personal OS charts live in `src/app/shared/ui/pos/` (`PosLineChart`, `PosBarChart`, `PosDonutChart`, `PosHeatmap`, `PosStat`, `PosPanelHeader`, `PosChartToggle`, `PageHeader`). Import those instead of rebuilding SVG.

## Page rhythm

Every `/os/*` page:

```html
<header class="pos-page-header">
  <div>
    <h1>Title</h1>
    <p class="kicker">One line, 14px secondary</p>
  </div>
  <!-- optional p-button / p-select -->
</header>
```

Dashboard reference: `personal-os/dashboard/DashboardView.tsx` — “Today overview”, 32px stats row, two chart panels, hourly `p-table`.

Module references: `personal-os/modules/*.tsx`. Keep Ascend APIs, Kristijan seed, hedged fitness copy, encrypted journal.

## Do not

- Reintroduce `#ff4d3a`, Inter-as-brand, or the floating `#101014` frame
- Rebuild tables/tabs/dialogs in CSS
- Change API contracts or Nest modules unless a visual need is blocked
