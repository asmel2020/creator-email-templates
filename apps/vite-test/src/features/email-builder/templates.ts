import { blockJson, templateJson } from "create-email-template"
import type { EmailBlock } from "create-email-template"

/**
 * Correos ya armados para la demo: plantillas **completas** (varios bloques),
 * no patrones de un bloque. Los patrones por bloque viven en la librería
 * (p. ej. las variantes del bloque Footer vía `FOOTER_VARIANTS`), así que no
 * se duplican acá.
 *
 * Las plantillas se construyen con `blockJson` / `templateJson`
 * (create-email-renderer/build): el mismo constructor tipado que puede usar el
 * back-end para inyectar bloques desde sus propios datos. Lo que no se pasa
 * queda con el default del esquema y los ids se generan solos.
 */
export interface SampleTemplate {
  id: string
  name: string
  /** De dónde viene el patrón (referencia). */
  source: string
  blocks: EmailBlock[]
}

// Assets en data URI (SVG) para que la demo funcione sin internet.
const photo = (label: string, color: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="${color}"/><text x="240" y="196" font-family="Arial" font-size="32" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text></svg>`,
  )}`

const LOGO = photo("M", "#0d0b08")

/** Correo de ecommerce armado con el constructor de bloques. */
const ecommerce = templateJson([
  blockJson("header", {
    brandName: "Tu Marca",
    tagline: "Novedades de la semana",
    logoUrl: LOGO,
    backgroundColor: "#0d0b08",
  }),
  blockJson("product", {
    variant: "hero",
    imageUrl: photo("Colección", "#1f2937"),
    eyebrow: "Relojes clásicos",
    name: "Confort elegante",
    description:
      "Un diseño atemporal, pensado para durar y distinguirse del resto.",
    price: "$210.00",
    ctaLabel: "Comprar ahora",
    ctaHref: "https://ejemplo.com",
    imageHeight: 320,
    radius: 12,
    accentColor: "#4f46e5",
  }),
  blockJson("product", {
    variant: "grid",
    columns: 3,
    imageHeight: 180,
    radius: 8,
    accentColor: "#4f46e5",
    products: [
      {
        name: "Reloj analógico",
        imageUrl: photo("Analógico", "#1f2937"),
        description: "Pensado y simplemente diseñado.",
        price: "$40.00",
      },
      {
        name: "Reloj de pared",
        imageUrl: photo("Pared", "#4f46e5"),
        description: "La esfera original, fácil de leer.",
        price: "$45.00",
      },
      {
        name: "Reloj clásico",
        imageUrl: photo("Clásico", "#0f766e"),
        description: "Funcional, clásico y duradero.",
        price: "$210.00",
      },
    ],
  }),
  blockJson("checkout", {
    heading: "Tu carrito te espera",
    lines: [
      {
        name: "Reloj clásico",
        imageUrl: photo("Clásico", "#0f766e"),
        quantity: "1",
        price: "$210.00",
      },
      {
        name: "Reloj de pared",
        imageUrl: photo("Pared", "#4f46e5"),
        quantity: "2",
        price: "$90.00",
      },
    ],
    ctaLabel: "Finalizar compra",
    ctaHref: "https://ejemplo.com/checkout",
  }),
  blockJson("downloads", {
    heading: "Recursos de la semana",
    subheading: "Descarga el material y guárdalo para después.",
    buttonLabel: "Descargar",
  }),
  blockJson("footer", {
    variant: "one-column",
    columns: [
      {
        blocks: [
          blockJson("heading", { text: "Tu Marca", size: 16, align: "left" }),
          blockJson("text", {
            text: "Recibes este correo por estar registrado en nuestra plataforma.",
            size: 14,
            align: "left",
          }),
        ],
      },
    ],
    backgroundColor: "#f9fafb",
  }),
]).content

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: "ecommerce",
    name: "Ecommerce · novedades",
    source: "create-email-renderer/build (blockJson)",
    blocks: ecommerce,
  },
]
