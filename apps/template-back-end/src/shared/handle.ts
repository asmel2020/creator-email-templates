import type { Context, Env } from "hono";
import { HTTPException } from "hono/http-exception";
import { getContext } from "hono/context-storage";
import type { ApiVariables } from "@/config/env";

interface HandleEnv extends Env {
  Variables: ApiVariables;
}

// 1. Estructura unificada que recibirá la función de la ruta
export interface ParsedRequest<E extends Env = HandleEnv> {
  body: any;
  query: any;
  params: any;
  raw: Context<E>;
}

// 2. Opciones de configuración para el handler
export interface HandleOptions {
  status?: number;
  headers?: Record<string, string>;
}

// 3. El wrapper principal 'handle'
export function handle<E extends HandleEnv = HandleEnv>(
  fn: (req: ParsedRequest<E>) => Promise<any> | any,
  options?: HandleOptions,
) {
  return async (c: Context<E>) => {
    try {
      // Intenta extraer automáticamente lo que haya sido validado previamente por Zod/Hono
      let body: any = undefined;
      let query: any = undefined;
      let params: any = undefined;

      try {
        body = c.req.valid("json" as never);
      } catch {}
      try {
        query = c.req.valid("query" as never);
      } catch {}
      try {
        params = c.req.valid("param" as never);
      } catch {}

      // Ejecuta el controlador pasando el objeto 'req'
      const data = await fn({
        body,
        query,
        params,
        raw: c,
      });

      const status = options?.status ?? 200;

      // Aplica cabeceras personalizadas si existen
      if (options?.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          c.header(key, value);
        });
      }

      // Si es 204 No Content, HTTP prohíbe enviar un cuerpo de respuesta
      if (status === 204) {
        return c.body(null, 204);
      }

      // Formato estandarizado de respuesta exitosa
      return c.json(
        {
          success: true,
          data: data ?? null,
        },
        status as any,
      );
    } catch (err: any) {
      // Recupera el contexto global (RequestId y Usuario JWT si existen)
      const ctx = getContext<E>();
      const reqId = ctx?.get("requestId") ?? "NO_REQ_ID";
      const user = ctx?.get("user");

      let status = 500;
      let message = "Error interno del servidor";
      let details: any = undefined;

      if (err instanceof HTTPException) {
        status = err.status;
        message = err.message;

        // Si el error traía un JSON estructurado de validación Zod, lo extrae
        try {
          details = JSON.parse(err.message);
          message = "Error de validación en los datos enviados";
        } catch {
          // Si no era JSON, mantiene el mensaje de texto original
        }
      } else {
        status = 500;
        message = "Error interno del servidor";
      }

      // Log estructurado pensado para la Observabilidad de Cloudflare Workers
      console.error({
        requestId: reqId,
        userId: user?.id ?? "ANONYMOUS",
        path: c.req.path,
        method: c.req.method,
        status,
        type: "HANDLER_ERROR",
        rawMessage: err instanceof Error ? err.message : String(err),
        details,
        stack: err instanceof Error ? err.stack : undefined,
      });

      // Formato estandarizado de error para el cliente (sanitizado en 500)
      return c.json(
        {
          success: false,
          error: {
            message: status === 500 ? "Error interno del servidor" : message,
            code: status,
            ...(details && { details }),
          },
        },
        status as any,
      );
    }
  };
}
