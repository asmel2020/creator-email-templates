import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { getContext } from "hono/context-storage";

import type { ApiEnv } from "@/config/env";
import * as schema from "./schema";

export function db(): DrizzleD1Database<typeof schema> {
  const ctx = getContext<ApiEnv>();
  if (!ctx?.env) throw new Error("Context not found");
  return drizzle(ctx!.env.DB, { schema });
}
