import type {
  AutosavePayload,
  EmailBuilderConfig,
  UploadImage,
} from "@repo/create-email-template"
import { renderTemplateEmail } from "@repo/create-email-renderer"

/**
 * Subida de imágenes de demostración: devuelve una URL blob local temporal.
 * En producción reemplazar por la subida real (R2/S3/tu API) devolviendo la
 * URL pública del archivo, p. ej.:
 *   const { url } = await miApi.uploadImagen(file)
 *   return url
 */
export const uploadImageDemo: UploadImage = async (file) => {
  await new Promise((resolve) => setTimeout(resolve, 600)) // simula latencia de red
  return URL.createObjectURL(file)
}

// Logo de marca por defecto para el bloque Header (data URI SVG para que
// funcione sin internet). En producción: "https://mi-cdn.com/logo.png".
const LOGO_MARCA =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='40'%3E%3Crect width='140' height='40' rx='6' fill='%230d0b08'/%3E%3Ctext x='70' y='26' font-family='Arial' font-size='13' font-weight='bold' fill='%23d7b227' text-anchor='middle'%3ESIN CORBATAS%3C/text%3E%3C/svg%3E"

/**
 * Configuración de muestra del builder: muestra los parámetros disponibles de
 * <EmailBuilderProvider config={{...}}>. Todos son opcionales; quita o cambia
 * lo que necesites.
 */
export const SAMPLE_EMAIL_BUILDER_CONFIG: EmailBuilderConfig = {
  // Valores iniciales por tipo de bloque (se aplican al arrastrar el bloque)
  blockDefaults: {
    header: {
      brandName: "Sin Corbatas",
      tagline: "Aprende antes de invertir",
      logoUrl: LOGO_MARCA,
    },
    heading: {
      color: "#0d0b08",
    },
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
    columns: {
      columns: [
        { id: "col-1", text: "Beneficio destacado 1" },
        { id: "col-2", text: "Beneficio destacado 2" },
      ],
    },
    footer: {
      text: "Recibes este correo por estar registrado en {companyName}. Date de baja en {unsubscribeUrl}",
      brandName: "Sin Corbatas",
    },
  },

  // Paleta base del tema (el editor la usa para colores por defecto)
  palette: {
    INK: "#221d15",
    DARK: "#0d0b08",
    GOLD: "#d7b227",
    CREAM_DIM: "#b8ae9d",
  },

  // Ajustes globales de la tarjeta del correo
  defaultSettings: {
    pageBackground: "#f5f1e8",
    cardBorderWidth: 1,
    cardBorderRadius: 4,
  },

  // Datos de ejemplo para previsualizar las etiquetas {etiqueta}
  sampleContext: {
    name: "Juan Pérez",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan@ejemplo.com",
    companyName: "Sin Corbatas",
    webinarName: "Aprende antes de invertir",
    webinarDate: "12 de octubre de 2026",
    webinarTime: "19:00",
    registerUrl: "https://sincorbatas.com/registro",
    unsubscribeUrl: "https://sincorbatas.com/baja",
    supportEmail: "soporte@sincorbatas.com",
  },

  // Etiquetas disponibles en el editor (subset de ejemplo; por defecto se
  // cargan todas las DEFAULT_VARIABLES). Descomenta para limitarlas:
  // variables: [
  //   { key: "firstName", label: "Nombre" },
  //   { key: "email", label: "Correo electrónico" },
  //   { key: "registerUrl", label: "URL de registro" },
  // ],

  // Textos de la UI del builder (i18n). Ejemplo:
  // labels: { blocksTitle: "Blocks", optionsTitle: "Options" },
}

export interface SavedTemplate {
  json: AutosavePayload
  html: string
  savedAt: string
}

/**
 * Autoguardado de demostración: simula el backend que recibirá el JSON.
 * Usa el renderer puro (@repo/create-email-renderer) para devolver
 * `{ json, html }` — el mismo contrato que tendrá tu endpoint real:
 *
 *   app.put("/templates/:id", async (c) => {
 *     const payload = await c.req.json()
 *     const { html } = await renderTemplateEmail({ subject, payload, context })
 *     await db.save(payload)
 *     return c.json({ json: payload, html })
 *   })
 */
export const onSaveDemo = async (
  payload: AutosavePayload,
): Promise<SavedTemplate> => {
  // Simula latencia de red
  await new Promise((resolve) => setTimeout(resolve, 400))

  if (payload.content.length === 0) {
    return { json: payload, html: "", savedAt: new Date().toISOString() }
  }

  const { html } = await renderTemplateEmail({
    subject: "Plantilla de ejemplo",
    payload,
    context: SAMPLE_EMAIL_BUILDER_CONFIG.sampleContext,
  })
  // En producción, aquí persistirías el JSON antes de responder.
  console.info("[autosave] payload guardado:", payload)
  return { json: payload, html, savedAt: new Date().toISOString() }
}
