# Ascend OS Cursor pack (project-scoped)

This directory is the **only** home for Ascend OS skills, agents, and swarm rules.

- Skills: `.cursor/skills/<name>/SKILL.md`
- Agents: `.cursor/agents/`
- Rules: `.cursor/rules/`
- Scenarios: `.cursor/scenarios.json`

Do **not** install these under `~/.cursor/skills/` or `~/.cursor/agents/`. They apply only when this repo is the workspace.

Pattern: one scenario in `scenarios.json` → one skill → one subagent (`pos-implementer`).
