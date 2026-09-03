import { NextResponse } from "next/server";
import { parseTemplatePayload, renderTemplateEmail } from "create-email-renderer";
import type { EmailContext } from "create-email-renderer";

/**
 * Endpoint de guardado/render (simula PUT /templates/:id del backend real).
 *
 * Recibe:  { subject?, payload: { content, settings }, context? }
 * Devuelve: { json: payload normalizado, html, subject }
 *
 * El render ocurre 100% en el servidor con create-email-renderer (JS puro,
 * sin React): normaliza el payload y produce HTML email-safe (tablas +
 * inline styles).
 */
export async function POST(request: Request) {
  let body: {
    subject?: string;
    payload?: string | object | null;
    context?: EmailContext;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const subject = body.subject ?? "Sin asunto";

  try {
    const { html, subject: resolvedSubject } = await renderTemplateEmail({
      subject,
      payload: body.payload,
      context: body.context,
    });
    // parseTemplatePayload normaliza: descarta tipos desconocidos, completa
    // props con defaults y repara ids — esto es lo que persistirías en DB.
    const json = parseTemplatePayload(body.payload);
    return NextResponse.json({
      json,
      html,
      subject: resolvedSubject,
    });
  } catch (error) {
    // El caso más común: payload sin bloques tras normalizar.
    const message =
      error instanceof Error ? error.message : "Error renderizando la plantilla";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
