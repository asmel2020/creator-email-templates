import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/shared/db/schema/index.ts",
  out: "./drizzle",
});
