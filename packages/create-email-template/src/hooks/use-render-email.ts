"use client";

import { useCallback, useRef, useState } from "react";
import { renderEmailHtml } from "../core/render";
import { resolveVariables } from "../core/variables";
import type { EmailContext } from "../core/types";
import {
  useEmailBuilderConfig,
  useEmailBuilderStoreInstance,
} from "../store/email-builder-provider";

export interface RenderEmailOptions {
  context?: EmailContext;
  subject?: string;
}

export const useRenderEmail = () => {
  const store = useEmailBuilderStoreInstance();
  const config = useEmailBuilderConfig();
  const [isPending, setIsPending] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const htmlRef = useRef<string | null>(null);

  const renderHtml = useCallback(
    async (opts?: RenderEmailOptions) => {
      const state = store.getState();
      setIsPending(true);
      try {
        const result = await renderEmailHtml({
          blocks: state.blocks,
          subject: opts?.subject ?? "",
          context: opts?.context ?? config.sampleContext,
          settings: state.settings,
          palette: config.palette,
        });
        htmlRef.current = result;
        setHtml(result);
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [store, config],
  );

  /** Devuelve el HTML del correo; si aún no se generó (o se pasan opciones), lo genera. */
  const getHtml = useCallback(
    async (opts?: RenderEmailOptions): Promise<string> => {
      if (!opts && htmlRef.current) return htmlRef.current;
      return renderHtml(opts);
    },
    [renderHtml],
  );

  /** Payload para guardar: `{ content, settings }` (bloques + ajustes del template). */
  const getPayload = useCallback(
    () => store.getState().getPayload(),
    [store],
  );

  /** Inyecta los valores de las etiquetas `{}` en un texto.
   *  Usa el `sampleContext` de la config por defecto; puedes pasar otro contexto. */
  const resolve = useCallback(
    (text: string, context?: EmailContext): string =>
      resolveVariables(text, context ?? config.sampleContext),
    [config],
  );

  return {
    renderHtml,
    getHtml,
    getPayload,
    resolve,
    html,
    isPending,
    setHtml,
  };
};