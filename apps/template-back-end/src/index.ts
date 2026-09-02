import { Hono } from "hono";
import { cors } from "hono/cors";
import { contextStorage } from "hono/context-storage";
import { requestId } from "hono/request-id";
import type { ApiEnv } from "@/config/env";
import { handle } from "@/shared/handle";
import { authRoutes } from "@/modules/auth/routes";
import { itemsRoutes } from "@/modules/items/routes";
import { openAPIRouteHandler } from "hono-openapi";
import { devOnly } from "./shared/middleware/dev-only";
import { swaggerUI } from "@hono/swagger-ui";

const app = new Hono<ApiEnv>();

app.use("*", contextStorage());
app.use("*", requestId());
app.use("*", cors());

app.get(
  "/health",
  handle(async () => {
    return { status: "ok" };
  }),
);

app.get(
  "/openapi.json",
  devOnly(),
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Template API v1",
        version: "1.0.0",
        description: "Template API documentation",
      },
      servers: [
        {
          url: "http://localhost:8787",
          description: "Local Development Server",
        },
      ],
    },
  }),
);

app.get(
  "/swagger",
  devOnly(),
  swaggerUI({
    url: "/openapi.json",
  }),
);

const v1 = new Hono<ApiEnv>();
v1.route("/auth", authRoutes);
v1.route("/items", itemsRoutes);
app.route("/v1", v1);

export default app;
