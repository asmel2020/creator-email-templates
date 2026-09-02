import * as React from "react";
void React;
import { render } from "@react-email/render";
import { EmailTemplate } from "./blocks";
import { resolveVariables, SAMPLE_CONTEXT } from "./variables";
import type { EmailBlock, EmailContext, EmailPalette, EmailSettings } from "./types";
import { DEFAULT_PALETTE } from "./default-blocks";

export interface TemplatePayload {
  content: EmailBlock[];
  settings: Partial<EmailSettings>;
}

export const parseTemplatePayload = (
  payload: string | object | null | undefined,
): TemplatePayload => {
  if (!payload) return { content: [], settings: {} };
  try {
    const parsed = typeof payload === "string" ? JSON.parse(payload) : (payload as any);
    return {
      content: Array.isArray(parsed?.content) ? parsed.content : [],
      settings: parsed?.settings || {},
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
 * Helper limpio para renderizar una plantilla completa desde su payload JSON.
 * Esconde el `React.createElement` / `render(<EmailTemplate>)` feo.
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

  const html = await render(
    React.createElement(EmailTemplate as any, {
      blocks,
      subject,
      context: mergedContext,
      palette,
      pageBackground: (finalSettings as any).pageBackground,
      cardBorderWidth: (finalSettings as any).cardBorderWidth,
      cardBorderRadius: (finalSettings as any).cardBorderRadius,
    }),
  );

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
