import { Hono } from "hono";
import { handle } from "@/shared/handle";
import { auth } from "@/shared/middleware/auth";
import type { ApiEnv } from "@/config/env";
import { validate } from "@/shared/validate";
import {
  createItemSchema,
  updateItemSchema,
  type CreateItemInput,
  type UpdateItemInput,
} from "./validate";
import {
  listItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "./services";
import {
  listItemsDocs,
  getItemDocs,
  createItemDocs,
  updateItemDocs,
  deleteItemDocs,
} from "./docs/items-docs";

const itemsRoutes = new Hono<ApiEnv>();

itemsRoutes.get(
  "/",
  auth(["ADMIN", "USER"]),
  listItemsDocs,
  handle(async (req) => {
    const user = req.raw.get("user")!;
    return listItems(user.id);
  }),
);

itemsRoutes.get(
  "/:id",
  auth(["ADMIN", "USER"]),
  getItemDocs,
  handle(async (req) => {
    const user = req.raw.get("user")!;
    return getItemById(req.params.id, user.id);
  }),
);

itemsRoutes.post(
  "/",
  auth(["ADMIN", "USER"]),
  createItemDocs,
  validate("json", createItemSchema),
  handle(async ({ body, raw }: { body: CreateItemInput; raw: any }) => {
    const user = raw.get("user")!;
    return createItem(body, user.id);
  }, { status: 201 }),
);

itemsRoutes.put(
  "/:id",
  auth(["ADMIN", "USER"]),
  updateItemDocs,
  validate("json", updateItemSchema),
  handle(async ({ body, params, raw }: { body: UpdateItemInput; params: { id: string }; raw: any }) => {
    const user = raw.get("user")!;
    return updateItem(params.id, body, user.id);
  }),
);

itemsRoutes.delete(
  "/:id",
  auth(["ADMIN"]),
  deleteItemDocs,
  handle(async (req) => {
    await deleteItem(req.params.id);
    return { deleted: true };
  }),
);

export { itemsRoutes };
