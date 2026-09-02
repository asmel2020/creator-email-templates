import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { user } from "../user";
import { rol } from "../rol";

export const userRol = sqliteTable(
  "user_rol",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rolId: text("rol_id")
      .notNull()
      .references(() => rol.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.rolId] }),
  }),
);

export const userRolRelations = relations(userRol, ({ one }) => ({
  user: one(user, {
    fields: [userRol.userId],
    references: [user.id],
  }),
  rol: one(rol, {
    fields: [userRol.rolId],
    references: [rol.id],
  }),
}));
