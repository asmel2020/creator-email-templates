import { Hono } from "hono";
import { handle } from "@/shared/handle";
import { auth } from "@/shared/middleware/auth";
import type { ApiEnv } from "@/config/env";
import { login } from "./services";
import { validate } from "@/shared/validate";
import { LoginInput, loginSchema } from "./validate";
import { loginDocs } from "./docs/login-docs";

const authRoutes = new Hono<ApiEnv>();

authRoutes.post(
  "/login",
  loginDocs,
  validate("json", loginSchema),
  handle(async ({ body }: { body: LoginInput }) => {
    return login(body);
  }),
);

authRoutes.get(
  "/me",
  auth(["ADMIN", "USER"]),
  handle(async (req) => {
    const user = req.raw.get("user");
    return user;
  }),
);

export { authRoutes };
