---
name: pos-foundation
description: Scaffolds Cukatori NestJS API, MikroORM, Postgres Docker, JWT auth, and env/proxy. Use when implementing the foundation scenario or bootstrapping api/ and docker/.
---

# Foundation

Project skill only. Stay in `docker/**`, `api/**`, `.env.example`, `proxy.conf.json`.

## Do

1. Postgres 18 Alpine compose in `docker/docker-compose.db.yaml` + host port overlay `docker-compose.db.local.yaml` (5432). API compose optional.
2. `.env.example`: `POSTGRES_*`, `JWT_SECRET`, `DATABASE_URL`, `UPLOAD_DIR`, `PORT=3000`.
3. `proxy.conf.json` at repo root: `/api` → `http://localhost:3000`.
4. Nest already exists in `api/` (ESM, Nest 12). Do not `nest new` again.
5. Install in `api/`: `@mikro-orm/core` `@mikro-orm/nestjs` `@mikro-orm/postgresql` `@mikro-orm/migrations` `@mikro-orm/seeder` `@mikro-orm/decorators` `@nestjs/jwt` `@nestjs/config` `bcryptjs` `cookie-parser` `class-validator` `class-transformer`. Mikro 7: import entity decorators from `@mikro-orm/decorators/legacy`. Types as needed.
6. `api/src/mikro-orm.config.ts`: PostgreSQL, `entitiesTs: ['src/**/*.entity.ts']`, Migrator, SeedManager, `schemaGenerator` in non-prod.
7. Wire `MikroOrmModule.forRoot()` + `ConfigModule` in `app.module.ts` (this scenario may edit that hotspot).
8. `main.ts`: global prefix `api`, CORS + credentials for `:4200`, cookie parser, `ValidationPipe`.
9. Modules: `auth`, `users`. Dual HttpOnly cookies (garage pattern): `ck_access` (path `/`, JWT + `sid`) and `ck_refresh` (path `/api/auth`, opaque SHA-256 session, not rotated — slide expiry). Never put tokens in JSON. `POST /api/auth/login|register|refresh|logout`, `GET /api/auth/me` (guarded). Angular interceptor retries once on 401 via `/auth/refresh`. SameSite=Strict. No client-held tokens.
10. Seed user: `kristijan@local` / `cukatori` / displayName Kristijan.
11. Path alias `@cukatori/shared` → `../shared` in `api/tsconfig.json`.
12. On boot (dev): run pending migrations + `updateSchema`.

## Do not

- Implement feature CRUD (habits, workouts, finance).
- Touch Angular feature folders.
- Use `npx @nestjs/cli`. Use global `nest` if generating modules.
