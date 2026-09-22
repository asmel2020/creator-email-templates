"use client"

// Schema de campos del panel por tipo de bloque (schema-driven).
// Las vistas de Preview/Editable se registran desde register-builtin-views.
import { LIST_ICONS } from "./core/types"
import type { BlockFieldDef, BlockViewRegistration } from "./block-views"
import { FOOTER_VARIANTS } from "./footer-presets"
import { GALLERY_VARIANTS } from "./gallery-presets"
import { LIST_VARIANTS } from "./list-presets"
import { PRODUCT_VARIANTS } from "./product-presets"
import { PRICING_VARIANTS } from "./pricing-presets"
import {
  EditableAvatar,
  EditableButton,
  EditableCheckout,
  EditableCode,
  EditableDivider,
  EditableDownloads,
  EditableFeatures,
  EditableGallery,
  EditableHeader,
  EditableHeading,
  EditableHero,
  EditableImage,
  EditableLink,
  EditableList,
  EditablePricing,
  EditableProduct,
  EditableQuote,
  EditableSocial,
  EditableSpacer,
  EditableStats,
  EditableTestimonial,
  EditableText,
} from "./components/builder/editable-block-renderer"
import {
  EditableColumns,
  EditableContainer,
  EditableFooter,
  EditableGrid,
} from "./components/builder/nested-blocks"

const headerFields: BlockFieldDef[] = [
  { kind: "text", key: "logoUrl", label: "Logo (URL)" },
  { kind: "align", key: "align", label: "Alineación" },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#0d0b08" },
]

const heroFields: BlockFieldDef[] = [
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
  { kind: "align", key: "align", label: "Alineación" },
]

const headingFields: BlockFieldDef[] = [
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
  { kind: "align", key: "align", label: "Alineación" },
]

const textFields: BlockFieldDef[] = [
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
  { kind: "align", key: "align", label: "Alineación" },
]

const listFields: BlockFieldDef[] = [
  {
    kind: "preset",
    key: "variant",
    label: "Diseño",
    options: LIST_VARIANTS.map((v) => ({
      value: v.value,
      label: v.label,
      build: v.build,
    })),
  },
  {
    kind: "group",
    label: "Viñetas",
    visibleWhen: { key: "variant", equals: "bullets" },
    fields: [
      { kind: "icons", key: "icon", label: "Ícono", options: LIST_ICONS },
    ],
  },
  {
    kind: "group",
    label: "Entradas",
    visibleWhen: { key: "variant", equals: ["numbered", "with-image"] },
    fields: [
      {
        kind: "repeat",
        key: "entries",
        label: "Pasos",
        itemLabel: "Paso",
        hideIndex: true,
        fields: [
          { kind: "text", key: "title", label: "Título" },
          {
            kind: "richText",
            key: "description",
            label: "Descripción",
            placeholder: "Describe el paso o beneficio",
          },
          { kind: "text", key: "number", label: "Número (vacío = posición)" },
          { kind: "image", key: "image" },
          { kind: "text", key: "href", label: "Enlace (opcional)" },
          { kind: "text", key: "linkLabel", label: "Texto del enlace" },
        ],
      },
    ],
  },
  {
    kind: "group",
    label: "Estilo",
    visibleWhen: { key: "variant", equals: ["numbered", "with-image"] },
    fields: [
      { kind: "color", key: "accentColor", label: "Color del badge", fallback: "#d7b227" },
    ],
  },
  {
    kind: "group",
    label: "Imagen",
    visibleWhen: { key: "variant", equals: "with-image" },
    fields: [
      { kind: "number", key: "radius", label: "Borde redondeado (px)", default: 4 },
      { kind: "number", key: "imageHeight", label: "Alto de imagen (px)", default: 168 },
    ],
  },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
  { kind: "hint", labelKey: "listEditHint" },
]

const buttonFields: BlockFieldDef[] = [
  { kind: "text", key: "label", label: "Texto del botón" },
  { kind: "text", key: "href", label: "Enlace (acepta variable)" },
  {
    kind: "color",
    key: "blockBackgroundColor",
    label: "Color de fondo",
    fallback: "#ffffff",
  },
  { kind: "color", key: "backgroundColor", label: "Color del botón", fallback: "#d7b227" },
  { kind: "color", key: "color", label: "Color de texto", fallback: "#0d0b08" },
  { kind: "align", key: "align", label: "Alineación" },
]

