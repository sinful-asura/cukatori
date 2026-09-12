---
name: pos-swarm
description: Orchestrates the Ascend OS parallel swarm. Use when spawning subagents, assigning implementation scenarios, or continuing the hackathon build.
---

# Ascend OS swarm

**Scope:** these skills live only in this repo at `.cursor/skills/`. Never copy them to `~/.cursor/skills/` or `~/.cursor/agents/`.

Claude-plugin pattern: **one scenario → one project skill → one subagent**.

## How to spawn

1. Read `.cursor/scenarios.json`.
2. Skip scenarios already implemented (code exists and is more than a stub).
3. For each remaining scenario, launch a `generalPurpose` Task subagent in parallel (`run_in_background: true`).
4. Prompt template:

```
You are the Ascend OS pos-implementer for scenario "<id>".
Read and follow:
- /home/itkri/projects/cukatori/.cursor/agents/pos-implementer.md
- /home/itkri/projects/cukatori/.cursor/skills/<skill>/SKILL.md
- /home/itkri/projects/cukatori/.cursor/scenarios.json
- /home/itkri/projects/cukatori/.cursor/references/DESIGN.md
Stay in allowedPaths. Implement now. Do not start dev servers. Do not commit.
```

5. Attach `.cursor/references/ui-landing.jpg` when the scenario has UI. Point the agent at repo-root `AGENTS.md` (PrimeNG component picks). Isolate remaining parallel work with Cursor worktrees (`/worktree` or Agents Window). Checkouts live under `~/.cursor/worktrees/` so they are the agent workspace — do **not** add a gitignored `.worktrees/` folder inside this repo. Setup is `.cursor/worktrees.json` (copies `.env` only; do not symlink `node_modules`). Orchestrator merges the branch and deletes the worktree afterward.
6. After agents finish, the orchestrator only: wire hotspots, `app.module` imports, lazy routes, seed, and visual QA.

## Scenario map

| id | skill | UI |
|---|---|---|
| foundation | pos-foundation | no |
| shell | pos-shell | landing + app chrome |
| activity-xp | pos-activity-xp | no |
| habits-goals | pos-habits-goals | today/goals cards |
| dashboard | pos-dashboard | hero dashboard card |
| exercise-core | pos-exercise-core | train smarter card |
| exercise-intel | pos-exercise-intel | body map / insights |
| entertainment | pos-entertainment | library card |
| finance | pos-finance | take control card |
| journal | pos-journal | private space card |
| reports | pos-reports | weekly recap |
| assist | pos-assist | quick-log + seed |

Do not assign two agents the same `allowedPaths`.
