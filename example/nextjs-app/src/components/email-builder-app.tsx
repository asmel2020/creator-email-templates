"use client";

import { EmailBuilder, EmailBuilderProvider } from "create-email-template";
import type {
  AutosavePayload,
  EmailBuilderConfig,
  UploadImage,
} from "create-email-template";
import { ServerRenderPreview } from "@/components/server-render-preview";
import "create-email-template/style.css";
/**
 * Config de muestra: todos los campos son opcionales; quita o cambia lo que
 * necesites. Si omites `config` por completo, el builder usa los defaults.
 */
export const config: EmailBuilderConfig = {
  blockDefaults: {
    text: {
      text: "Hola {firstName}, gracias por ser parte de nuestra comunidad.",
      size: 15,
    },
    button: {
      label: "Quiero mi cupo",
      href: "{registerUrl}",
      backgroundColor: "#d7b227",
      color: "#0d0b08",
    },
    footer: {
      text: "Recibes este correo por estar registrado en {companyName}. Date de baja en {unsubscribeUrl}",
      brandName: "Mi Marca",
    },
  },
  sampleContext: {
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan@ejemplo.com",
    companyName: "Mi Empresa",
    registerUrl: "https://mi-sitio.com/registro",
    unsubscribeUrl: "https://mi-sitio.com/baja",
    supportEmail: "soporte@mi-sitio.com",
  },
};

/** Subida de imágenes demo: URL blob local temporal (en prod, sube a tu CDN). */
const uploadImage: UploadImage = async (file) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return URL.createObjectURL(file);
};

/**
 * Autoguardado contra el endpoint server-side de esta misma app
 * (src/app/api/render/route.ts), que usa create-email-renderer para
 * responder `{ json, html }` — el mismo contrato de PUT /templates/:id.
 */
const onSave = async (payload: AutosavePayload) => {
  const res = await fetch("/api/render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: "Plantilla de ejemplo",
      payload,
    }),
  });
  if (!res.ok) {
    throw new Error(`El backend rechazó el guardado (${res.status})`);
  }
  return (await res.json()) as { json: AutosavePayload; html: string };
};

export default function EmailBuilderApp() {
  return (
    <EmailBuilderProvider
      config={config}
      uploadImage={uploadImage}
      autosave={{
        intervalMs: 10_000,
        onSave,
        onSaved: (result) => {
          if (!result.ok) console.error("[autosave] error:", result.error);
        },
      }}
    >
      <EmailBuilder />

      {/* Prueba del render en servidor: JSON del editor → /api/render → iframe */}
      <ServerRenderPreview />
    </EmailBuilderProvider>
  );
}
