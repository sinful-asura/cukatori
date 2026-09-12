# Ascend OS

A private life OS for one person: habits, goals, workouts, entertainment, finance, an encrypted journal, and a weekly recap. Activity from every module goes through one bus so XP, streaks, and the timeline stay consistent. Demo user is **Kristijan** (level 18, 12-day streak).

Stack: Angular 22 **SPA** (no server-side rendering), NestJS, PostgreSQL 18. Same local/deploy split as Knežević Garage — **Docker only for Postgres on the laptop**; Nest and `ng serve` stay on the host. Production images wrap all three. The FE image is static files behind nginx.

Full spec: [PROJECT.md](PROJECT.md). Agent UI rules and PrimeNG component picks: [AGENTS.md](AGENTS.md). PrimeNG 22 needs a [community license key](https://primeui.dev/licenses/community) in `src/app/core/environment.ts` (`primeNgLicense`) or the app shows a license badge.

## Local

Needs Python 3.12 (see `.python-version`) and global `ng` / `nest`. Do not run `ng new` again.

```bash
cp .env.example .env
npm install
cd api && npm install && cd ..

npm run local              # db + api + fe
npm run local -- db        # Postgres 18 container, host :5433 (Garage already uses :5432)
npm run local -- api       # Nest watch on :3000
npm run local -- fe        # ng serve on :4200 (proxies /api → :3000)
npm run local -- seed
```

Open [http://localhost:4200](http://localhost:4200) (`/` → `/landing`). Signed-in OS is under `/os` (old `/app` URLs redirect there). API: [http://localhost:3000/api/health](http://localhost:3000/api/health).

`.env` `PORT=3000` is **Nest only**. Angular CLI also reads `PORT`, so `npm run local -- fe` unsets it and passes `--port 4200`. Do not point `ng serve` at 3000.

TypeScript 6 deprecates `baseUrl` (TS5101). Path aliases in `tsconfig.json` use `./shared/...` — do not add `baseUrl` back or the frontend will not compile. Incremental `*.tsbuildinfo` files are gitignored.

## Production

```bash
npm run build -- api
npm run build -- fe
npm run deploy             # images (+ push if DOCKER_REGISTRY is set)
npm run deploy -- nginx    # host nginx site (garage layout)
```

On the server: `docker compose --env-file .env -f docker/docker-compose.prod.yaml up -d`. Host nginx (`src/nginx/nginx.conf`) proxies `/api/` → `:3000` and `/` → `:8080`.

## Layout

| Path | Role |
|---|---|
| `src/app/` | Angular app |
| `api/` | NestJS |
| `shared/` | DTOs shared by both |
| `docker/` | Compose stacks |
| `src/web/` | FE image (nginx + Angular) |
| `src/nginx/` | Host nginx |
| `scripts/cmd/` | `local` / `build` / `deploy` |
| `.cursor/` | Project-scoped swarm skills |
