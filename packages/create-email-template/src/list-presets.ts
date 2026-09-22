// Recetas de los estilos del bloque `list` (patrones de react.email/components/list).
// El bloque nace en "bullets" (la lista de viñetas de siempre, sin migración); al
// cambiar de estilo el panel reescribe las entradas y el estilo con ids frescos.
import { newId } from "./core/id"
import type { ListEntry, ListVariant } from "./core/types"

export interface ListVariantDef {
  value: ListVariant
  label: string
  /** Patch de props para `set` al cambiar de estilo (ids frescos). */
  build: () => Record<string, unknown>
}

// Assets en data URI (SVG) para que las recetas funcionen sin internet.
const photo = (label: string, color: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="${color}"/><text x="240" y="196" font-family="Arial" font-size="32" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text></svg>`,
  )}`

const entry = (data: Partial<ListEntry> & { title: string }): ListEntry => ({
  id: newId(),
  description: "",
  ...data,
})

export const LIST_VARIANTS: ListVariantDef[] = [
  {
    value: "bullets",
    label: "Lista 1 · viñetas",
    // No reescribe nada: las viñetas usan items/icon.
    build: () => ({}),
  },
  {
    value: "numbered",
    label: "Lista 2 · numerada",
    build: () => ({
      accentColor: "#4f46e5",
      gap: 24,
      entries: [
        entry({
          title: "Soluciones innovadoras",
          description:
            "Impulsamos el crecimiento con soluciones que marcan la diferencia.",
        }),
        entry({
          title: "Rendimiento excepcional",
          description:
            "Entregamos un servicio eficiente y de alta calidad en cada envío.",
        }),
        entry({
          title: "Soporte fiable",
          description:
            "Te acompañamos para que tu operación nunca se detenga.",
        }),
        entry({
          title: "Seguridad avanzada",
          description:
            "Protegemos tus datos con medidas de última generación.",
        }),
      ],
    }),
  },
  {
    value: "with-image",
    label: "Lista 3 · con imagen",
    build: () => ({
      accentColor: "#4f46e5",
      radius: 4,
      imageHeight: 168,
      gap: 30,
      entries: [
        entry({
          title: "Empieza tu búsqueda",
          description:
            "Busca los productos que necesitas o sube tu lista de requisitos.",
          image: photo("Buscar", "#1f2937"),
          href: "https://ejemplo.com",
          linkLabel: "Aprender más →",
        }),
        entry({
          title: "Compara y ahorra",
          description:
            "Compara precios y ofertas de distintos proveedores para encontrar el mejor trato.",
          image: photo("Comparar", "#0f766e"),
          href: "https://ejemplo.com",
          linkLabel: "Aprender más →",
        }),
        entry({
          title: "Disfruta los beneficios",
          description:
            "Recibe tus productos y aprovecha el ahorro y la comodidad del servicio.",
          image: photo("Disfrutar", "#b45309"),
          href: "https://ejemplo.com",
          linkLabel: "Aprender más →",
        }),
      ],
    }),
  },
]
