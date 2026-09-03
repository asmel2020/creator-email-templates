import { renderTemplateEmail } from "create-email-renderer";
import type { EmailBlock } from "create-email-renderer";
import { config } from "@/components/email-builder-app";

/**
 * Página 100% server-side: renderiza un payload de ejemplo con
 * create-email-renderer en el servidor (Server Component async) y muestra el
 * HTML email-safe resultante. Demuestra el flujo de backend sin el editor.
 *
 * URL: /rendered
 */
export default async function RenderedPage() {
  const payload = {
    content: [
      {
        id: "demo-header",
        type: "header",
        props: { brandName: "Mi Marca", tagline: "Aprende antes de invertir" },
      },
      {
        id: "demo-hero",
        type: "hero",
        props: {
          title: "¡Hola {firstName}!",
          subtitle: "Gracias por suscribirte a nuestro boletín.",
        },
      },
      {
        id: "demo-text",
        type: "text",
        props: {
          text: "Este HTML fue renderizado en el servidor por <strong>create-email-renderer</strong> dentro de un Server Component de Next.js. Las variables como {companyName} se resuelven con el contexto.",
        },
      },
      {
        id: "demo-list",
        type: "list",
        props: { items: ["Sin React", "HTML email-safe", "Payload normalizado"] },
      },
      {
        id: "demo-button",
        type: "button",
        props: {
          label: "Visita mi sitio",
          href: "{registerUrl}",
          backgroundColor: "#d7b227",
          color: "#0d0b08",
        },
      },
      {
        id: "demo-footer",
        type: "footer",
        props: {
          text: "Recibes este correo por estar registrado en {companyName}. Date de baja en {unsubscribeUrl}",
          brandName: "Mi Marca",
        },
      },
    ] satisfies EmailBlock[],
    settings: {},
  };

  const { html, subject } = await renderTemplateEmail({
    subject: "Bienvenido, {firstName}",
    payload,
    context: config.sampleContext,
  });

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Render server-side</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Asunto resuelto: <code>{subject}</code> · HTML generado por
        <code> create-email-renderer</code> en un Server Component.
      </p>
      <iframe
        title="Email renderizado"
        srcDoc={html}
        style={{
          width: "100%",
          height: 800,
          border: "1px solid #ddd",
          borderRadius: 8,
          background: "#fff",
        }}
      />
    </main>
  );
}
