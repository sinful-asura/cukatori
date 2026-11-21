# Ascend OS

A private life OS for one person: habits, goals, workouts, entertainment, finance, an encrypted journal, and a weekly recap. Activity from every module goes through one bus so XP, streaks, and the timeline stay consistent. Demo user is **Kristijan** (level 18, 12-day streak).

Stack: Angular 22 **SPA** (no server-side rendering), NestJS, PostgreSQL 18. Same local/deploy split as Knežević Garage — **Docker only for Postgres on the laptop**; Nest and `ng serve` stay on the host. Production images wrap all three. The FE image is static files behind nginx.

Full spec: [PROJECT.md](PROJECT.md). Agent UI rules and PrimeNG component picks: [AGENTS.md](AGENTS.md). PrimeNG 22 needs a [community license key](https://primeui.dev/licenses/community) in `.env` as `PRIME_NG_LICENCE` (injected at `ng serve` / `ng build`) or the app shows a license badge.

## Local

Tools are pinned in `mise.toml` (node, the Angular CLI); platform commands come from `nytera-infra`.
Do not run `ng new` again.

```bash
cp .env.example .env
task setup                 # pinned tools, then npm ci for the frontend and the API

task dev                   # db + api + web, in the dekit terminal UI
task dev -- api            # Nest watch on :3000, and the database
task dev -- web            # ng serve on :4200 (proxies /api → :3000)
task test                  # API and frontend unit tests
```

Open [http://localhost:4200](http://localhost:4200) (`/` → `/landing`). Signed-in OS is under `/os` (old `/app` URLs redirect there). API: [http://localhost:3000/api/health](http://localhost:3000/api/health).

`.env` `PORT=3000` is **Nest only**. Angular CLI also reads `PORT`; the dev server is started with its own port, so do not point `ng serve` at the `.env` value.

TypeScript 6 deprecates `baseUrl` (TS5101). Path aliases in `tsconfig.json` use `./shared/...` — do not add `baseUrl` back or the frontend will not compile. Incremental `*.tsbuildinfo` files are gitignored.

## Release

Local cluster only for now (experimental; there are no production values).

```bash
task release               # build both images and deploy to the local cluster (ny local:up first)
```

## Layout

| Path | Role |
|---|---|
| `src/app/` | Angular app |
| `api/` | NestJS |
| `shared/` | DTOs shared by both |
| `deploy/` | What the platform deploys: `app.yaml`, the web image, Helm values |
| `compose.yaml`, `dekit.yaml` | Database for development; the processes `task dev` runs |
| `.cursor/` | Project-scoped swarm skills |
