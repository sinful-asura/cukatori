# Cukatori — Personal OS

Angular 22 frontend, NestJS API, PostgreSQL 18. Same local/deploy split as Knežević Garage: **Docker only for Postgres on the laptop**; Nest and `ng serve` stay on the host. Production images wrap all three.

## Local

```bash
cp .env.example .env
npm install
cd api && npm install && cd ..

npm run local              # db + api + fe
npm run local -- db        # Postgres 18 container, :5432
npm run local -- api       # nest start --watch on :3000
npm run local -- fe        # ng serve on :4200 (proxies /api)
npm run local -- seed
```

Open [http://localhost:4200](http://localhost:4200). API: [http://localhost:3000/api/health](http://localhost:3000/api/health).

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

CLIs: global `ng` and `nest`. Do not `ng new` again.
