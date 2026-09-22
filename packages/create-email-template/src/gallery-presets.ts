// Recetas de los diseños del bloque `gallery` (patrones de react.email).
// El bloque nace en "grid" (la cuadrícula clásica, sin migración); al cambiar
// de diseño el panel reescribe las imágenes, el estilo y el gutter con ids
// frescos, igual que footer/pricing.
import { newId } from "./core/id"
import type { GalleryImage, GalleryVariant } from "./core/types"

export interface GalleryVariantDef {
  value: GalleryVariant
  label: string
  /** Patch de props para `set` al cambiar de diseño (ids frescos). */
  build: () => Record<string, unknown>
}

// Assets en data URI (SVG) para que las recetas funcionen sin internet.
const photo = (label: string, color: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="${color}"/><text x="240" y="196" font-family="Arial" font-size="34" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text></svg>`,
  )}`

const galleryImages = (items: [string, string][]): GalleryImage[] =>
  items.map(([label, color]) => ({
    id: newId(),
    src: photo(label, color),
    alt: label,
  }))

export const GALLERY_VARIANTS: GalleryVariantDef[] = [
  {
    value: "grid",
    label: "Galería 1 · cuadrícula",
    build: () => ({
      images: galleryImages([
        ["Café", "#1f2937"],
        ["Tostado", "#4f46e5"],
        ["Prensa", "#0f766e"],
        ["Vaso", "#b45309"],
      ]),
      columns: 2,
      radius: 12,
      imageHeight: 288,
      gap: 16,
    }),
  },
  {
    value: "three-columns",
    label: "Galería 2 · tres columnas",
    build: () => ({
      images: galleryImages([
        ["Hervidor", "#1f2937"],
        ["Molino", "#4f46e5"],
        ["Prensa", "#0f766e"],
      ]),
      radius: 12,
      imageHeight: 186,
      gap: 16,
    }),
  },
  {
    value: "horizontal",
    label: "Galería 3 · dos + una alta",
    build: () => ({
      images: galleryImages([
        ["Colección", "#1f2937"],
        ["Pack", "#0f766e"],
        ["Prensa Clara", "#b45309"],
      ]),
      radius: 12,
      imageHeight: 152,
      gap: 16,
    }),
  },
  {
    value: "vertical",
    label: "Galería 4 · ancha arriba",
    build: () => ({
      images: galleryImages([
        ["Colección de tazas", "#4f46e5"],
        ["Taza 1", "#be123c"],
        ["Taza 2", "#0f766e"],
      ]),
      radius: 12,
      imageHeight: 288,
      gap: 16,
    }),
  },
]
