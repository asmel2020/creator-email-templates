// Recetas de las variantes del bloque `footer`. El bloque nace con la
// variante "classic" (footer 1); al cambiar de variante el panel reescribe
// `columns` con la receta correspondiente (bloques anidados, editables).
import { newId } from "./core/id"
import type { EmailBlock } from "./core/types"

export type FooterVariant = "classic" | "one-column" | "two-columns"

export interface FooterVariantDef {
  value: FooterVariant
  label: string
  /** Patch de props para `set` al cambiar de variante (ids frescos). */
  build: () => Record<string, unknown>
}

// Assets en data URI (SVG) para que las recetas funcionen sin internet.
const LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='42'%3E%3Crect width='42' height='42' rx='10' fill='%230d0b08'/%3E%3Ctext x='21' y='28' font-family='Arial' font-size='18' font-weight='bold' fill='%23d7b227' text-anchor='middle'%3EM%3C/text%3E%3C/svg%3E"

const ICON_FACEBOOK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Ccircle cx='18' cy='18' r='18' fill='%231877f2'/%3E%3Ctext x='18' y='25' font-family='Arial' font-size='18' font-weight='bold' fill='white' text-anchor='middle'%3Ef%3C/text%3E%3C/svg%3E"

const ICON_X =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Ccircle cx='18' cy='18' r='18' fill='%23000000'/%3E%3Ctext x='18' y='25' font-family='Arial' font-size='17' font-weight='bold' fill='white' text-anchor='middle'%3EX%3C/text%3E%3C/svg%3E"

const ICON_INSTAGRAM =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Ccircle cx='18' cy='18' r='18' fill='%23e1306c'/%3E%3Ctext x='18' y='25' font-family='Arial' font-size='18' font-weight='bold' fill='white' text-anchor='middle'%3E%E2%97%8E%3C/text%3E%3C/svg%3E"

const logoBlock = (align: "left" | "center"): EmailBlock => ({
  id: newId(),
  type: "image",
  props: {
    src: LOGO,
    alt: "Logo",
    width: 42,
    align,
    paddingY: 0,
    paddingX: 0,
  } as EmailBlock["props"],
})

const brandBlock = (align: "left" | "center"): EmailBlock => ({
  id: newId(),
  type: "heading",
  props: {
    text: "Tu Marca",
    size: 16,
    color: "#111827",
    align,
    paddingY: 8,
    paddingX: 0,
  } as EmailBlock["props"],
})

const taglineBlock = (align: "left" | "center"): EmailBlock => ({
  id: newId(),
  type: "text",
  props: {
    text: "Una breve descripción de tu marca",
    size: 16,
    color: "#6b7280",
    align,
    paddingY: 0,
    paddingX: 0,
  } as EmailBlock["props"],
})

const socialBlock = (align: "left" | "center"): EmailBlock => ({
  id: newId(),
  type: "social",
  props: {
    mode: "logo",
    iconSize: 36,
    gap: 8,
    align,
    paddingY: 0,
    paddingX: 0,
    links: [
      {
        id: newId(),
        label: "Facebook",
        href: "https://facebook.com",
        icon: ICON_FACEBOOK,
      },
      { id: newId(), label: "X", href: "https://x.com", icon: ICON_X },
      {
        id: newId(),
        label: "Instagram",
        href: "https://instagram.com",
        icon: ICON_INSTAGRAM,
      },
    ],
  } as EmailBlock["props"],
})

const addressBlock = (align: "left" | "center"): EmailBlock => ({
  id: newId(),
  type: "text",
  props: {
    text: "<strong>Calle 123, Ciudad, País</strong>",
    size: 16,
    color: "#6b7280",
    align,
    paddingY: 8,
    paddingX: 0,
  } as EmailBlock["props"],
})

const contactBlock = (align: "left" | "center"): EmailBlock => ({
  id: newId(),
  type: "text",
  props: {
    text: "<strong>correo@ejemplo.com +00 000 000 000</strong>",
    size: 16,
    color: "#6b7280",
    align,
    paddingY: 0,
    paddingX: 0,
  } as EmailBlock["props"],
})

/** Footer 2: logo + marca/claim + redes + dirección y contacto, centrado. */
const oneColumnColumns = () => [
  {
    id: newId(),
    width: 100,
    blocks: [
      logoBlock("center"),
      brandBlock("center"),
      taglineBlock("center"),
      socialBlock("center"),
      addressBlock("center"),
      contactBlock("center"),
    ],
  },
]

/** Footer 3: marca a la izquierda, redes + contacto a la derecha. */
const twoColumnsColumns = () => [
  {
    id: newId(),
    width: 50,
    blocks: [logoBlock("left"), brandBlock("left"), taglineBlock("left")],
  },
  {
    id: newId(),
    width: 50,
    blocks: [
      socialBlock("left"),
      addressBlock("left"),
      contactBlock("left"),
    ],
  },
]

export const FOOTER_VARIANTS: FooterVariantDef[] = [
  {
    value: "classic",
    label: "Footer 1 · clásico",
    build: () => ({
      columns: [],
      backgroundColor: "#0d0b08",
      paddingY: 24,
      paddingX: 32,
    }),
  },
  {
    value: "one-column",
    label: "Footer 2 · una columna",
    build: () => ({
      columns: oneColumnColumns(),
      backgroundColor: "#f9fafb",
      paddingY: 32,
      paddingX: 24,
      gap: 12,
    }),
  },
  {
    value: "two-columns",
    label: "Footer 3 · dos columnas",
    build: () => ({
      columns: twoColumnsColumns(),
      backgroundColor: "#f9fafb",
      paddingY: 32,
      paddingX: 24,
      gap: 12,
    }),
  },
]
