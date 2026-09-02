import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import { db } from "@/shared/db";

import type { ApiEnv, RequestUser, Roles } from "@/config/env";
import { decodeJWT } from "@/shared/lib/jwt";
import { MiddlewareHandler } from "hono";

export const auth = (allowedRoles: Roles[]): MiddlewareHandler =>
  createMiddleware<ApiEnv>(async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new HTTPException(401, {
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.slice(7);

    try {
      const { payload } = await decodeJWT<{ sub: string }>(token);
      const userId = payload.sub;

      const database = db();
      const dbUser = await database.query.user.findFirst({
        where: (u, { eq }) => eq(u.id, userId),
        with: {
          userRoles: {
            with: {
              rol: true,
            },
          },
        },
      });

      if (!dbUser) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }

      const roles = dbUser.userRoles.map((ur) => ur.rol.rol) as Roles[];

      const hasAuthorizedRole = allowedRoles.some((role) =>
        roles.includes(role),
      );
      if (!hasAuthorizedRole) {
        throw new HTTPException(403, {
          message: "Insufficient permissions to access this endpoint",
        });
      }

      const requestUser: RequestUser = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        roles,
      };

      c.set("user", requestUser);
      await next();
    } catch (err) {
      if (err instanceof HTTPException) throw err;
      throw new HTTPException(401, { message: "Invalid or expired token" });
    }
  });