const imageFields: BlockFieldDef[] = [
  { kind: "image", key: "src" },
  { kind: "text", key: "alt", label: "Texto alternativo" },
  { kind: "text", key: "href", label: "Enlace (opcional)" },
  { kind: "number", key: "width", label: "Ancho (px)", default: 480 },
  { kind: "align", key: "align", label: "Alineación" },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

const quoteFields: BlockFieldDef[] = [
  { kind: "richText", key: "author", label: "Autor (con formato)" },
  { kind: "color", key: "borderColor", label: "Color de la barra", fallback: "#d7b227" },
  {
    kind: "row",
    fields: [
      { kind: "number", key: "marginLeft", label: "Margen izq. (px)", default: 0 },
      { kind: "number", key: "paddingY", label: "Padding vertical (px)", default: 16 },
    ],
  },
  {
    kind: "row",
    fields: [
      { kind: "number", key: "paddingX", label: "Padding horizontal (px)", default: 32 },
      { kind: "number", key: "borderWidth", label: "Grosor barra (px)", min: 1, default: 3 },
    ],
  },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

const columnsFields: BlockFieldDef[] = [
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
  { kind: "hint", labelKey: "columnsEditHint" },
]

const containerFields: BlockFieldDef[] = [
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
  { kind: "align", key: "align", label: "Alineación" },
  { kind: "hint", labelKey: "containerEditHint" },
]

const dividerFields: BlockFieldDef[] = [
  { kind: "color", key: "color", label: "Color", fallback: "#e3dccb" },
  { kind: "number", key: "height", label: "Altura (px)", default: 8, min: 0 },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

const spacerFields: BlockFieldDef[] = [
  { kind: "number", key: "height", label: "Altura (px)", default: 24 },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

const footerFields: BlockFieldDef[] = [
  {
    kind: "preset",
    key: "variant",
    label: "Estilo",
    options: FOOTER_VARIANTS.map((v) => ({
      value: v.value,
      label: v.label,
      build: v.build,
    })),
  },
  {
    kind: "number",
    key: "gap",
    label: "Separación entre columnas (px)",
    min: 0,
    default: 12,
  },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#0d0b08" },
  { kind: "hint", labelKey: "footerEditHint" },
]

const GRID_LAYOUTS: {
  value: string
  label: string
  widths: number[]
}[] = [
  { value: "1-2", label: "2 iguales (50% / 50%)", widths: [50, 50] },
  {
    value: "1-3-2-3",
    label: "2 (1/3 + 2/3)",
    widths: [33.33, 66.67],
  },
  {
    value: "2-3-1-3",
    label: "2 (2/3 + 1/3)",
    widths: [66.67, 33.33],
  },
  {
    value: "1-3x3",
    label: "3 iguales (1/3 c/u)",
    widths: [33.33, 33.33, 33.33],
  },
  {
    value: "1-4x4",
    label: "4 iguales (1/4 c/u)",
    widths: [25, 25, 25, 25],
  },
]

const gridFields: BlockFieldDef[] = [
  { kind: "layout", key: "layout", label: "Distribución", options: GRID_LAYOUTS },
  {
    kind: "number",
    key: "gap",
    label: "Separación entre celdas (px)",
    min: 0,
    default: 12,
  },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
  { kind: "hint", labelKey: "gridEditHint" },
]

const socialFields: BlockFieldDef[] = [
  {
    kind: "select",
    key: "mode",
    label: "Estilo",
    options: [
      { value: "text", label: "Texto" },
      { value: "logo", label: "Logo / ícono" },
    ],
  },
  {
    kind: "repeat",
    key: "links",
    label: "Enlaces",
    itemLabel: "Enlace",
    fields: [
      { kind: "text", key: "label", label: "Texto" },
      { kind: "text", key: "href", label: "URL" },
      { kind: "text", key: "icon", label: "Logo (emoji o URL)" },
    ],
  },
  { kind: "align", key: "align", label: "Alineación" },
  {
    kind: "row",
    fields: [
      { kind: "number", key: "iconSize", label: "Tamaño del logo (px)", default: 32 },
      { kind: "number", key: "gap", label: "Separación (px)", default: 6 },
    ],
  },
  { kind: "color", key: "color", label: "Color de texto", fallback: "#221d15" },
  { kind: "color", key: "accentColor", label: "Color del logo", fallback: "#d7b227" },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

const galleryFields: BlockFieldDef[] = [
  {
    kind: "preset",
    key: "variant",
    label: "Diseño",
    options: GALLERY_VARIANTS.map((v) => ({
      value: v.value,
      label: v.label,
      build: v.build,
    })),
  },
  {
    kind: "repeat",
    key: "images",
    label: "Imágenes",
    itemLabel: "Imagen",
    fields: [
      { kind: "image", key: "src" },
      { kind: "text", key: "alt", label: "Texto alternativo" },
      { kind: "text", key: "href", label: "Enlace (opcional)" },
    ],
  },
  {
    kind: "group",
    label: "Cuadrícula",
    visibleWhen: { key: "variant", equals: "grid" },
    fields: [
      { kind: "number", key: "columns", label: "Imágenes por fila", min: 2, default: 2 },
    ],
  },
  {
    kind: "group",
    label: "Estilo de imagen",
    fields: [
      { kind: "number", key: "radius", label: "Borde redondeado (px)", default: 6 },
      {
        kind: "number",
        key: "imageHeight",
        label: "Alto de imagen (px, 0 = auto)",
        default: 0,
      },
    ],
  },
  { kind: "align", key: "align", label: "Alineación" },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

const statsFields: BlockFieldDef[] = [
  {
    kind: "repeat",
    key: "stats",
    label: "Cifras",
    itemLabel: "Dato",
    fields: [
      { kind: "text", key: "value", label: "Valor" },
      { kind: "text", key: "label", label: "Etiqueta" },
    ],
  },
  { kind: "align", key: "align", label: "Alineación" },
  { kind: "color", key: "accentColor", label: "Color de acento", fallback: "#d7b227" },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

const pricingFields: BlockFieldDef[] = [
  {
    kind: "preset",
    key: "variant",
    label: "Estilo",
    options: PRICING_VARIANTS.map((v) => ({
      value: v.value,
      label: v.label,
      build: v.build,
    })),
  },
  {
    kind: "group",
    label: "Tarjeta (Precio 1)",
    visibleWhen: { key: "variant", equals: ["card", ""] },
    fields: [{ kind: "text", key: "title", label: "Nombre del plan" }],
  },
  {
    kind: "group",
    label: "Oferta (Precio 2)",
    visibleWhen: { key: "variant", equals: "offer" },
    fields: [
      { kind: "text", key: "eyebrow", label: "Texto superior" },
      { kind: "richText", key: "description", label: "Descripción" },
      { kind: "text", key: "note", label: "Nota 1 (cursiva)" },
      { kind: "text", key: "note2", label: "Nota 2" },
    ],
  },
  {
    kind: "group",
    // Compartido por Precio 1 y Precio 2 (mismas props).
    label: "Precio, beneficios y botón",
    visibleWhen: { key: "variant", equals: ["card", "", "offer"] },
    fields: [
      {
        kind: "row",
        fields: [
          { kind: "text", key: "price", label: "Precio" },
          { kind: "text", key: "period", label: "Periodo (ej. /mes)" },
        ],
      },
      {
        kind: "stringList",
        key: "bullets",
        label: "Beneficios",
        placeholder: "Escribe un beneficio...",
      },
      { kind: "text", key: "ctaLabel", label: "Texto del botón" },
      { kind: "text", key: "ctaHref", label: "Enlace del botón" },
    ],
  },
  {
    kind: "group",
    label: "Dos planes (Precio 3)",
    visibleWhen: { key: "variant", equals: "two-tiers" },
    fields: [
      { kind: "text", key: "heading", label: "Título de sección" },
      { kind: "text", key: "subtitle", label: "Subtítulo" },
      {
        kind: "repeat",
        key: "plans",
        label: "Planes",
        itemLabel: "Plan",
        hideIndex: true,
        fields: [
          { kind: "text", key: "title", label: "Nombre" },
          {
            kind: "row",
            fields: [
              { kind: "text", key: "price", label: "Precio" },
              { kind: "text", key: "period", label: "Periodo" },
            ],
          },
          { kind: "text", key: "description", label: "Descripción" },
          {
            kind: "stringList",
            key: "features",
            label: "Beneficios",
            placeholder: "Escribe un beneficio...",
          },
          {
            kind: "row",
            fields: [
              { kind: "text", key: "ctaLabel", label: "Texto del botón" },
              { kind: "text", key: "ctaHref", label: "Enlace" },
            ],
          },
          {
            kind: "select",
            key: "highlighted",
            label: "Destacado",
            options: [
              { value: false, label: "Normal" },
              { value: true, label: "Destacado" },
            ],
          },
        ],
      },
      { kind: "text", key: "footnote", label: "Nota al pie" },
    ],
  },
  { kind: "color", key: "accentColor", label: "Color de acento", fallback: "#d7b227" },
  { kind: "color", key: "textColor", label: "Color de texto", fallback: "#221d15" },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
  { kind: "hint", labelKey: "pricingEditHint" },
]

const productFields: BlockFieldDef[] = [
  {
    kind: "preset",
    key: "variant",
    label: "Diseño",
    options: PRODUCT_VARIANTS.map((v) => ({
      value: v.value,
      label: v.label,
      build: v.build,
    })),
  },
  {
    kind: "group",
    label: "Producto",
    visibleWhen: { key: "variant", equals: ["card", "hero", "image-left"] },
    fields: [
      { kind: "image", key: "imageUrl" },
      { kind: "text", key: "name", label: "Nombre" },
      { kind: "richText", key: "description", label: "Descripción" },
      { kind: "text", key: "price", label: "Precio" },
      { kind: "text", key: "eyebrow", label: "Línea superior (destacado)" },
      { kind: "text", key: "ctaLabel", label: "Texto del botón" },
      { kind: "text", key: "ctaHref", label: "Enlace del botón" },
    ],
  },
  {
    kind: "group",
    label: "Encabezado",
    visibleWhen: { key: "variant", equals: "grid" },
    fields: [
      { kind: "text", key: "heading", label: "Título de sección" },
      { kind: "text", key: "subheading", label: "Bajada" },
    ],
  },
  {
    kind: "group",
    label: "Tarjetas",
    visibleWhen: { key: "variant", equals: "grid" },
    fields: [
      {
        kind: "repeat",
        key: "products",
        label: "Productos",
        itemLabel: "Producto",
        hideIndex: true,
        fields: [
          { kind: "image", key: "imageUrl" },
          { kind: "text", key: "name", label: "Nombre" },
          { kind: "richText", key: "description", label: "Descripción" },
          { kind: "text", key: "price", label: "Precio" },
          { kind: "text", key: "ctaLabel", label: "Texto del botón" },
          { kind: "text", key: "ctaHref", label: "Enlace del botón" },
        ],
      },
    ],
  },
  {
    kind: "group",
    label: "Cuadrícula",
    visibleWhen: { key: "variant", equals: "grid" },
    fields: [
      {
        kind: "select",
        key: "columns",
        label: "Tarjetas por fila",
        options: [
          { value: 2, label: "2 tarjetas" },
          { value: 3, label: "3 tarjetas" },
          { value: 4, label: "4 tarjetas (2×2)" },
        ],
      },
    ],
  },
  {
    kind: "group",
    label: "Estilo",
    fields: [
      { kind: "color", key: "accentColor", label: "Color de acento", fallback: "#d7b227" },
      { kind: "number", key: "radius", label: "Borde redondeado (px)", default: 8 },
      {
        kind: "number",
        key: "imageHeight",
        label: "Alto de imagen (px, 0 = auto)",
        default: 0,
      },
    ],
  },
  { kind: "align", key: "align", label: "Alineación" },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

const checkoutFields: BlockFieldDef[] = [
  { kind: "text", key: "heading", label: "Título" },
  {
    kind: "repeat",
    key: "lines",
    label: "Líneas del pedido",
    itemLabel: "Línea",
    hideIndex: true,
    fields: [
      { kind: "image", key: "imageUrl" },
      { kind: "text", key: "name", label: "Producto" },
      { kind: "text", key: "quantity", label: "Cantidad" },
      { kind: "text", key: "price", label: "Precio" },
    ],
  },
  { kind: "text", key: "ctaLabel", label: "Texto del botón" },
  { kind: "text", key: "ctaHref", label: "Enlace del botón" },
  {
    kind: "group",
    label: "Estilo",
    fields: [
      { kind: "color", key: "accentColor", label: "Color del botón", fallback: "#4f46e5" },
      { kind: "color", key: "borderColor", label: "Color del borde", fallback: "#e5e7eb" },
      { kind: "number", key: "radius", label: "Borde de la imagen (px)", default: 8 },
      { kind: "number", key: "imageHeight", label: "Alto de la imagen (px)", default: 110 },
    ],
  },
  { kind: "align", key: "align", label: "Alineación" },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

const testimonialFields: BlockFieldDef[] = [
  { kind: "image", key: "avatarUrl" },
  { kind: "richText", key: "quote", label: "Cita" },
  { kind: "text", key: "name", label: "Nombre" },
  { kind: "text", key: "role", label: "Cargo" },
  { kind: "align", key: "align", label: "Alineación" },
  { kind: "color", key: "accentColor", label: "Color de acento", fallback: "#d7b227" },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

const featuresFields: BlockFieldDef[] = [
  {
    kind: "repeat",
    key: "features",
    label: "Características",
    itemLabel: "Característica",
    fields: [
      { kind: "text", key: "icon", label: "Ícono (emoji/texto)" },
      { kind: "text", key: "title", label: "Título" },
      { kind: "text", key: "description", label: "Descripción" },
    ],
  },
  { kind: "number", key: "columns", label: "Columnas", min: 2, default: 2 },
  { kind: "align", key: "align", label: "Alineación" },
  { kind: "color", key: "accentColor", label: "Color de acento", fallback: "#d7b227" },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

const avatarFields: BlockFieldDef[] = [
  { kind: "image", key: "imageUrl" },
  { kind: "text", key: "name", label: "Nombre" },
  { kind: "text", key: "role", label: "Cargo" },
  { kind: "number", key: "size", label: "Tamaño (px)", default: 96 },
  { kind: "align", key: "align", label: "Alineación" },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

const codeFields: BlockFieldDef[] = [
  { kind: "text", key: "code", label: "Código" },
  { kind: "text", key: "language", label: "Lenguaje (opcional)" },
  { kind: "color", key: "backgroundColor", label: "Fondo", fallback: "#0d0b08" },
  { kind: "color", key: "color", label: "Texto", fallback: "#f5f1e8" },
]

const linkFields: BlockFieldDef[] = [
  { kind: "text", key: "label", label: "Texto" },
  { kind: "text", key: "href", label: "Enlace" },
  { kind: "align", key: "align", label: "Alineación" },
  { kind: "color", key: "color", label: "Color", fallback: "#a98a1e" },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

// Los archivos no se editan aquí: se suben en Ajustes y el bloque los lista.
const downloadsFields: BlockFieldDef[] = [
  { kind: "hint", labelKey: "downloadsHint" },
  { kind: "text", key: "heading", label: "Título" },
  { kind: "text", key: "subheading", label: "Subtítulo" },
  { kind: "text", key: "buttonLabel", label: "Texto del enlace" },
  {
    kind: "group",
    label: "Estilo",
    fields: [
      { kind: "color", key: "accentColor", label: "Color del enlace", fallback: "#d7b227" },
      { kind: "color", key: "borderColor", label: "Color del borde", fallback: "#e3dccb" },
      { kind: "number", key: "radius", label: "Borde de la caja (px)", default: 8 },
    ],
  },
  {
    kind: "group",
    label: "Lista",
    fields: [
      {
        kind: "select",
        key: "showIcon",
        label: "Mostrar tipo de archivo",
        options: [
          { value: true, label: "Sí" },
          { value: false, label: "No" },
        ],
      },
      {
        kind: "select",
        key: "showSize",
        label: "Mostrar tamaño",
        options: [
          { value: true, label: "Sí" },
          { value: false, label: "No" },
        ],
      },
      { kind: "text", key: "emptyText", label: "Mensaje sin archivos" },
    ],
  },
  { kind: "align", key: "align", label: "Alineación" },
  { kind: "color", key: "backgroundColor", label: "Color de fondo", fallback: "#ffffff" },
]

/** Editables built-in por tipo — registrados junto a los Preview. */
export const BUILTIN_EDITABLES: Record<
  string,
  BlockViewRegistration["Editable"]
> = {
  header: EditableHeader,
  hero: EditableHero,
  heading: EditableHeading,
  text: EditableText,
  list: EditableList,
  button: EditableButton,
  image: EditableImage,
  quote: EditableQuote,
  columns: EditableColumns,
  container: EditableContainer,
  grid: EditableGrid,
  divider: EditableDivider,
  spacer: EditableSpacer,
  footer: EditableFooter,
  social: EditableSocial,
  gallery: EditableGallery,
  stats: EditableStats,
  pricing: EditablePricing,
  product: EditableProduct,
  checkout: EditableCheckout,
  testimonial: EditableTestimonial,
  features: EditableFeatures,
  avatar: EditableAvatar,
  code: EditableCode,
  link: EditableLink,
  downloads: EditableDownloads,
}

export const BUILTIN_FIELDS: Record<string, BlockFieldDef[]> = {
  header: headerFields,
  hero: heroFields,
  heading: headingFields,
  text: textFields,
  list: listFields,
  button: buttonFields,
  image: imageFields,
  quote: quoteFields,
  columns: columnsFields,
  container: containerFields,
  grid: gridFields,
  divider: dividerFields,
  spacer: spacerFields,
  footer: footerFields,
  social: socialFields,
  gallery: galleryFields,
  stats: statsFields,
  pricing: pricingFields,
  product: productFields,
  checkout: checkoutFields,
  testimonial: testimonialFields,
  features: featuresFields,
  avatar: avatarFields,
  code: codeFields,
  link: linkFields,
  downloads: downloadsFields,
}

export const RICH_INLINE_TYPES = new Set([
  "text",
  "heading",
  "hero",
  "quote",
  "list",
  "footer",
])
