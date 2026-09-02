import * as React from "react";
void React;
import { render } from "@react-email/render";
import { EmailTemplate } from "./blocks";
import type {
  EmailBlock,
  EmailContext,
  EmailPalette,
  EmailSettings,
} from "./types";
import { DEFAULT_PALETTE } from "./default-blocks";
import { SAMPLE_CONTEXT } from "./variables";

export interface RenderEmailHtmlOptions {
  blocks: EmailBlock[];
  subject?: string;
  context?: EmailContext;
  settings?: Partial<EmailSettings>;
  palette?: EmailPalette;
}

// `@react-email/render` se mantiene EXTERNO en el bundle: el bundler del
// consumidor (webpack/Next) resuelve su build por entorno (node -> react-dom/server,
// browser -> react-dom/server.browser), evitando el error de prepareHostDispatcher
// en route handlers de Node y el bloqueo de `react-dom/server` en el cliente.
export const renderEmailHtml = async ({
  blocks,
  subject = "",
  context = SAMPLE_CONTEXT,
  settings = {},
  palette = DEFAULT_PALETTE,
}: RenderEmailHtmlOptions): Promise<string> =>
  render(
    <EmailTemplate
      blocks={blocks}
      subject={subject}
      context={context}
      palette={palette}
      pageBackground={settings.pageBackground}
      cardBorderWidth={settings.cardBorderWidth}
      cardBorderRadius={settings.cardBorderRadius}
    />,
  );