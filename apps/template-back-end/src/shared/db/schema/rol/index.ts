import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { userRol } from "../user_rol";

export const rol = sqliteTable("rol", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  rol: text("rol").notNull().unique(),
  description: text("description"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const rolRelations = relations(rol, ({ many }) => ({
  userRoles: many(userRol),
}));
