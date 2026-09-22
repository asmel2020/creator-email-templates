"use client"

import { type EmailBlock, type EmailPalette } from "../../core/types"
import { newId } from "../../core/id"
import { blockAlignMap, blockSpacing } from "../../core/blocks"
import {
  FILE_KIND_LABELS,
  fileKind,
  formatBytes,
} from "../../core/types"
import { isSafeFileUrl } from "../../core/richtext"
import {
  useEmailBuilderConfig,
  useEmailBuilderStore,
} from "../../store/email-builder-provider"
import { InlineTextEditor } from "./inline-text-editor"
import { Plus, X } from "lucide-react"
import { useState, type CSSProperties, type ReactNode } from "react"
import { getBlockView, type BlockEditableProps } from "../../block-views"

interface Props {
  block: EmailBlock
}

export const EditableHeader = ({
  props,
  set,
  palette,
}: BlockEditableProps) => {
  const align = blockAlignMap[(props.align || "left") as "left" | "center" | "right"]
  const pad = blockSpacing(props)
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
}

export const EditableHero = ({ props, set, palette }: BlockEditableProps) => {
  const align = blockAlignMap[(props.align || "left") as "left" | "center" | "right"]
  const pad = blockSpacing(props)
  return (
    <div style={{ textAlign: align, ...pad }}>
      {props.imageUrl ? (
        <img
          src={props.imageUrl}
          alt=""
          style={{ maxWidth: "100%", margin: "0 auto 24px", display: "block" }}
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
}

export const EditableHeading = ({ props, set, palette }: BlockEditableProps) => {
  const align = blockAlignMap[(props.align || "left") as "left" | "center" | "right"]
  const pad = blockSpacing(props)
  return (
    <div
      style={{
        textAlign: align,
        ...pad,
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
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
}

export const EditableText = ({ props, set, palette }: BlockEditableProps) => {
  const align = blockAlignMap[(props.align || "left") as "left" | "center" | "right"]
  const pad = blockSpacing(props)
  return (
    <div
      style={{
        textAlign: align,
        ...pad,
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
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
}

export const EditableList = ({ props, set, palette, labels }: BlockEditableProps) => {
  const pad = blockSpacing(props)
  const [lastAdded, setLastAdded] = useState<number | null>(null)
  const entries = (props.entries || []) as {
    id: string
    title: string
    description?: string
    number?: string
    image?: string
    href?: string
    linkLabel?: string
  }[]
  const withImage = props.variant === "with-image"
  const isEntryVariant = props.variant === "numbered" || withImage
  const accent = (props.accentColor as string) || palette.GOLD
  const radius = typeof props.radius === "number" ? props.radius : 4
  const imageHeight = typeof props.imageHeight === "number" ? props.imageHeight : 168
  const entryGap = typeof props.gap === "number" ? props.gap : 24

  const addItem = (i: number) => {
    const items = [...(props.items as string[])]
    items.splice(i + 1, 0, "")
    set({ items })
    setLastAdded(i + 1)
  }
  const removeItem = (i: number) => {
    const items = (props.items as string[]).filter((_, j) => j !== i)
    set({ items })
    const focusIdx = Math.max(0, Math.min(i - 1, items.length - 1))
    setLastAdded(items.length > 0 ? focusIdx : null)
  }

  const updateEntry = (i: number, patch: Record<string, unknown>) =>
    set({ entries: entries.map((e, j) => (j === i ? { ...e, ...patch } : e)) })
  const addEntry = (i: number) => {
    const next = [...entries]
    next.splice(i + 1, 0, { id: newId(), title: "", description: "" })
    set({ entries: next })
    setLastAdded(i + 1)
  }
  const removeEntry = (i: number) => {
    const next = entries.filter((_, j) => j !== i)
    set({ entries: next })
    setLastAdded(next.length > 0 ? Math.max(0, Math.min(i - 1, next.length - 1)) : null)
  }

  if (isEntryVariant) {
    return (
      <div
        style={{
          ...pad,
          ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
        }}
      >
        {entries.map((entry, i) => {
          const badge = (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 9999,
                backgroundColor: accent,
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 600,
                lineHeight: "24px",
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              {entry.number && entry.number.trim() !== "" ? entry.number : i + 1}
            </div>
          )
          return (
            <div
              key={entry.id}
              style={{
                display: "flex",
                gap: 18,
                alignItems: "flex-start",
                marginBottom: i === entries.length - 1 ? 0 : entryGap,
              }}
            >
            {withImage && (
              <div style={{ width: "40%", flexShrink: 0, paddingRight: 24 }}>
                {entry.image ? (
                  <img
                    src={entry.image}
                    alt={entry.title}
                    style={{
                      width: "100%",
                      height: imageHeight,
                      borderRadius: radius,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: imageHeight,
                      borderRadius: radius,
                      border: "1px dashed #c9c0ae",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: palette.CREAM_DIM,
                      fontSize: 12,
                    }}
                  >
                    Imagen
                  </div>
                )}
              </div>
            )}
            {!withImage && <div style={{ flexShrink: 0, paddingTop: 2 }}>{badge}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <InlineTextEditor
                value={entry.title}
                onChange={(v) => updateEntry(i, { title: v })}
                onDeleteWhenEmpty={() => removeEntry(i)}
                autoFocus={i === lastAdded}
                placeholder="Título del paso"
                style={{
                  color: palette.DARK,
                  fontSize: 18,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  minHeight: 22,
                }}
              />
              <InlineTextEditor
                rich
                value={entry.description || ""}
                onChange={(v) => updateEntry(i, { description: v })}
                placeholder="Describe el paso o beneficio"
                style={{
                  color: palette.INK,
                  fontSize: 13,
                  lineHeight: 1.5,
                  minHeight: 18,
                  marginTop: 2,
                }}
              />
              {entry.href && (
                <span
                  style={{
                    display: "block",
                    color: accent,
                    fontSize: 14,
                    fontWeight: 600,
                    marginTop: 12,
                  }}
                >
                  {entry.linkLabel || "Aprender más →"}
                </span>
              )}
            </div>
            <button
              type="button"
              title="Quitar paso"
              onClick={() => removeEntry(i)}
              className="ter-text-muted-foreground ter-transition-colors ter-hover:text-destructive"
            >
              <X className="ter-h-3.5 ter-w-3.5" />
            </button>
          </div>
          )
        })}

        <button
          type="button"
          onClick={() => addEntry(entries.length - 1)}
          className="ter-mt-1 ter-flex ter-items-center ter-gap-1 ter-text-xs ter-text-muted-foreground ter-transition-colors ter-hover:text-[#a98a1e]"
        >
          <Plus className="ter-h-3.5 ter-w-3.5" />
          {labels.addListItem}
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        ...pad,
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      {(props.items as string[]).map((item, i) => (
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
                items: (props.items as string[]).map((it, j) =>
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
        onClick={() => addItem((props.items as string[]).length - 1)}
        className="ter-mt-1 ter-flex ter-items-center ter-gap-1 ter-text-xs ter-text-muted-foreground ter-transition-colors ter-hover:text-[#a98a1e]"
      >
        <Plus className="ter-h-3.5 ter-w-3.5" />
        {labels.addListItem}
      </button>
    </div>
  )
}

export const EditableButton = ({ props, set, palette }: BlockEditableProps) => {
  const align = blockAlignMap[(props.align || "left") as "left" | "center" | "right"]
  const pad = blockSpacing(props)
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
}

export const EditableImage = ({
  props,
  palette,
  labels,
}: BlockEditableProps) => {
  const align = blockAlignMap[(props.align || "left") as "left" | "center" | "right"]
  const pad = blockSpacing(props)
  return (
    <div
      style={{
        textAlign: align,
        ...pad,
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
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
}

export const EditableQuote = ({ props, set, palette, labels }: BlockEditableProps) => {
  const pad = blockSpacing(props)
  return (
    <div
      style={{
        borderLeft: `${props.borderWidth ?? 3}px solid ${
          props.borderColor || palette.GOLD
        }`,
        ...pad,
        paddingLeft: (props.paddingX ?? 32) + 16,
        ...(props.marginLeft ? { marginLeft: `${props.marginLeft}px` } : {}),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
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
}

export const EditableDivider = ({ props }: BlockEditableProps) => {
  const pad = blockSpacing(props)
  return (
    <div
      style={{
        ...pad,
        ...(props.height !== undefined
          ? { padding: `${props.height}px ${props.paddingX ?? 32}px` }
          : {}),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      <div style={{ borderTop: `1px solid ${props.color || "#e3dccb"}` }} />
    </div>
  )
}

export const EditableSpacer = ({ props }: BlockEditableProps) => (
  <div
    style={{
      height: props.height || 24,
      ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
    }}
  />
)

const isAssetUrl = (value: string): boolean =>
  /^(https?:)?\/\//.test(value.trim()) || value.trim().startsWith("data:")

const chunkItems = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

const surface = (
  props: {
    align?: string
    backgroundColor?: string
  },
  extra?: CSSProperties
): CSSProperties => ({
  textAlign: (props.align || "left") as CSSProperties["textAlign"],
  ...blockSpacing(props as never),
  ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
  ...extra,
})

export const EditableSocial = ({ props, palette }: BlockEditableProps) => {
  const logo = props.mode === "logo"
  const accent = props.accentColor || palette.GOLD
  const size = props.iconSize ?? 32
  const half = (props.gap ?? 6) / 2
  return (
    <div style={surface(props, { textAlign: (props.align || "center") as never })}>
      {(props.links || []).map((l: { id: string; label: string; icon?: string }) =>
        logo ? (
          <span key={l.id} style={{ display: "inline-block", margin: `0 ${half}px` }}>
            {(isAssetUrl(l.icon || ""))
              ? <img src={l.icon} alt={l.label} style={{ width: size, height: size, borderRadius: "50%", display: "inline-block", objectFit: "cover" }} />
              : (
                <span
                  style={{
                    display: "inline-block",
                    width: size,
                    height: size,
                    lineHeight: `${size}px`,
                    textAlign: "center",
                    borderRadius: "50%",
                    backgroundColor: accent,
                    color: palette.DARK,
                    fontSize: Math.round(size * 0.4),
                    fontWeight: 700,
                  }}
                >
                  {(l.icon || l.label).slice(0, 2)}
                </span>
              )}
          </span>
        ) : (
          <span
            key={l.id}
            style={{
              color: props.color || palette.INK,
              fontSize: 13,
              fontWeight: 600,
              margin: "0 10px",
              display: "inline-block",
            }}
          >
            {l.label}
          </span>
        ),
      )}
    </div>
  )
}

/** Miniatura de galería en el canvas (o placeholder si no hay imagen). */
const GalleryThumb = ({
  image,
  palette,
  radius,
  height,
}: {
  image?: { id?: string; src?: string; alt?: string }
  palette: EmailPalette
  radius: number
  height: number
}) => {
  if (!image || !image.src) {
    return (
      <div
        style={{
          height: height > 0 ? height : 80,
          borderRadius: radius,
          border: "1px dashed #c9c0ae",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: palette.CREAM_DIM,
          fontSize: 12,
        }}
      >
        Imagen
      </div>
    )
  }
  return (
    <img
      src={image.src}
      alt={image.alt || ""}
      style={{
        width: "100%",
        display: "block",
        borderRadius: radius,
        ...(height > 0 ? { height, objectFit: "cover" as const } : {}),
      }}
    />
  )
}

export const EditableGallery = ({ props, palette }: BlockEditableProps) => {
  const images = (props.images || []) as {
    id: string
    src: string
    alt?: string
  }[]
  const radius = typeof props.radius === "number" ? props.radius : 6
  const height = typeof props.imageHeight === "number" ? props.imageHeight : 0
  const gap = props.gap ?? 12
  const thumb = (image: (typeof images)[number] | undefined, h = height) => (
    <GalleryThumb image={image} palette={palette} radius={radius} height={h} />
  )

  let content: ReactNode
  switch (props.variant) {
    case "three-columns":
      content = (
        <div style={{ display: "flex", gap }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ flex: 1, minWidth: 0 }}>
              {thumb(images[i])}
            </div>
          ))}
        </div>
      )
      break
    case "horizontal":
      content = (
        <div style={{ display: "flex", gap }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap }}>
            {thumb(images[0])}
            {thumb(images[1])}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {thumb(images[2], height > 0 ? height * 2 + gap : 0)}
          </div>
        </div>
      )
      break
    case "vertical":
      content = (
        <div style={{ display: "flex", flexDirection: "column", gap }}>
          {thumb(images[0])}
          <div style={{ display: "flex", gap }}>
            <div style={{ flex: 1, minWidth: 0 }}>{thumb(images[1])}</div>
            <div style={{ flex: 1, minWidth: 0 }}>{thumb(images[2])}</div>
          </div>
        </div>
      )
      break
    default: {
      const cols = props.columns === 3 ? 3 : 2
      content = (
        <div style={{ display: "flex", flexDirection: "column", gap }}>
          {chunkItems(images, cols).map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap }}>
              {row.map((image) => (
                <div key={image.id} style={{ flex: 1, minWidth: 0 }}>
                  {thumb(image)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )
    }
  }

  return <div style={blockSpacing(props)}>{content}</div>
}

export const EditableStats = ({ props, palette }: BlockEditableProps) => (
  <div style={surface(props, { textAlign: (props.align || "center") as never })}>
    <div style={{ display: "flex", gap: 8 }}>
      {(props.stats || []).map((s: { id: string; value: string; label: string }) => (
        <div key={s.id} style={{ flex: 1, padding: 8, textAlign: "center" }}>
          <div
            style={{
              color: props.accentColor || palette.GOLD,
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {s.value}
          </div>
          <div style={{ color: palette.INK, fontSize: 12, marginTop: 6 }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  </div>
)

const WideButton = ({
  label,
  background,
  color,
  radius,
  padding,
  fontSize,
  fontWeight,
}: {
  label?: string
  background: string
  color: string
  radius: number
  padding: string
  fontSize: number
  fontWeight: number
}) =>
  label ? (
    <span
      style={{
        display: "block",
        backgroundColor: background,
        color,
        borderRadius: radius,
        fontSize,
        fontWeight,
        padding,
        textAlign: "center",
        textDecoration: "none",
      }}
    >
      {label}
    </span>
  ) : null

const EditablePricingOffer = ({
  props,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any
}) => {
  const accent = props.accentColor || "#4f46e5"
  return (
    <div style={blockSpacing(props)}>
      <div
        style={{
          maxWidth: 460,
          margin: "0 auto",
          backgroundColor: "#ffffff",
          border: "1px solid #d1d5db",
          borderRadius: 12,
          padding: 28,
          textAlign: "left",
          color: "#4b5563",
        }}
      >
        {props.eyebrow ? (
          <div style={{ color: accent, fontSize: 12, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>
            {props.eyebrow}
          </div>
        ) : null}
        <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 12 }}>
          <span style={{ color: "#101828" }}>{props.price}</span>{" "}
          <span style={{ fontSize: 16, fontWeight: 500 }}>{props.period}</span>
        </div>
        {props.description ? (
          <div style={{ color: "#374151", fontSize: 14, lineHeight: 1.5, margin: "16px 0 24px" }}>
            {props.description}
          </div>
        ) : null}
        <ul style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, margin: "0 0 32px", paddingLeft: 14 }}>
          {(props.bullets || []).map((b: string, i: number) => (
            <li key={i} style={{ marginBottom: 12 }}>{b}</li>
          ))}
        </ul>
        <WideButton label={props.ctaLabel} background={accent} color="#ffffff" radius={8} padding="14px" fontSize={16} fontWeight={700} />
        <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 24 }} />
        {props.note ? (
          <div style={{ color: "#6b7280", fontSize: 12, fontStyle: "italic", margin: "24px 0 6px", textAlign: "center" }}>
            {props.note}
          </div>
        ) : null}
        {props.note2 ? (
          <div style={{ color: "#6b7280", fontSize: 12, textAlign: "center" }}>{props.note2}</div>
        ) : null}
      </div>
    </div>
  )
}

const EditablePricingTwoTiers = ({
  props,
  palette,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any
  palette: EmailPalette
}) => {
  const plans = (props.plans || []) as {
    id: string
    title: string
    price: string
    period?: string
    description?: string
    features: string[]
    ctaLabel: string
    highlighted?: boolean
  }[]
  return (
    <div style={blockSpacing(props)}>
      {props.heading || props.subtitle ? (
        <div style={{ textAlign: "center", paddingBottom: 32 }}>
          {props.heading ? (
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{props.heading}</div>
          ) : null}
          {props.subtitle ? (
            <div style={{ color: "#6b7280", fontSize: 14 }}>{props.subtitle}</div>
          ) : null}
        </div>
      ) : null}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {plans.map((plan) => {
          const hl = plan.highlighted === true
          const accent = hl ? "#7c86ff" : props.accentColor || palette.GOLD
          return (
            <div key={plan.id} style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  backgroundColor: hl ? "#101828" : "#ffffff",
                  border: `1px solid ${hl ? "#101828" : "#d1d5db"}`,
                  borderRadius: 8,
                  padding: 24,
                  textAlign: "left",
                  color: hl ? "#d1d5db" : "#4b5563",
                }}
              >
                <div style={{ color: accent, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{plan.title}</div>
                <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                  <span style={{ color: hl ? "#ffffff" : "#101828" }}>{plan.price}</span>{" "}
                  <span style={{ fontSize: 14 }}>{plan.period}</span>
                </div>
                {plan.description ? (
                  <div style={{ margin: "12px 0 24px" }}>{plan.description}</div>
                ) : null}
                <ul style={{ fontSize: 12, lineHeight: 1.7, margin: "0 0 30px", paddingLeft: 14 }}>
                  {(plan.features || []).map((f, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>{f}</li>
                  ))}
                </ul>
                <WideButton label={plan.ctaLabel} background="#4f46e5" color="#ffffff" radius={8} padding="12px" fontSize={14} fontWeight={600} />
              </div>
            </div>
          )
        })}
      </div>
      {props.footnote ? (
        <>
          <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 24 }} />
          <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 500, marginTop: 30, textAlign: "center" }}>
            {props.footnote}
          </div>
        </>
      ) : null}
    </div>
  )
}

export const EditablePricing = ({ props, palette }: BlockEditableProps) => {
  if (props.variant === "offer") {
    return <EditablePricingOffer props={props} />
  }
  if (props.variant === "two-tiers") {
    return <EditablePricingTwoTiers props={props} palette={palette} />
  }
  const accent = props.accentColor || palette.GOLD
  const textColor = props.textColor || palette.INK
  return (
    <div style={blockSpacing(props)}>
      <div
        style={{
          maxWidth: 380,
          margin: "0 auto",
          border: "1px solid #e3dccb",
          borderRadius: 10,
          padding: 24,
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: accent,
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          {props.title}
        </div>
        <div style={{ color: textColor, fontSize: 36, fontWeight: 700, lineHeight: 1.1 }}>
          {props.price}
          <span style={{ fontSize: 14, fontWeight: 400, color: palette.CREAM_DIM }}>
            {props.period}
          </span>
        </div>
        <div style={{ margin: "16px 0 0", textAlign: "left" }}>
          {(props.bullets || []).map((b: string, i: number) => (
            <div key={i} style={{ color: textColor, fontSize: 14, lineHeight: 1.6, marginBottom: 6 }}>
              <span style={{ color: accent, fontWeight: 700 }}>✓</span> {b}
            </div>
          ))}
        </div>
        {props.ctaLabel ? (
          <span
            style={{
              display: "inline-block",
              marginTop: 16,
              backgroundColor: accent,
              color: palette.DARK,
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: 999,
              fontSize: 14,
              textTransform: "uppercase",
            }}
          >
            {props.ctaLabel}
          </span>
        ) : null}
      </div>
    </div>
  )
}

/** Imagen de producto en el canvas (o placeholder con alto fijo). */
const ProductThumb = ({
  src,
  palette,
  height,
  radius,
}: {
  src?: string
  palette: EmailPalette
  height: number
  radius: number
}) =>
  src ? (
    <img
      src={src}
      alt=""
      style={{ width: "100%", height, borderRadius: radius, objectFit: "cover", display: "block" }}
    />
  ) : (
    <div
      style={{
        height,
        borderRadius: radius,
        border: "1px dashed #c9c0ae",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: palette.CREAM_DIM,
        fontSize: 12,
      }}
    >
      Imagen
    </div>
  )

const ProductCta = ({
  label,
  accent,
  style,
}: {
  label?: string
  accent: string
  style?: CSSProperties
}) =>
  label ? (
    <span
      style={{
        display: "inline-block",
        backgroundColor: accent,
        color: "#ffffff",
        borderRadius: 8,
        padding: "12px 24px",
        fontSize: 16,
        fontWeight: 600,
        textAlign: "center",
        ...style,
      }}
    >
      {label}
    </span>
  ) : null

const EditableProductHero = ({
  props,
  palette,
}: Pick<BlockEditableProps, "props" | "palette">) => {
  const accent = (props.accentColor as string) || palette.GOLD
  const height = props.imageHeight > 0 ? props.imageHeight : 320
  const radius = typeof props.radius === "number" ? props.radius : 12
  return (
    <div style={surface(props, { textAlign: (props.align || "center") as never })}>
      <ProductThumb src={props.imageUrl} palette={palette} height={height} radius={radius} />
      {props.eyebrow ? (
        <div style={{ color: accent, fontSize: 18, fontWeight: 600, lineHeight: 1.55, marginTop: 16 }}>
          {props.eyebrow}
        </div>
      ) : null}
      <div style={{ color: palette.DARK, fontSize: 36, fontWeight: 600, lineHeight: 1.11, letterSpacing: 0.4, marginTop: 8 }}>
        {props.name}
      </div>
      {props.description ? (
        <div style={{ color: palette.INK, fontSize: 16, lineHeight: 1.5, marginTop: 8 }}>{props.description}</div>
      ) : null}
      {props.price ? (
        <div style={{ color: palette.DARK, fontSize: 16, fontWeight: 600, lineHeight: 1.5, marginTop: 8 }}>{props.price}</div>
      ) : null}
      <div style={{ marginTop: 16 }}>
        <ProductCta label={props.ctaLabel} accent={accent} />
      </div>
    </div>
  )
}

const EditableProductImageLeft = ({
  props,
  palette,
}: Pick<BlockEditableProps, "props" | "palette">) => {
  const accent = (props.accentColor as string) || palette.GOLD
  const height = props.imageHeight > 0 ? props.imageHeight : 220
  const radius = typeof props.radius === "number" ? props.radius : 8
  return (
    <div style={blockSpacing(props)}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div style={{ width: "50%", paddingRight: 32, boxSizing: "border-box" }}>
          <ProductThumb src={props.imageUrl} palette={palette} height={height} radius={radius} />
        </div>
        <div style={{ width: "50%" }}>
          <div style={{ color: palette.DARK, fontSize: 20, fontWeight: 600, lineHeight: 1.4, marginTop: 8 }}>
            {props.name}
          </div>
          {props.description ? (
            <div style={{ color: palette.INK, fontSize: 16, lineHeight: 1.5, marginTop: 8 }}>{props.description}</div>
          ) : null}
          {props.price ? (
            <div style={{ color: palette.DARK, fontSize: 18, fontWeight: 600, lineHeight: 1.55, marginTop: 8 }}>
              {props.price}
            </div>
          ) : null}
          <div style={{ marginTop: 16 }}>
            <ProductCta
              label={props.ctaLabel}
              accent={accent}
              style={{ width: "75%", boxSizing: "border-box", padding: "12px 16px" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const EditableProductGrid = ({
  props,
  palette,
}: Pick<BlockEditableProps, "props" | "palette">) => {
  const items = (props.products || []) as {
    id: string
    imageUrl?: string
    name: string
    description?: string
    price?: string
    ctaLabel?: string
  }[]
  const cols = props.columns === 3 ? 3 : props.columns === 4 ? 4 : 2
  const perRow = cols === 4 ? 2 : cols
  const gutter = cols === 3 ? 4 : 8
  const accent = (props.accentColor as string) || palette.GOLD
  const radius = typeof props.radius === "number" ? props.radius : 8
  const height = props.imageHeight > 0 ? props.imageHeight : cols === 3 ? 180 : 250
  const rows = chunkItems(items, perRow)
  return (
    <div style={surface(props, { textAlign: (props.align || "left") as never })}>
      {props.heading || props.subheading ? (
        <div style={{ paddingBottom: 16 }}>
          {props.heading ? (
            <div style={{ color: palette.DARK, fontSize: 20, fontWeight: 600, lineHeight: 1.4 }}>{props.heading}</div>
          ) : null}
          {props.subheading ? (
            <div style={{ color: palette.INK, fontSize: 16, lineHeight: 1.5, marginTop: 8 }}>{props.subheading}</div>
          ) : null}
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((row, ri) => (
          <div key={ri}>
            <div style={{ display: "flex" }}>
              {row.map((item, ci) => (
                <div
                  key={item.id}
                  style={{
                    width: `${Math.round((100 / perRow) * 100) / 100}%`,
                    paddingTop: 16,
                    paddingBottom: 16,
                    ...(ci === 0 ? {} : { paddingLeft: gutter }),
                    ...(ci === row.length - 1 ? {} : { paddingRight: gutter }),
                  }}
                >
                  <ProductThumb src={item.imageUrl} palette={palette} height={height} radius={radius} />
                  <div style={{ color: palette.DARK, fontSize: 20, fontWeight: 600, lineHeight: 1.4, marginTop: 24 }}>
                    {item.name}
                  </div>
                  {item.description ? (
                    <div style={{ color: palette.INK, fontSize: 16, lineHeight: 1.5, marginTop: 16 }}>
                      {item.description}
                    </div>
                  ) : null}
                  {item.price ? (
                    <div style={{ color: palette.DARK, fontSize: 16, fontWeight: 600, lineHeight: 1.5, marginTop: 8 }}>
                      {item.price}
                    </div>
                  ) : null}
                  <div style={{ marginTop: 16 }}>
                    <ProductCta label={item.ctaLabel} accent={accent} />
                  </div>
                </div>
              ))}
            </div>
            {ri === 0 && rows.length > 1 ? (
              <div style={{ borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export const EditableCheckout = ({ props, palette }: BlockEditableProps) => {
  const accent = (props.accentColor as string) || "#4f46e5"
  const border = (props.borderColor as string) || "#e5e7eb"
  const height = props.imageHeight > 0 ? props.imageHeight : 110
  const radius = typeof props.radius === "number" ? props.radius : 8
  const lines = (props.lines || []) as {
    id: string
    imageUrl?: string
    name: string
    quantity?: string
    price?: string
  }[]
  const cell: CSSProperties = { padding: "8px 0", borderBottom: `1px solid ${border}` }
  const head: CSSProperties = { ...cell, color: "#6b7280", fontSize: 14, fontWeight: 600 }
  return (
    <div style={surface(props, { textAlign: (props.align || "center") as never })}>
      {props.heading ? (
        <div style={{ color: palette.DARK, fontSize: 30, fontWeight: 600, lineHeight: 1.2, marginBottom: 16 }}>
          {props.heading}
        </div>
      ) : null}
      <div style={{ border: `1px solid ${border}`, borderRadius: 8, padding: "0 16px 16px", textAlign: "left" }}>
        <table width="100%" style={{ borderCollapse: "collapse", marginBottom: 16 }}>
          <tbody>
            <tr>
              <th style={cell}>&nbsp;</th>
              <th align="left" style={{ ...head, textAlign: "left" }}>
                Producto
              </th>
              <th align="center" style={{ ...head, textAlign: "center" }}>
                Cantidad
              </th>
              <th align="center" style={{ ...head, textAlign: "center" }}>
                Precio
              </th>
            </tr>
            {lines.map((line) => (
              <tr key={line.id}>
                <td style={cell}>
                  {line.imageUrl ? (
                    <img
                      src={line.imageUrl}
                      alt={line.name}
                      style={{ height, borderRadius: radius, objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height,
                        borderRadius: radius,
                        border: "1px dashed #c9c0ae",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: palette.CREAM_DIM,
                        fontSize: 12,
                      }}
                    >
                      Imagen
                    </div>
                  )}
                </td>
                <td align="left" style={cell}>
                  <div style={{ color: palette.DARK, fontSize: 14 }}>{line.name}</div>
                </td>
                <td align="center" style={cell}>
                  <div style={{ color: palette.DARK, fontSize: 14, textAlign: "center" }}>{line.quantity || "1"}</div>
                </td>
                <td align="center" style={cell}>
                  <div style={{ color: palette.DARK, fontSize: 14, textAlign: "center" }}>{line.price || ""}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ProductCta
          label={props.ctaLabel}
          accent={accent}
          style={{ display: "block", width: "100%", boxSizing: "border-box", padding: "12px" }}
        />
      </div>
    </div>
  )
}

export const EditableProduct = ({ props, palette }: BlockEditableProps) => {
  if (props.variant === "hero") return <EditableProductHero props={props} palette={palette} />
  if (props.variant === "image-left") return <EditableProductImageLeft props={props} palette={palette} />
  if (props.variant === "grid") return <EditableProductGrid props={props} palette={palette} />
  return <EditableProductCard props={props} palette={palette} />
}

const EditableProductCard = ({
  props,
  palette,
}: Pick<BlockEditableProps, "props" | "palette">) => (
  <div style={surface(props, { textAlign: (props.align || "center") as never })}>
    {props.imageUrl ? (
      <img
        src={props.imageUrl}
        alt={props.name}
        style={{ maxWidth: "100%", borderRadius: 8, display: "block", margin: "0 auto 16px" }}
      />
    ) : null}
    <div style={{ color: palette.DARK, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
      {props.name}
    </div>
    {props.description ? (
      <div style={{ color: palette.INK, fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
        {props.description}
      </div>
    ) : null}
    <div style={{ color: palette.GOLD, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
      {props.price}
    </div>
    {props.ctaLabel ? (
      <span
        style={{
          display: "inline-block",
          backgroundColor: palette.GOLD,
          color: palette.DARK,
          fontWeight: 700,
          padding: "12px 24px",
          borderRadius: 999,
          fontSize: 14,
          textTransform: "uppercase",
        }}
      >
        {props.ctaLabel}
      </span>
    ) : null}
  </div>
)

export const EditableTestimonial = ({ props, palette }: BlockEditableProps) => (
  <div style={surface(props)}>
    {props.avatarUrl ? (
      <img
        src={props.avatarUrl}
        alt={props.name}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "block",
          marginBottom: 12,
          objectFit: "cover",
        }}
      />
    ) : null}
    <div style={{ color: palette.INK, fontStyle: "italic", fontSize: 16, lineHeight: 1.6 }}>
      {`\u201C${props.quote}\u201D`}
    </div>
    <div
      style={{
        color: props.accentColor || palette.GOLD,
        fontSize: 14,
        fontWeight: 700,
        marginTop: 12,
      }}
    >
      {props.name}
    </div>
    {props.role ? (
      <div style={{ color: palette.CREAM_DIM, fontSize: 12, marginTop: 2 }}>{props.role}</div>
    ) : null}
  </div>
)

export const EditableFeatures = ({ props, palette }: BlockEditableProps) => {
  const cols = props.columns === 3 ? 3 : 2
  const accent = props.accentColor || palette.GOLD
  const features = (props.features || []) as {
    id: string
    icon: string
    title: string
    description: string
  }[]
  return (
    <div style={surface(props)}>
      {chunkItems(features, cols).map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 8 }}>
          {row.map((f) => (
            <div key={f.id} style={{ flex: 1, minWidth: 0, padding: "10px 10px 16px 0" }}>
              <div style={{ color: accent, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                {f.icon || "✓"}
              </div>
              <div style={{ color: palette.DARK, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                {f.title}
              </div>
              <div style={{ color: palette.INK, fontSize: 13, lineHeight: 1.5 }}>
                {f.description}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export const EditableAvatar = ({ props, palette }: BlockEditableProps) => {
  const size = props.size || 96
  return (
    <div style={surface(props, { textAlign: (props.align || "center") as never })}>
      {props.imageUrl ? (
        <img
          src={props.imageUrl}
          alt={props.name}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            display: "inline-block",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: palette.CREAM_DIM,
            display: "inline-block",
          }}
        />
      )}
      <div style={{ color: palette.DARK, fontSize: 16, fontWeight: 700, marginTop: 12 }}>
        {props.name}
      </div>
      {props.role ? (
        <div style={{ color: palette.CREAM_DIM, fontSize: 13, marginTop: 2 }}>{props.role}</div>
      ) : null}
    </div>
  )
}

export const EditableCode = ({ props }: BlockEditableProps) => (
  <div style={blockSpacing(props)}>
    <pre
      style={{
        backgroundColor: props.backgroundColor || "#0d0b08",
        color: props.color || "#f5f1e8",
        padding: 16,
        borderRadius: 8,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: 13,
        lineHeight: 1.5,
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {props.code}
    </pre>
  </div>
)

export const EditableLink = ({ props, palette }: BlockEditableProps) => (
  <div style={surface(props)}>
    <span
      style={{
        color: props.color || palette.GOLD,
        fontSize: 15,
        fontWeight: 600,
        textDecoration: "underline",
      }}
    >
      {props.label}
    </span>
  </div>
)

/**
 * Lista de archivos descargables. Los archivos NO se editan aquí: se suben en
 * Ajustes (`settings.files`); el lienzo solo replica el diseño final.
 */
export const EditableDownloads = ({
  props,
  palette,
  labels,
}: BlockEditableProps) => {
  const settingsFiles = useEmailBuilderStore((s) => s.settings.files)
  const accent = props.accentColor || palette.GOLD
  const border = props.borderColor || "#e3dccb"
  const files = (settingsFiles ?? []).filter(
    (file) => file.link !== false && isSafeFileUrl(file.url),
  )
  const emptyText = props.emptyText || ""
  const cell: CSSProperties = {
    padding: "10px 0",
    borderBottom: `1px solid ${border}`,
    verticalAlign: "middle",
  }

  if (files.length === 0 && !emptyText) {
    return (
      <div style={surface(props)}>
        <div
          style={{
            border: `1px dashed ${border}`,
            borderRadius: props.radius ?? 8,
            padding: "12px 16px",
            color: palette.CREAM_DIM,
            fontSize: 13,
          }}
        >
          {labels.downloadsHint}
        </div>
      </div>
    )
  }

  // En el lienzo el enlace es texto (no navega): se parece al del correo.
  const download = (label: string): ReactNode => (
    <span style={{ color: accent, fontSize: 14, fontWeight: 600, textDecoration: "underline" }}>
      {label}
    </span>
  )

  return (
    <div style={surface(props)}>
      {(props.heading || props.subheading) && (
        <div style={{ marginBottom: 12 }}>
          {props.heading && (
            <div style={{ color: palette.DARK, fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>
              {props.heading}
            </div>
          )}
          {props.subheading && (
            <div style={{ color: palette.CREAM_DIM, fontSize: 14, marginTop: 6 }}>
              {props.subheading}
            </div>
          )}
        </div>
      )}
      <div
        style={{
          border: `1px solid ${border}`,
          borderRadius: props.radius ?? 8,
          padding: "4px 16px",
        }}
      >
        {files.length === 0 ? (
          <div style={{ color: palette.CREAM_DIM, fontSize: 14, padding: "10px 0" }}>
            {emptyText}
          </div>
        ) : (
          <table width="100%" style={{ borderCollapse: "collapse" }}>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  {props.showIcon !== false && (
                    <td width="46" style={cell}>
                      <span
                        style={{
                          display: "inline-block",
                          minWidth: 38,
                          padding: "3px 6px",
                          borderRadius: 6,
                          backgroundColor: "#f1e8dc",
                          color: accent,
                          fontSize: 11,
                          fontWeight: 700,
                          textAlign: "center",
                        }}
                      >
                        {FILE_KIND_LABELS[fileKind(file.name || file.url, file.mimeType)]}
                      </span>
                    </td>
                  )}
                  <td style={cell}>
                    <div
                      style={{
                        color: palette.DARK,
                        fontSize: 14,
                        fontWeight: 600,
                        wordBreak: "break-word",
                      }}
                    >
                      {file.name || "archivo"}
                    </div>
                    {props.showSize !== false && formatBytes(file.size) && (
                      <div style={{ color: palette.CREAM_DIM, fontSize: 12, marginTop: 2 }}>
                        {formatBytes(file.size)}
                      </div>
                    )}
                  </td>
                  <td align="right" style={{ ...cell, whiteSpace: "nowrap" }}>
                    {download(props.buttonLabel || "Descargar")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export const EditableBlockRenderer = ({ block }: Props) => {
  const config = useEmailBuilderConfig()
  const updateBlockProps = useEmailBuilderStore((s) => s.updateBlockProps)
  const palette = config.palette
  const labels = config.labels
  const view = getBlockView(block.type)

  if (!view?.Editable) return null

  const Editable = view.Editable
  const set = (patch: Record<string, unknown>) => {
    updateBlockProps(block.id, { ...block.props, ...patch })
  }

  return (
    <Editable
      block={block}
      props={block.props}
      set={set}
      palette={palette}
      labels={labels}
    />
  )
}
