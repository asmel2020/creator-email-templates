"use client"

import React, { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { type EmailBlock, LIST_ICONS } from "../../core/types"
import {
  useEmailBuilderConfig,
  useEmailBuilderStore,
} from "../../store/email-builder-provider"
import { InlineTextEditor } from "./inline-text-editor"
import { ImageUp, Loader2, MousePointerClick } from "lucide-react"
import { toast } from "react-hot-toast"

const Field = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="ter-grid ter-gap-1.5">
    <Label className="ter-text-xs ter-font-semibold ter-text-muted-foreground ter-uppercase">
      {label}
    </Label>
    {children}
  </div>
)

const InlineHint = ({ text }: { text: string }) => (
  <p className="ter-flex ter-items-center ter-gap-1.5 ter-rounded-md ter-border ter-border-dashed ter-border-border ter-bg-muted/40 ter-px-3 ter-py-2 ter-text-xs ter-text-muted-foreground">
    <MousePointerClick className="ter-h-3.5 ter-w-3.5 ter-shrink-0" />
    {text}
  </p>
)

const TextEdit = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) => (
  <div className="ter-grid ter-gap-1.5">
    <Label className="ter-text-xs ter-font-semibold ter-text-muted-foreground ter-uppercase">
      {label}
    </Label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
)

const AlignEdit = ({
  value,
  onChange,
}: {
  value: string
  onChange: (v: "left" | "center" | "right") => void
}) => (
  <div className="ter-flex ter-gap-1">
    {(["left", "center", "right"] as const).map((a) => (
      <Button
        key={a}
        type="button"
        size="sm"
        variant={value === a ? "default" : "outline"}
        className="ter-flex-1 ter-capitalize"
        onClick={() => onChange(a)}
      >
        {a}
      </Button>
    ))}
  </div>
)

