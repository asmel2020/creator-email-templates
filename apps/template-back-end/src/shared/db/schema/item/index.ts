import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { user } from "../user";

export const ITEM_STATUSES = ["active", "inactive", "archived"] as const;

export const item = sqliteTable("item", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name").notNull().unique(),
  description: text("description"),
  status: text("status", { enum: ITEM_STATUSES })
    .notNull()
    .default("active"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const itemRelations = relations(item, ({ one }) => ({
  user: one(user, {
    fields: [item.userId],
    references: [user.id],
  }),
}));

export type Item = typeof item.$inferSelect;
export type NewItem = typeof item.$inferInsert;
