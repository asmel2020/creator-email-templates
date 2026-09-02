// Entry server-safe: renderiza plantillas completas desde su payload JSON
// sin React. Pensado para route handlers / servicios (Node, Workers, edge).
import { resolveVariables, SAMPLE_CONTEXT } from "./variables.js";
import { renderEmailHtml } from "./html-render.js";
import { normalizeBlocks, normalizeSettings } from "./normalize.js";
import type {
  EmailBlock,
  EmailContext,
  EmailPalette,
  EmailSettings,
} from "./types.js";
import { DEFAULT_PALETTE } from "./default-blocks.js";

// Nota: `renderEmailHtml` NO se re-exporta aquí a propósito — el paquete UI
// exporta su propia versión (preview React) con el mismo nombre desde
// core/render. Para el HTML puro: `import { renderEmailHtml } from
// "create-email-renderer/html-render"`.

export interface TemplatePayload {
  content: EmailBlock[];
  settings: Partial<EmailSettings>;
}

export const parseTemplatePayload = (
  payload: string | object | null | undefined,
): TemplatePayload => {
  if (!payload) return { content: [], settings: {} };
  try {
    const parsed =
      typeof payload === "string" ? JSON.parse(payload) : (payload as any);
    return {
      // Normaliza contra el esquema actual: descarta tipos desconocidos,
      // completa props faltantes con defaults y repara ids.
      content: normalizeBlocks(parsed?.content),
      settings: parsed?.settings
        ? normalizeSettings(parsed.settings)
        : {},
    };
  } catch {
    return { content: [], settings: {} };
  }
};

export interface RenderTemplateEmailOptions {
  subject: string;
  payload: string | object | null | undefined;
  context?: EmailContext;
  settings?: Partial<EmailSettings>;
  palette?: EmailPalette;
}

export interface RenderedTemplateEmail {
  html: string;
  subject: string;
}

/**
 * Helper para renderizar una plantilla completa desde su payload JSON.
 * Uso: `const {html, subject} = await renderTemplateEmail({subject, payload, context})`
 */
export const renderTemplateEmail = async ({
  subject,
  payload,
  context = SAMPLE_CONTEXT,
  settings: overrideSettings,
  palette = DEFAULT_PALETTE,
}: RenderTemplateEmailOptions): Promise<RenderedTemplateEmail> => {
  const mergedContext: EmailContext = {
    ...SAMPLE_CONTEXT,
    ...(context || {}),
  };

  const { content: blocks, settings } = parseTemplatePayload(payload);

  if (!blocks || blocks.length === 0) {
    throw new Error("Template payload has no blocks");
  }

  const finalSettings = { ...settings, ...(overrideSettings || {}) };

  const html = await renderEmailHtml({
    blocks,
    subject,
    context: mergedContext,
    settings: finalSettings,
    palette,
  });

  const resolvedSubject = resolveVariables(subject, mergedContext);

  return { html, subject: resolvedSubject };
};

export const buildTemplateContext = (
  base: EmailContext,
  extra?: Record<string, string | undefined | null>,
): EmailContext => {
  const cleaned: EmailContext = { ...base };
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v != null && v !== "") cleaned[k] = String(v);
    }
  }
  return { ...SAMPLE_CONTEXT, ...cleaned };
};
