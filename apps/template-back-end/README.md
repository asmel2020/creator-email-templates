# Template API — Hono + Cloudflare Workers + D1

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Hono](https://hono.dev) v4 |
| Runtime | [Cloudflare Workers](https://workers.cloudflare.com) |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) v0.45 |
| Migrations | [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview) |
| Validation | [Zod](https://zod.dev) v4 |
| Auth | [jose](https://github.com/panva/jose) (JWT) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| Docs | [hono-openapi](https://github.com/rhinobase/hono-openapi) + [Swagger UI](https://swagger.io/tools/swagger-ui/) |
| Storage | [Cloudflare R2](https://developers.cloudflare.com/r2/) (via S3 SDK) |
| AI | [OpenAI](https://openai.com) / [OpenRouter](https://openrouter.ai) |

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and fill environment variables
cp .dev.vars.example .dev.vars

# 3. Create a D1 database (local)
pnpm exec wrangler d1 create template-db

# 4. Set up schema + seed data (local)
pnpm run db:setup:local

# 5. Start dev server
pnpm run dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start local dev server (http://localhost:8787) |
| `pnpm run deploy` | Deploy to Cloudflare Workers |
| `pnpm run db:generate` | Generate Drizzle migration files |
| `pnpm run db:migrate:local` | Apply migrations to local D1 |
| `pnpm run db:migrate:remote` | Apply migrations to remote D1 |
| `pnpm run db:seed` | Run seed data script |
| `pnpm run db:seed:remote` | Run seed data on remote D1 |
| `pnpm run db:reset` | Drop all tables, regenerate & reapply migrations |
| `pnpm run db:setup:local` | Migrate + seed (local) |
| `pnpm run db:setup:remote` | Migrate + seed (remote) |

## Project Structure

```
src/
├── index.ts                  # App entry point, route mounting
├── config/
│   └── env.ts                # Types: ApiEnv, RequestUser, Roles
├── shared/
│   ├── handle.ts             # Unified request handler with error wrapping
│   ├── validate.ts           # Zod validation wrapper for Hono
│   ├── db/
│   │   ├── index.ts          # D1 connection factory
│   │   ├── schema/           # Drizzle table definitions
│   │   │   ├── index.ts      # Re-exports all schemas
│   │   │   ├── user/         # User table
│   │   │   ├── rol/          # Roles table
│   │   │   ├── user_rol/     # User ↔ Rol pivot table
│   │   │   └── item/         # Example entity
│   │   └── seed/             # Seed scripts
│   ├── lib/
│   │   ├── jwt.ts            # JWT encode/decode
│   │   ├── money.ts          # Money utility class
│   │   ├── openai.ts         # AI service (OpenRouter)
│   │   └── r2.ts             # R2 storage service
│   └── middleware/
│       ├── auth.ts           # JWT auth + role validation
│       └── dev-only.ts       # Restrict routes to dev environment
└── modules/
    ├── auth/                 # Auth module (login, me)
    └── items/                # Items CRUD module (example)
```

## Module Pattern

Each module follows this structure:

```
modules/<name>/
├── routes.ts        # Hono route definitions
├── services.ts      # Business logic + DB queries
├── validate.ts      # Zod validation schemas
├── README.md        # Module documentation
└── docs/            # OpenAPI route documentation
    └── <name>-docs.ts
```

### Route Pattern

```ts
authRoutes.post(
  "/login",
  loginDocs,                          // OpenAPI doc
  validate("json", loginSchema),      // Zod validation
  handle(async ({ body }) => {        // Unified handler
    return login(body);
  }),
);
```

### Middleware Stack (per route)

1. `auth(["ADMIN", "USER"])` — JWT decode + role check
2. `validate("json", schema)` — Zod parsing
3. `handle(fn, options?)` — Error wrapping + standardized response

## Adding a New Entity

1. Create schema: `src/shared/db/schema/<entity>/index.ts`
2. Export in: `src/shared/db/schema/index.ts`
3. Generate migration: `pnpm run db:generate`
4. Create module: `src/modules/<entity>/`
5. Register routes in: `src/index.ts`

## Authentication

- `POST /v1/auth/login` — Returns JWT for valid credentials
- `GET /v1/auth/me` — Returns authenticated user profile

Seed user: `admin@example.com` / `admin` (roles: ADMIN, USER)

## API Docs

- Swagger UI: http://localhost:8787/swagger (dev only)
- OpenAPI JSON: http://localhost:8787/openapi.json (dev only)
