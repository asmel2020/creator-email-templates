import { z } from "zod";
import { ITEM_STATUSES } from "@/shared/db/schema/item";

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  status: z.enum(ITEM_STATUSES).optional().default("active"),
});

export const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(ITEM_STATUSES).optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
