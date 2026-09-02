import { type EmailContext } from "./types.js"

export interface EmailVariable {
  key: string
  label: string
}

export interface EmailVariableSection {
  id: string
  title: string
  description?: string
  variables: EmailVariable[]
}

export const DEFAULT_BASE_VARIABLES: EmailVariable[] = [
  { key: "name", label: "Nombre completo" },
  { key: "firstName", label: "Nombre" },
  { key: "lastName", label: "Apellido" },
  { key: "email", label: "Correo electrónico" },
  { key: "phone", label: "Teléfono" },
  { key: "role", label: "Rol" },
  { key: "companyName", label: "Empresa / Marca" },
  { key: "unsubscribeUrl", label: "URL de baja" },
  { key: "link", label: "Enlace CTA" },
  { key: "date", label: "Fecha" },
  { key: "year", label: "Año" },
  { key: "siteUrl", label: "URL del sitio" },
  { key: "supportEmail", label: "Correo de soporte" },
]

export const DEFAULT_CONTEXTUAL_VARIABLES: EmailVariable[] = [
  { key: "webinarName", label: "Nombre del webinar" },
  { key: "webinarDate", label: "Fecha del webinar" },
  { key: "webinarTime", label: "Hora del webinar" },
  { key: "webinarDuration", label: "Duración" },
  { key: "webinarUrl", label: "URL del webinar" },
  { key: "registerUrl", label: "URL de registro" },
  { key: "liveUrl", label: "URL en vivo" },
  { key: "slotsLeft", label: "Cupos restantes" },
  { key: "reminderDate", label: "Fecha de recordatorio" },
  { key: "webinarHost", label: "Anfitrión" },
  { key: "completeRegistrationUrl", label: "URL completar registro" },
  { key: "resetPasswordUrl", label: "URL restablecer contraseña" },
  { key: "confirmEmailUrl", label: "URL confirmar correo" },
]

export const DEFAULT_VARIABLES: EmailVariable[] = [
  ...DEFAULT_BASE_VARIABLES,
  ...DEFAULT_CONTEXTUAL_VARIABLES,
]

export const SAMPLE_CONTEXT: EmailContext = {
  name: "Juan Pérez",
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@ejemplo.com",
  phone: "+57 300 111 2233",
  role: "Instructor",
  companyName: "Mi Empresa",
  unsubscribeUrl: "https://www.ejemplo.com/baja",
  link: "https://www.ejemplo.com/",
  date: "5 de septiembre de 2026",
  year: "2026",
  siteUrl: "https://www.ejemplo.com",
  supportEmail: "soporte@ejemplo.com",
  webinarName: "Webinar de ejemplo",
  webinarDate: "5 de septiembre de 2026",
  webinarTime: "19:00",
  webinarDuration: "90 minutos",
  webinarUrl: "https://www.ejemplo.com/webinars/ejemplo",
  webinarSlug: "aprende-antes-de-invertir",
  registerUrl: "https://www.ejemplo.com/registro",
  liveUrl: "https://www.ejemplo.com",
  slotsLeft: "15",
  reminderDate: "3 de septiembre de 2026",
  webinarHost: "Equipo de Tu Empresa",
  completeRegistrationUrl: "https://www.ejemplo.com/completar-registro",
  resetPasswordUrl: "https://www.ejemplo.com/restablecer-contrasena",
  confirmEmailUrl: "https://www.ejemplo.com/confirmar-correo",
  courseName: "Curso de Finanzas Personales",
  productName: "Curso de Finanzas Personales",
  amountVes: "2500,00",
  paymentUrl: "https://www.ejemplo.com/billing/demo/123",
}

export const resolveVariables = (text: string, context: EmailContext): string =>
  text.replace(/\{(\w+)\}/g, (match, key) =>
    key in context ? context[key] : match
  )

export const extractVariables = (text: string): string[] =>
  Array.from(text.matchAll(/\{(\w+)\}/g), (m) => m[1])

export const validateVariables = (
  text: string,
  knownKeys: string[]
): string[] => {
  const used = extractVariables(text)
  return used.filter((key) => !knownKeys.includes(key))
}
