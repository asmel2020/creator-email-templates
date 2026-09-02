"use client"

import { type EmailBlock } from "../../core/types"
import { blockAlignMap, blockPadding } from "../../core/blocks"
import {
  useEmailBuilderConfig,
  useEmailBuilderStore,
} from "../../store/email-builder-provider"
import { InlineTextEditor } from "./inline-text-editor"
import { Plus } from "lucide-react"
import { useState } from "react"

interface Props {
  block: EmailBlock
}

export const EditableBlockRenderer = ({ block }: Props) => {
  const config = useEmailBuilderConfig()
  const updateBlockProps = useEmailBuilderStore((s) => s.updateBlockProps)
  const [lastAdded, setLastAdded] = useState<number | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = block.props as any
  const palette = config.palette
  const labels = config.labels

  const set = (patch: Record<string, unknown>) => {
    updateBlockProps(block.id, { ...block.props, ...patch })
  }

  const align = blockAlignMap[
    (props.align || "left") as "left" | "center" | "right"
  ] as "left" | "center" | "right"
  const pad = blockPadding(props)

  switch (block.type) {
    case "header":
      return (
        <div
          style={{
            backgroundColor: props.backgroundColor || palette.DARK,
            textAlign: align,
            ...pad,
          }}
        >
          {props.logoUrl ? (
            <img
              src={props.logoUrl}
              alt=""
              style={{ display: "inline-block", maxWidth: 140, maxHeight: 48 }}
            />
          ) : (
            <InlineTextEditor
              rich
              value={props.brandName}
              onChange={(v) => set({ brandName: v })}
              style={{
                color: palette.GOLD,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "1px",
                margin: 0,
              }}
            />
          )}
          {props.tagline ? (
            <InlineTextEditor
              rich
              value={props.tagline}
              onChange={(v) => set({ tagline: v })}
              style={{
                color: palette.CREAM_DIM,
                fontSize: 11,
                margin: "6px 0 0",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
              }}
            />
          ) : null}
        </div>
      )

    case "hero":
      return (
        <div style={{ textAlign: align, ...pad }}>
          {props.imageUrl ? (
            <img
              src={props.imageUrl}
              alt=""
              style={{
                maxWidth: "100%",
                margin: "0 auto 24px",
                display: "block",
              }}
            />
          ) : null}
          <InlineTextEditor
            rich
            value={props.title}
            onChange={(v) => set({ title: v })}
            style={{
              color: palette.DARK,
              fontSize: 32,
              lineHeight: 1.2,
              margin: "0 0 12px",
              fontWeight: 700,
            }}
          />
          <InlineTextEditor
            rich
            value={props.subtitle || ""}
            onChange={(v) => set({ subtitle: v })}
            style={{
              color: palette.INK,
              fontSize: 16,
              lineHeight: 1.6,
              margin: 0,
            }}
          />
        </div>
      )

    case "heading":
      return (
        <div
          style={{
            textAlign: align,
            ...pad,
            ...(props.backgroundColor
              ? { backgroundColor: props.backgroundColor }
              : {}),
          }}
        >
          <InlineTextEditor
            rich
            value={props.text}
            onChange={(v) => set({ text: v })}
            style={{
              color: props.color || palette.DARK,
              fontSize: props.size ?? 22,
              lineHeight: 1.3,
              margin: 0,
              fontWeight: 700,
            }}
          />
        </div>
      )

    case "text":
      return (
        <div
          style={{
            textAlign: align,
            ...pad,
            ...(props.backgroundColor
              ? { backgroundColor: props.backgroundColor }
              : {}),
          }}
        >
          <InlineTextEditor
            rich
            value={props.text}
            onChange={(v) => set({ text: v })}
            style={{
              color: props.color || palette.INK,
              fontSize: props.size || 15,
              lineHeight: 1.6,
              margin: 0,
            }}
          />
        </div>
      )

    case "list": {
      const addItem = (i: number) => {
        const items = [...props.items]
        items.splice(i + 1, 0, "")
        set({ items })
        setLastAdded(i + 1)
      }
      const removeItem = (i: number) => {
        const items = props.items.filter((_: string, j: number) => j !== i)
        set({ items })
        const focusIdx = Math.max(0, Math.min(i - 1, items.length - 1))
        setLastAdded(items.length > 0 ? focusIdx : null)
      }
      return (
        <div
          style={{
            ...pad,
            ...(props.backgroundColor
              ? { backgroundColor: props.backgroundColor }
              : {}),
          }}
        >
          {props.items.map((item: string, i: number) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  color: palette.GOLD,
                  fontWeight: 700,
                  fontSize: 14,
                  width: 20,
                  flexShrink: 0,
                  textAlign: "center",
                }}
              >
                {props.icon || "✓"}
              </span>
              <InlineTextEditor
                rich
                value={item}
                onChange={(v) =>
                  set({
                    items: props.items.map((it: string, j: number) =>
                      j === i ? v : it
                    ),
                  })
                }
                onEnter={() => addItem(i)}
                onDeleteWhenEmpty={() => removeItem(i)}
                autoFocus={i === lastAdded}
                placeholder={labels.listItemPlaceholder}
                style={{
                  color: palette.INK,
                  fontSize: 14,
                  lineHeight: 1.5,
                  flex: 1,
                  minHeight: 20,
                }}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => addItem(props.items.length - 1)}
            className="ter-mt-1 ter-flex ter-items-center ter-gap-1 ter-text-xs ter-text-muted-foreground ter-transition-colors ter-hover:text-[#a98a1e]"
          >
            <Plus className="ter-h-3.5 ter-w-3.5" />
            {labels.addListItem}
          </button>
        </div>
      )
    }

    case "button":
      return (
        <div
          style={{
            textAlign: align,
            ...pad,
            ...(props.blockBackgroundColor
              ? { backgroundColor: props.blockBackgroundColor }
              : {}),
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: props.backgroundColor || palette.GOLD,
              color: props.color || palette.DARK,
              fontWeight: 700,
              padding: "14px 28px",
              borderRadius: 999,
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <InlineTextEditor
              value={props.label}
              onChange={(v) => set({ label: v })}
              style={{
                color: props.color || palette.DARK,
                fontWeight: 700,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            />
          </div>
        </div>
      )

    case "image":
      return (
        <div
          style={{
            textAlign: align,
            ...pad,
            ...(props.backgroundColor
              ? { backgroundColor: props.backgroundColor }
              : {}),
          }}
        >
          {props.src ? (
            props.href ? (
              <a
                href={props.href}
                target="_blank"
                rel="noopener"
                style={{ display: "inline-block" }}
              >
                <img
                  src={props.src}
                  alt={props.alt || ""}
                  style={{ maxWidth: "100%", display: "inline-block" }}
                />
              </a>
            ) : (
              <img
                src={props.src}
                alt={props.alt || ""}
                style={{ maxWidth: "100%", display: "inline-block" }}
              />
            )
          ) : (
            <span style={{ color: palette.CREAM_DIM, fontSize: 12 }}>
              ({labels.imagePlaceholder})
            </span>
          )}
        </div>
      )

    case "quote":
      return (
        <div
          style={{
            borderLeft: `${props.borderWidth ?? 3}px solid ${
              props.borderColor || palette.GOLD
            }`,
            ...pad,
            paddingLeft: (props.paddingX ?? 32) + 16,
            ...(props.marginLeft
              ? { marginLeft: `${props.marginLeft}px` }
              : {}),
            ...(props.backgroundColor
              ? { backgroundColor: props.backgroundColor }
              : {}),
          }}
        >
          <InlineTextEditor
            rich
            value={props.text}
            onChange={(v) => set({ text: v })}
            style={{
              color: palette.INK,
              fontStyle: "italic",
              fontSize: 15,
              lineHeight: 1.6,
            }}
          />
          <InlineTextEditor
            rich
            value={props.author || ""}
            onChange={(v) => set({ author: v })}
            placeholder={labels.quoteAuthor}
            style={{
              color: palette.CREAM_DIM,
              fontSize: 12,
              margin: "8px 0 0",
              minHeight: 18,
            }}
          />
        </div>
      )

    case "columns":
      return (
        <div
          style={{
            display: "flex",
            gap: 8,
            ...pad,
            ...(props.backgroundColor
              ? { backgroundColor: props.backgroundColor }
              : {}),
          }}
        >
          {props.columns.map((col: { id: string; text: string }) => (
            <div key={col.id} style={{ flex: 1, minWidth: 0 }}>
              <InlineTextEditor
                rich
                value={col.text}
                onChange={(v) =>
                  set({
                    columns: props.columns.map(
                      (c: { id: string; text: string }) =>
                        c.id === col.id ? { ...c, text: v } : c
                    ),
                  })
                }
                style={{ color: palette.INK, fontSize: 14, lineHeight: 1.5 }}
              />
            </div>
          ))}
        </div>
      )

    case "divider":
      return (
        <div
          style={{
            ...(props.height !== undefined
              ? { padding: `${props.height}px ${props.paddingX ?? 32}px` }
              : pad),
            ...(props.backgroundColor
              ? { backgroundColor: props.backgroundColor }
              : {}),
          }}
        >
          <div style={{ borderTop: `1px solid ${props.color || "#e3dccb"}` }} />
        </div>
      )

    case "spacer":
      return (
        <div
          style={{
            height: props.height || 24,
            ...(props.backgroundColor
              ? { backgroundColor: props.backgroundColor }
              : {}),
          }}
        />
      )

    case "footer":
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
            style={{
              color: "#f5f1e8",
              fontSize: 12,
              lineHeight: 1.6,
              margin: "0 0 12px",
            }}
          />
          <InlineTextEditor
            rich
            value={props.brandName || ""}
            onChange={(v) => set({ brandName: v })}
            placeholder="Marca"
            style={{
              color: palette.GOLD,
              fontSize: 11,
              letterSpacing: "1px",
              minHeight: 18,
            }}
          />
        </div>
      )

    default:
      return null
  }
}
