"use client"

// Registro de vistas de bloque para la UI: preview react-email, canvas
// editable y schema de campos del panel. Los built-in se registran al
// importar block-views-builtins; los plugins usan registerBlockViews.
import type * as React from "react"
import type {
  EmailBlock,
  EmailContext,
  EmailPalette,
} from "./core/types"
import type { EmailBuilderLabels } from "./config/types"

export interface BlockPreviewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any
  context: EmailContext
  palette: EmailPalette
}

export interface BlockEditableProps {
  block: EmailBlock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any
  set: (patch: Record<string, unknown>) => void
  palette: EmailPalette
  labels: EmailBuilderLabels
}

export interface BlockFieldsProps {
  block: EmailBlock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any
  set: (patch: Record<string, unknown>) => void
  labels: EmailBuilderLabels
}

export type BlockFieldDef =
  | { kind: "text"; key: string; label: string }
  | { kind: "richText"; key: string; label: string; placeholder?: string }
  | { kind: "number"; key: string; label: string; min?: number; default?: number }
  | { kind: "color"; key: string; label: string; fallback?: string }
  | { kind: "align"; key: string; label: string }
  | {
      kind: "select"
      key: string
      label: string
      options: { value: string | boolean | number; label: string }[]
    }
  | {
      kind: "layout"
      key: string
      label: string
      options: { value: string; label: string; widths: number[] }[]
    }
  | {
      kind: "preset"
      key: string
      label: string
      options: {
        value: string
        label: string
        build: () => Record<string, unknown>
      }[]
    }
  | { kind: "image"; key: string }
  | { kind: "icons"; key: string; label: string; options: readonly string[] }
  | { kind: "hint"; labelKey: keyof EmailBuilderLabels }
  | { kind: "row"; fields: [BlockFieldDef, BlockFieldDef?] }
  | {
      kind: "group"
      label: string
      fields: BlockFieldDef[]
      /** Muestra el grupo solo si `props[key]` coincide con `equals`. */
      visibleWhen?: {
        key: string
        equals: string | boolean | number | (string | boolean | number)[]
      }
    }
  | { kind: "stringList"; key: string; label: string; placeholder?: string }
  | {
      kind: "repeat"
      key: string
      label: string
      itemLabel: string
      /** No numera las filas ("Plan" en vez de "Plan 1"). */
      hideIndex?: boolean
      fields: BlockFieldDef[]
    }
  | { kind: "custom"; id: string }

export interface BlockViewRegistration {
  type: string
  Preview?: React.ComponentType<BlockPreviewProps>
  Editable?: React.ComponentType<BlockEditableProps>
  fields?: BlockFieldDef[]
  /** Muestra el hint de edición inline en el panel. */
  richInline?: boolean
}

const views = new Map<string, BlockViewRegistration>()

export const registerBlockViews = (registration: BlockViewRegistration): void => {
  if (!registration.type) {
    throw new Error("registerBlockViews: type is required")
  }
  const existing = views.get(registration.type)
  views.set(registration.type, {
    ...existing,
    ...registration,
    fields: registration.fields ?? existing?.fields,
  })
}

export const unregisterBlockViews = (type: string): void => {
  views.delete(type)
}

export const getBlockView = (
  type: string,
): BlockViewRegistration | undefined => views.get(type)

export const listBlockViews = (): BlockViewRegistration[] => [
  ...views.values(),
]
