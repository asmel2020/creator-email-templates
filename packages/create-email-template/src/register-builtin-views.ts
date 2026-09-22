"use client"

// Registra las vistas built-in (Preview + Editable + fields) al importar el
// entry del paquete. Los plugins llaman a registerBlockViews después.
import { PREVIEW_COMPONENTS } from "./core/blocks"
import {
  BUILTIN_EDITABLES,
  BUILTIN_FIELDS,
  RICH_INLINE_TYPES,
} from "./block-views-builtin"
import { registerBlockViews, type BlockFieldDef } from "./block-views"
import { DEFAULT_BLOCK_LIBRARY } from "./core/default-blocks"

/** Bloques cuyo render aplica padding/margen (spacer y footer tienen layout fijo). */
const SPACING_TYPES = new Set([
  "header",
  "hero",
  "heading",
  "text",
  "list",
  "button",
  "image",
  "quote",
  "columns",
  "container",
  "grid",
  "divider",
  "social",
  "gallery",
  "stats",
  "pricing",
  "product",
  "checkout",
  "testimonial",
  "features",
  "avatar",
  "code",
  "link",
  "downloads",
])

const spacingGroup = (withGap: boolean): BlockFieldDef => ({
  kind: "group",
  label: "Espaciado",
  fields: [
    {
      kind: "row",
      fields: [
        { kind: "number", key: "paddingY", label: "Padding vertical (px)" },
        { kind: "number", key: "paddingX", label: "Padding horizontal (px)" },
      ],
    },
    {
      kind: "row",
      fields: [
        { kind: "number", key: "marginTop", label: "Margen superior (px)" },
        { kind: "number", key: "marginBottom", label: "Margen inferior (px)" },
      ],
    },
    ...(withGap
      ? ([
          {
            kind: "row",
            fields: [
              { kind: "number", key: "gap", label: "Separación columnas (px)" },
            ],
          },
        ] as BlockFieldDef[])
      : []),
  ],
})

for (const def of DEFAULT_BLOCK_LIBRARY) {
  const baseFields = BUILTIN_FIELDS[def.type] ?? []
  registerBlockViews({
    type: def.type,
    Preview: PREVIEW_COMPONENTS[def.type],
    Editable: BUILTIN_EDITABLES[def.type],
    fields: SPACING_TYPES.has(def.type)
      ? [...baseFields, spacingGroup(def.type === "columns")]
      : baseFields,
    richInline: RICH_INLINE_TYPES.has(def.type),
  })
}
