import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { createItemSchema, updateItemSchema } from "../validate";

export const listItemsDocs = describeRoute({
  description: "List all items belonging to the authenticated user.",
  responses: {
    200: { description: "List of items" },
    401: { description: "Unauthorized" },
  },
});

export const getItemDocs = describeRoute({
  description: "Get a single item by ID (must belong to the authenticated user).",
  responses: {
    200: { description: "Item found" },
    401: { description: "Unauthorized" },
    404: { description: "Item not found" },
  },
});

export const createItemDocs = describeRoute({
  description: "Create a new item for the authenticated user.",
  responses: {
    201: { description: "Item created" },
    400: { description: "Validation error" },
    401: { description: "Unauthorized" },
  },
});

export const updateItemDocs = describeRoute({
  description: "Update an existing item (must belong to the authenticated user).",
  responses: {
    200: { description: "Item updated" },
    400: { description: "Validation error" },
    401: { description: "Unauthorized" },
    404: { description: "Item not found" },
  },
});

export const deleteItemDocs = describeRoute({
  description: "Delete an item. Requires ADMIN role.",
  responses: {
    200: { description: "Item deleted" },
    401: { description: "Unauthorized" },
    403: { description: "Forbidden — requires ADMIN role" },
    404: { description: "Item not found" },
  },
});