const ColorEdit = ({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) => (
  <div className="ter-flex ter-items-center ter-gap-2">
    <Input
      type="color"
      className="ter-h-8 ter-w-10 ter-p-0"
      value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
      onChange={(e) => onChange(e.target.value)}
    />
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="ter-h-8 ter-font-mono"
    />
  </div>
)

const ImageEdit = ({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) => {
  const config = useEmailBuilderConfig()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    try {
      setUploading(true)
      const upload = config.uploadImage
      if (upload) {
        const url = await upload(file)
        onChange(url)
        toast.success(config.labels.imageUploaded)
      } else {
        // Fallback local (solo útil en desarrollo): los consumidores
        // deberían proporcionar `uploadImage` para persistir en R2 o similar.
        onChange(URL.createObjectURL(file))
        toast.success(config.labels.imageUploaded)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : undefined
      toast.error(message || config.labels.imageUploadError)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div className="ter-grid ter-gap-1.5">
      <Label className="ter-text-xs ter-font-semibold ter-text-muted-foreground ter-uppercase">
        {config.labels.uploadImage}
      </Label>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="ter-hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="ter-mr-2 ter-h-4 ter-w-4 ter-animate-spin" />
        ) : (
          <ImageUp className="ter-mr-2 ter-h-4 ter-w-4" />
        )}
        {uploading
          ? config.labels.uploading
          : value
            ? config.labels.replaceImage
            : config.labels.uploadImage}
      </Button>
      {value && (
        <img
          src={value}
          alt="preview"
          className="ter-mt-1 ter-max-h-40 ter-w-full ter-rounded-lg ter-border ter-border-border ter-object-cover"
        />
      )}
    </div>
  )
}

interface Props {
  block: EmailBlock
}

const RICH_INLINE_BLOCKS = [
  "text",
  "heading",
  "hero",
  "quote",
  "list",
  "columns",
  "footer",
] as const

export const PropertiesPanel = ({ block }: Props) => {
  const config = useEmailBuilderConfig()
  const updateBlockProps = useEmailBuilderStore((s) => s.updateBlockProps)
  const labels = config.labels

  const set = (patch: Record<string, unknown>) => {
    updateBlockProps(block.id, { ...block.props, ...patch })
  }

  const type = block.type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = block.props as any
  const def = config.blockMap[type]

  return (
    <div className="ter-space-y-4">
      <div>
        <h3 className="ter-text-sm ter-font-bold">{def.label}</h3>
        <p className="ter-text-xs ter-text-muted-foreground">{def.description}</p>
      </div>

      {(RICH_INLINE_BLOCKS as readonly string[]).includes(type) && (
        <InlineHint text={labels.editInlineHint} />
      )}

      {type === "header" && (
        <>
          <TextEdit
            label={labels.logoUrl}
            value={props.logoUrl || ""}
            onChange={(v) => set({ logoUrl: v })}
          />
          <Field label={labels.align}>
            <AlignEdit
              value={props.align}
              onChange={(v) => set({ align: v })}
            />
          </Field>
          <Field label={labels.backgroundColor}>
            <ColorEdit
              value={props.backgroundColor}
              onChange={(v) => set({ backgroundColor: v })}
            />
          </Field>
        </>
      )}

      {type === "hero" && (
        <>
          <Field label={labels.backgroundColor}>
            <ColorEdit
              value={props.backgroundColor || "#ffffff"}
              onChange={(v) => set({ backgroundColor: v })}
            />
          </Field>
          <Field label={labels.align}>
            <AlignEdit
              value={props.align}
              onChange={(v) => set({ align: v })}
            />
          </Field>
        </>
      )}

      {type === "heading" && (
        <>
          <Field label={labels.backgroundColor}>
            <ColorEdit
              value={props.backgroundColor || "#ffffff"}
              onChange={(v) => set({ backgroundColor: v })}
            />
          </Field>
          <Field label={labels.align}>
            <AlignEdit
              value={props.align}
              onChange={(v) => set({ align: v })}
            />
          </Field>
        </>
      )}

      {type === "text" && (
        <>
          <Field label={labels.backgroundColor}>
            <ColorEdit
              value={props.backgroundColor || "#ffffff"}
              onChange={(v) => set({ backgroundColor: v })}
            />
          </Field>
          <Field label={labels.align}>
            <AlignEdit
              value={props.align}
              onChange={(v) => set({ align: v })}
            />
          </Field>
        </>
      )}

      {type === "list" && (
        <>
          <Field label={labels.icon}>
            <div className="ter-flex ter-flex-wrap ter-gap-1.5">
              {LIST_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  className={`ter-flex ter-h-8 ter-w-8 ter-items-center ter-justify-center ter-rounded-md ter-border ter-text-base ter-transition-colors ${
                    (props.icon || "✓") === ic
                      ? "ter-border-[#d7b227] ter-bg-[#d7b227]/10 ter-text-[#a98a1e]"
                      : "ter-border-border ter-text-muted-foreground ter-hover:border-primary"
                  }`}
                  onClick={() => set({ icon: ic })}
                >
                  {ic}
                </button>
              ))}
            </div>
          </Field>
          <Field label={labels.backgroundColor}>
            <ColorEdit
              value={props.backgroundColor || "#ffffff"}
              onChange={(v) => set({ backgroundColor: v })}
            />
          </Field>
          <p className="ter-text-xs ter-text-muted-foreground">{labels.listEditHint}</p>
        </>
      )}

      {type === "button" && (
        <>
          <TextEdit
            label={labels.buttonLabel}
            value={props.label}
            onChange={(v) => set({ label: v })}
          />
          <TextEdit
            label={labels.buttonHref}
            value={props.href}
            onChange={(v) => set({ href: v })}
          />
          <Field label={labels.backgroundColor}>
            <ColorEdit
              value={props.blockBackgroundColor || "#ffffff"}
              onChange={(v) => set({ blockBackgroundColor: v })}
            />
          </Field>
          <Field label={labels.buttonBackground}>
            <ColorEdit
              value={props.backgroundColor}
              onChange={(v) => set({ backgroundColor: v })}
            />
          </Field>
          <Field label={labels.buttonColor}>
            <ColorEdit
              value={props.color}
              onChange={(v) => set({ color: v })}
            />
          </Field>
          <Field label={labels.align}>
            <AlignEdit
              value={props.align}
              onChange={(v) => set({ align: v })}
            />
          </Field>
        </>
      )}

      {type === "image" && (
        <>
          <ImageEdit value={props.src} onChange={(v) => set({ src: v })} />
          <TextEdit
            label={labels.imageAlt}
            value={props.alt || ""}
            onChange={(v) => set({ alt: v })}
          />
          <TextEdit
            label={labels.imageHref}
            value={props.href || ""}
            onChange={(v) => set({ href: v })}
          />
          <Field label={labels.imageWidth}>
            <Input
              type="number"
              value={props.width}
              onChange={(e) => set({ width: Number(e.target.value) })}
            />
          </Field>
          <Field label={labels.align}>
            <AlignEdit
              value={props.align}
              onChange={(v) => set({ align: v })}
            />
          </Field>
          <Field label={labels.backgroundColor}>
            <ColorEdit
              value={props.backgroundColor || "#ffffff"}
              onChange={(v) => set({ backgroundColor: v })}
            />
          </Field>
        </>
      )}

      {type === "quote" && (
        <>
          <Field label={labels.quoteAuthor}>
            <InlineTextEditor
              rich
              value={props.author || ""}
              onChange={(v) => set({ author: v })}
              style={{ color: "#8a8175", fontSize: 12, minHeight: 18 }}
            />
          </Field>
          <Field label={labels.quoteBorderColor}>
            <ColorEdit
              value={props.borderColor || "#d7b227"}
              onChange={(v) => set({ borderColor: v })}
            />
          </Field>
          <div className="ter-grid ter-grid-cols-2 ter-gap-3">
            <Field label={labels.quoteMarginLeft}>
              <Input
                type="number"
                min={0}
                value={props.marginLeft ?? 0}
                onChange={(e) => set({ marginLeft: Number(e.target.value) })}
              />
            </Field>
            <Field label={labels.quotePaddingY}>
              <Input
                type="number"
                value={props.paddingY ?? 16}
                onChange={(e) => set({ paddingY: Number(e.target.value) })}
              />
            </Field>
          </div>
          <div className="ter-grid ter-grid-cols-2 ter-gap-3">
            <Field label={labels.quotePaddingX}>
              <Input
                type="number"
                value={props.paddingX ?? 32}
                onChange={(e) => set({ paddingX: Number(e.target.value) })}
              />
            </Field>
            <Field label={labels.quoteBorderWidth}>
              <Input
                type="number"
                min={1}
                value={props.borderWidth ?? 3}
                onChange={(e) => set({ borderWidth: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label={labels.backgroundColor}>
            <ColorEdit
              value={props.backgroundColor || "#ffffff"}
              onChange={(v) => set({ backgroundColor: v })}
            />
          </Field>
        </>
      )}

      {type === "columns" && (
        <>
          <Field label={labels.backgroundColor}>
            <ColorEdit
              value={props.backgroundColor || "#ffffff"}
              onChange={(v) => set({ backgroundColor: v })}
            />
          </Field>
          <p className="ter-text-xs ter-text-muted-foreground">
            {labels.columnsEditHint}
          </p>
        </>
      )}

      {type === "divider" && (
        <>
          <Field label={labels.dividerColor}>
            <ColorEdit
              value={props.color}
              onChange={(v) => set({ color: v })}
            />
          </Field>
          <Field label={labels.dividerHeight}>
            <Input
              type="number"
              min={0}
              value={props.height ?? 8}
              onChange={(e) => set({ height: Number(e.target.value) })}
            />
          </Field>
          <Field label={labels.backgroundColor}>
            <ColorEdit
              value={props.backgroundColor || "#ffffff"}
              onChange={(v) => set({ backgroundColor: v })}
            />
          </Field>
        </>
      )}

      {type === "spacer" && (
        <>
          <Field label={labels.spacerHeight}>
            <Input
              type="number"
              value={props.height}
              onChange={(e) => set({ height: Number(e.target.value) })}
            />
          </Field>
          <Field label={labels.backgroundColor}>
            <ColorEdit
              value={props.backgroundColor || "#ffffff"}
              onChange={(v) => set({ backgroundColor: v })}
            />
          </Field>
        </>
      )}

      {type === "footer" && (
        <>
          <Field label={labels.backgroundColor}>
            <ColorEdit
              value={props.backgroundColor || "#0d0b08"}
              onChange={(v) => set({ backgroundColor: v })}
            />
          </Field>
        </>
      )}
    </div>
  )
}
