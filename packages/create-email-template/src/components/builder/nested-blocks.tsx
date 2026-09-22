"use client"

// Editables de los bloques contenedores (container y columns v2). Viven aparte
// de editable-block-renderer para evitar un ciclo de imports: NestedBlockList
// depende de EditableBlockRenderer, así que los editables que lo usan no pueden
// definirse en el mismo módulo.
import { blockSpacing } from "../../core/blocks"
import type { ColumnDef } from "../../core/types"
import type { BlockEditableProps } from "../../block-views"
import { NestedBlockList } from "./nested-block-list"
import { InlineTextEditor } from "./inline-text-editor"

export const EditableContainer = ({
  block,
  props,
}: BlockEditableProps) => (
  <div
    style={{
      ...blockSpacing(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    }}
  >
    <NestedBlockList
      location={{ parentId: block.id }}
      emptyLabel="Suelta bloques aquí"
    />
  </div>
)

export const EditableGrid = ({ block, props }: BlockEditableProps) => {
  const columns = (props.columns as ColumnDef[]) || []
  const fallback = columns.length > 0 ? 100 / columns.length : 100
  return (
    <div
      style={{
        ...blockSpacing(props),
        ...(props.backgroundColor
          ? { backgroundColor: props.backgroundColor }
          : {}),
      }}
    >
      <div style={{ display: "flex", gap: props.gap ?? 0 }}>
        {columns.map((col) => (
          <div
            key={col.id}
            style={{
              flexGrow: col.width ?? fallback,
              flexBasis: 0,
              minWidth: 0,
            }}
          >
            <NestedBlockList
              location={{ parentId: block.id, columnId: col.id }}
              emptyLabel="Celda vacía"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export const EditableColumns = ({
  block,
  props,
}: BlockEditableProps) => {
  const columns = (props.columns as ColumnDef[]) || []
  return (
    <div
      style={{
        ...blockSpacing(props),
        ...(props.backgroundColor
          ? { backgroundColor: props.backgroundColor }
          : {}),
      }}
    >
      <div style={{ display: "flex", gap: props.gap ?? 8 }}>
        {columns.map((col) => (
          <div key={col.id} style={{ flex: 1, minWidth: 0 }}>
            <NestedBlockList
              location={{ parentId: block.id, columnId: col.id }}
              emptyLabel="Columna vacía"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Footer: variante "classic" (barra oscura con texto) o layout de columnas
// (footer 2 / 3) con bloques anidados editables.
export const EditableFooter = ({
  block,
  props,
  set,
  palette,
}: BlockEditableProps) => {
  if (props.variant && props.variant !== "classic") {
    const columns = (props.columns as ColumnDef[]) || []
    const fallback = columns.length > 0 ? 100 / columns.length : 100
    return (
      <div
        style={{
          ...blockSpacing(props),
          ...(props.backgroundColor
            ? { backgroundColor: props.backgroundColor }
            : {}),
        }}
      >
        <div style={{ display: "flex", gap: props.gap ?? 12 }}>
          {columns.map((col) => (
            <div
              key={col.id}
              style={{
                flexGrow: col.width ?? fallback,
                flexBasis: 0,
                minWidth: 0,
              }}
            >
              <NestedBlockList
                location={{ parentId: block.id, columnId: col.id }}
                emptyLabel="Columna vacía"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: props.backgroundColor || palette.DARK,
        padding: "24px 32px",
        textAlign: "center",
      }}
    >
      <InlineTextEditor
        rich
        value={props.text || ""}
        onChange={(v) => set({ text: v })}
        placeholder="Recibes este correo por estar registrado..."
        style={{ color: "#f5f1e8", fontSize: 12, lineHeight: 1.6, minHeight: 18 }}
      />
      <div style={{ marginTop: 12 }}>
        <InlineTextEditor
          rich
          value={props.brandName || ""}
          onChange={(v) => set({ brandName: v })}
          placeholder="Marca"
          style={{ color: palette.GOLD, fontSize: 11, minHeight: 18 }}
        />
      </div>
    </div>
  )
}
