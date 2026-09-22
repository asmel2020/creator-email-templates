// Recetas de los diseños del bloque `product` (patrones de
// react.email/components/ecommerce). El bloque nace en "card" (la tarjeta de
// siempre, sin migración); al cambiar de diseño el panel reescribe las props
// de ese diseño con ids frescos.
import { newId } from "./core/id"
import type { ProductItem, ProductVariant } from "./core/types"

export interface ProductVariantDef {
  value: ProductVariant
  label: string
  /** Patch de props para `set` al cambiar de diseño (ids frescos). */
  build: () => Record<string, unknown>
}

// Assets en data URI (SVG) para que las recetas funcionen sin internet.
const photo = (label: string, color: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="${color}"/><text x="240" y="196" font-family="Arial" font-size="32" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text></svg>`,
  )}`

const card = (
  data: Partial<ProductItem> & { name: string; imageUrl: string },
): ProductItem => ({
  id: newId(),
  description: "",
  price: "",
  ctaLabel: "Comprar",
  ctaHref: "",
  ...data,
})

export const PRODUCT_VARIANTS: ProductVariantDef[] = [
  {
    value: "card",
    label: "Producto 1 · tarjeta",
    // No reescribe nada: la tarjeta usa imageUrl/name/description/price/cta.
    build: () => ({}),
  },
  {
    value: "hero",
    label: "Producto 2 · destacado",
    build: () => ({
      eyebrow: "Relojes clásicos",
      imageUrl: photo("Colección", "#1f2937"),
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
  },
  {
    value: "image-left",
    label: "Producto 3 · imagen izquierda",
    build: () => ({
      imageUrl: photo("Reloj vintage", "#0f766e"),
      name: "Gran pieza",
      description:
        "Reconocido por su diseño minimalista y su alta funcionalidad, fiel a los principios de simplicidad y claridad.",
      price: "$120.00",
      ctaLabel: "Comprar",
      ctaHref: "https://ejemplo.com",
      imageHeight: 220,
      radius: 8,
      accentColor: "#4f46e5",
    }),
  },
  {
    value: "grid",
    label: "Producto 4 · tarjetas",
    build: () => ({
      heading: "",
      subheading: "",
      columns: 3,
      imageHeight: 180,
      radius: 8,
      accentColor: "#4f46e5",
      products: [
        card({
          name: "Reloj analógico",
          imageUrl: photo("Analógico", "#1f2937"),
          description: "Pensado y simplemente diseñado.",
          price: "$40.00",
        }),
        card({
          name: "Reloj de pared",
          imageUrl: photo("Pared", "#4f46e5"),
          description: "La esfera original, fácil de leer.",
          price: "$45.00",
        }),
        card({
          name: "Reloj clásico",
          imageUrl: photo("Clásico", "#0f766e"),
          description: "Funcional, clásico y duradero.",
          price: "$210.00",
        }),
      ],
    }),
  },
]
