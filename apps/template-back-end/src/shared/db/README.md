# Database — Schema Architecture

## Stack

- **ORM**: [Drizzle ORM](https://orm.drizzle.team) v0.45
- **Database**: Cloudflare D1 (SQLite)
- **Engine**: SQLite via `drizzle-orm/sqlite-core`
- **Migrations**: Drizzle Kit (`drizzle-kit generate`)
- **Seed**: Node scripts with `tsx`
- **Connection**: `drizzle-orm/d1` using Hono context-storage

## Directory Structure

```
db/
├── index.ts                # D1 connection via Drizzle
├── schema/
│   ├── index.ts            # Re-exports all schemas
│   ├── user/
│   │   └── index.ts        # User table definition & relations
│   ├── item/
│   │   └── index.ts        # Example entity: item table, relations & types
│   └── ...
├── seed/
│   ├── seed.ts             # Seed data script
│   ├── seed.sql            # Generated SQL (do not touch manually)
│   └── reset-db.ts         # Reset migrations script
└── README.md               # This file
```

## Conventions for creating a new Schema

### 1. Create the schema folder

```
schema/<entity>/
└── index.ts
```

### 2. Structure of `index.ts`

```ts
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const ITEM_STATUSES = ["active", "inactive"] as const;

export const item = sqliteTable("item", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name").notNull().unique(),
  status: text("status", { enum: ITEM_STATUSES }).notNull().default("active"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const itemRelations = relations(item, ({ one, many }) => ({
  // Define FK relations here
}));

export type Item = typeof item.$inferSelect;
export type NewItem = typeof item.$inferInsert;
```

### 3. Export in `schema/index.ts`

```ts
export * from "./user";
export * from "./item";
```

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Table name (DB) | `snake_case` | `user`, `item_category` |
| Variable name (TS) | `camelCase` | `user`, `itemCategory` |
| Folder name | `snake_case` | `item_category/` |
| Column name (DB) | `snake_case` | `first_name`, `created_at` |
| Field name (TS) | `camelCase` | `firstName`, `createdAt` |
| ID type | `text` UUID v4 | `text("id").primaryKey().$defaultFn(() => uuidv4())` |
| Timestamps | `created_at`, `updated_at` | Always present with `CURRENT_TIMESTAMP` |

## Available Data Types

| Drizzle Type | SQLite | Usage |
|-------------|--------|-------|
| `text()` | `TEXT` | Strings, IDs, enums, dates as ISO |
| `integer()` | `INTEGER` | Whole numbers, booleans (0/1) |
| `real()` | `REAL` | Decimal numbers |

## Relations — Common Patterns

### One-to-Many (FK)

```ts
export const itemRelations = relations(item, ({ one }) => ({
  user: one(user, {
    fields: [item.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  items: many(item),
}));
```

## Important Considerations

1. **Always use UUID v4** as IDs to avoid conflicts in distributed systems.
2. **Always include `createdAt` and `updatedAt`** with `CURRENT_TIMESTAMP`.
3. **Use `onDelete: "cascade"`** on FKs for referential integrity.
4. **DB names are `snake_case`**, TS names are `camelCase`.
5. **Enums in SQLite are handled as `text()`** with a `const` array in TS.
6. **`$defaultFn(() => uuidv4())`** auto-generates UUIDs on insert.
7. **DROP order in `reset-db.ts`** must be inverse of dependency order.

## Workflow

```bash
# 1. Define/modify schemas in src/shared/db/schema/
# 2. Generate migrations
pnpm run db:generate
# 3. Apply migrations + seed (local)
pnpm run db:setup:local
# 4. Apply migrations + seed (remote)
pnpm run db:setup:remote
# 5. Full reset
pnpm run db:seed -- --fresh        # local
pnpm run db:seed -- --fresh --remote  # remote
```
