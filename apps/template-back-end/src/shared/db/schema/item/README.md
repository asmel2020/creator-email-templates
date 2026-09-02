# Table: `item`

Example entity showing the full schema pattern including FK relations, enum constraints, and type exports.

## Fields

| Field | DB Column | Type | Constraints | Description |
|-------|-----------|------|-------------|-------------|
| `id` | `id` | `text` | `PK`, UUID auto-generated | Unique identifier |
| `name` | `name` | `text` | `NOT NULL`, `UNIQUE` | Item name |
| `description` | `description` | `text` | — | Optional description |
| `status` | `status` | `text` | `NOT NULL`, DEFAULT `active` | One of: `active`, `inactive`, `archived` |
| `userId` | `user_id` | `text` | `NOT NULL`, FK → `user.id`, ON DELETE CASCADE | Owner of the item |
| `createdAt` | `created_at` | `text` | `NOT NULL`, DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |
| `updatedAt` | `updated_at` | `text` | `NOT NULL`, DEFAULT `CURRENT_TIMESTAMP` | Last update timestamp |

## Relationships

- **user**: Many-to-one — each item belongs to exactly one user (FK `user_id`)

## Exported Types

```ts
export type Item = typeof item.$inferSelect;      // Full row from DB
export type NewItem = typeof item.$inferInsert;   // Input for insert()
```

## Usage Example

```ts
import { db } from "@/shared/db";
import { item } from "@/shared/db/schema";
import { eq } from "drizzle-orm";

// Get all items for a user
const items = await db()
  .select()
  .from(item)
  .where(eq(item.userId, userId));

// Create
const created = await db()
  .insert(item)
  .values({ name: "My Item", userId })
  .returning();
```
