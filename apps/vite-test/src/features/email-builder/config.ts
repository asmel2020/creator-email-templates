import type {
  AutosavePayload,
  EmailBuilderConfig,
  UploadFile,
  UploadImage,
} from "create-email-template"
import { renderTemplateEmail } from "create-email-renderer"

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

/**
 * Subida de documentos de demostración. En producción devuelve la URL pública
 * (R2/S3/tu API): el destinatario la descarga y tu backend adjunta el archivo.
 *
 * Acá: los archivos chicos van como `data:` URL para que la demo funcione de
 * punta a punta (el bloque `downloads` descarta los `blob:`, que no sirven
 * fuera del navegador); los grandes quedan como blob local (solo preview).
 */
export const uploadFileDemo: UploadFile = async (file) => {
  await new Promise((resolve) => setTimeout(resolve, 600))
  if (file.size <= 500 * 1024) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"))
      reader.readAsDataURL(file)
    })
  }
  return URL.createObjectURL(file)
}

// PDF mínimo en data URI (390 bytes) para que la demo funcione sin internet.
const GUIA_PDF =
  "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgMjQwIDkwXS9Db250ZW50cyA0IDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNSAwIFI+Pj4+Pj5lbmRvYmoKNCAwIG9iajw8L0xlbmd0aCA0Nj4+c3RyZWFtCkJUIC9GMSAxNCBUZiAyMCA0MCBUZCAoR3VpYSBkZSBlamVtcGxvKSBUaiBFVAplbmRzdHJlYW0gZW5kb2JqCjUgMCBvYmo8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PmVuZG9iagp0cmFpbGVyPDwvUm9vdCAxIDAgUj4+CiUlRU9G"

// Logo de marca por defecto para el bloque Header (data URI SVG para que
// funcione sin internet). En producción: "https://mi-cdn.com/logo.png".
const LOGO_MARCA =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='40'%3E%3Crect width='140' height='40' rx='6' fill='%230d0b08'/%3E%3Ctext x='70' y='26' font-family='Arial' font-size='13' font-weight='bold' fill='%23d7b227' text-anchor='middle'%3EMI MARCA%3C/text%3E%3C/svg%3E"

/**
 * Configuración de muestra del builder: muestra los parámetros disponibles de
 * <EmailBuilderProvider config={{...}}>. Todos son opcionales; quita o cambia
 * lo que necesites.
 */
export const SAMPLE_EMAIL_BUILDER_CONFIG: EmailBuilderConfig = {
  // Valores iniciales por tipo de bloque (se aplican al arrastrar el bloque)
  blockDefaults: {
    header: {
      brandName: "Mi Marca",
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
        {
          id: "col-1",
          blocks: [
            {
              id: "col-1-b1",
              type: "text",
              props: { text: "Beneficio destacado 1", paddingY: 0, paddingX: 0 },
            },
          ],
        },
        {
          id: "col-2",
          blocks: [
            {
              id: "col-2-b1",
              type: "text",
              props: { text: "Beneficio destacado 2", paddingY: 0, paddingX: 0 },
            },
          ],
        },
      ],
    },
    footer: {
      text: "Recibes este correo por estar registrado en {companyName}. Date de baja en {unsubscribeUrl}",
      brandName: "Mi Marca",
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
    // Sin borde: el contenido arma sus propias cards (planes, footer…).
    // Ajustable desde "Ajustes" en el canvas.
    cardBorderWidth: 0,
    cardBorderRadius: 4,
    // Archivos que lista el bloque "Archivos / Descargas" y que el backend
    // puede adjuntar al enviar (`attach: true`). Se gestionan en Ajustes.
    files: [
      {
        id: "file-guia",
        url: GUIA_PDF,
        name: "Guía de ejemplo.pdf",
        size: 390,
        mimeType: "application/pdf",
        link: true,
        attach: false,
      },
    ],
  },

  // Límites de la subida de archivos (opcional; estos son los defaults)
  // files: { maxSizeMb: 5, maxCount: 5, warnTotalMb: 3 },

  // Datos de ejemplo para previsualizar las etiquetas {etiqueta}
  sampleContext: {
    name: "Juan Pérez",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan@ejemplo.com",
    companyName: "Mi Empresa",
    webinarName: "Aprende antes de invertir",
    webinarDate: "12 de octubre de 2026",
    webinarTime: "19:00",
    registerUrl: "https://mi-sitio.com/registro",
    unsubscribeUrl: "https://mi-sitio.com/baja",
    supportEmail: "soporte@mi-sitio.com",
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
 * Usa el renderer puro (create-email-renderer) para devolver
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
