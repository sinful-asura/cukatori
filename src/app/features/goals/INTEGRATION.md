# Goals integration

See `src/app/features/habits/INTEGRATION.md` and `api/src/modules/goals/INTEGRATION.md`.

`GoalsApi` is at `src/app/core/api/goals.api.ts`. Page is `/os/goals`. Orchestrator should import `GoalsModule` in `app.module.ts` only.

UI ports Personal OS `GoalsView`: Achieve / Goals header, Active / Average / On pace stats, Active/Completed tabs, `p-card.pos-panel` goal list, `p-progressbar`, detail pane with `app-pos-line-chart`.
