import { db } from "@/shared/db";
import { item as itemTable } from "@/shared/db/schema";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { CreateItemInput, UpdateItemInput } from "./validate";

export const listItems = async (userId: string) => {
  return db()
    .select()
    .from(itemTable)
    .where(eq(itemTable.userId, userId));
};

export const getItemById = async (id: string, userId: string) => {
  const [found] = await db()
    .select()
    .from(itemTable)
    .where(and(eq(itemTable.id, id), eq(itemTable.userId, userId)));

  if (!found) {
    throw new HTTPException(404, { message: "Item not found" });
  }

  return found;
};

export const createItem = async (input: CreateItemInput, userId: string) => {
  const [created] = await db()
    .insert(itemTable)
    .values({ ...input, userId, description: input.description ?? null })
    .returning();

  return created;
};

export const updateItem = async (
  id: string,
  input: UpdateItemInput,
  userId: string,
) => {
  const [found] = await db()
    .select()
    .from(itemTable)
    .where(and(eq(itemTable.id, id), eq(itemTable.userId, userId)));

  if (!found) {
    throw new HTTPException(404, { message: "Item not found" });
  }

  const [updated] = await db()
    .update(itemTable)
    .set(input)
    .where(and(eq(itemTable.id, id), eq(itemTable.userId, userId)))
    .returning();

  return updated;
};

export const deleteItem = async (id: string) => {
  const [found] = await db()
    .select()
    .from(itemTable)
    .where(eq(itemTable.id, id));

  if (!found) {
    throw new HTTPException(404, { message: "Item not found" });
  }

  await db().delete(itemTable).where(eq(itemTable.id, id));
};
