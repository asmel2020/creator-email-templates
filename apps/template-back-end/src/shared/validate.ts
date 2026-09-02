import { ValidationTargets } from "hono/types";
import { validator } from "hono-openapi";
import { ApiEnv } from "@/config/env";
import { Context } from "hono";

function formatDetails(issues: readonly any[]) {
  return issues.map((issue) => ({
    field: issue.path?.join(".") || "unknown",
    message: issue.message,
  }));
}

export function validate(
  target: keyof ValidationTargets,
  schema: any,
  options?: any,
) {
  return validator(
    target,
    schema,
    (result, c: Context<ApiEnv>) => {
      const reqId = c?.get("requestId") ?? "NO_REQ_ID";
      const user = c?.get("user");
      if (!result.success) {
        console.error({
          requestId: reqId,
          userId: user?.id ?? "ANONYMOUS",
          path: c.req.path,
          method: c.req.method,
          status: 400,
          type: "VALIDATION_ERROR",
          message: "Invalid data",
          details: formatDetails(result.error ?? []),
        });
        return c.json(
          {
            success: false,
            error: {
              message: "Invalid data",
              code: 400,
              details: formatDetails(result.error ?? []),
            },
          },
          400,
        );
      }
    },
    options,
  );
}
