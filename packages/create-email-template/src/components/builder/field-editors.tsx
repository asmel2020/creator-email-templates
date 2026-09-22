"use client"

// Campos de propiedades reutilizables del panel (schema-driven).
// El panel resuelve BlockFieldDef → estos editores; el registro de vistas
// define la lista por tipo de bloque.
import React, { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImageUp, Loader2, MousePointerClick, Plus, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useEmailBuilderConfig } from "../../store/email-builder-provider"
import { newId } from "../../core/id"
import { InlineTextEditor } from "./inline-text-editor"
import type { BlockFieldDef } from "../../block-views"
import type { EmailBuilderLabels } from "../../config/types"

export const Field = ({
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

export const InlineHint = ({ text }: { text: string }) => (
  <p className="ter-flex ter-items-center ter-gap-1.5 ter-rounded-md ter-border ter-border-dashed ter-border-border ter-bg-muted/40 ter-px-3 ter-py-2 ter-text-xs ter-text-muted-foreground">
    <MousePointerClick className="ter-h-3.5 ter-w-3.5 ter-shrink-0" />
    {text}
  </p>
)

export const TextEdit = ({
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

export const AlignEdit = ({
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

export const ColorEdit = ({
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

export const ImageEdit = ({
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

export interface FieldsRendererProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any
  set: (patch: Record<string, unknown>) => void
  labels: EmailBuilderLabels
  fields: BlockFieldDef[]
}

/** Resuelve un schema de campos a controles concretos. */
export const FieldsRenderer = ({
  props,
  set,
  labels,
  fields,
}: FieldsRendererProps) => (
  <>
    {fields.map((field, i) => {
      switch (field.kind) {
        case "text":
          return (
            <TextEdit
              key={i}
              label={field.label}
              value={String(props[field.key] ?? "")}
              onChange={(v) => set({ [field.key]: v })}
            />
          )
        case "richText":
          return (
            <Field key={i} label={field.label}>
              <InlineTextEditor
                rich
                value={String(props[field.key] ?? "")}
                onChange={(v) => set({ [field.key]: v })}
                placeholder={field.placeholder}
                style={{ color: "#8a8175", fontSize: 12, minHeight: 18 }}
              />
            </Field>
          )
        case "number":
          return (
            <Field key={i} label={field.label}>
              <Input
                type="number"
                min={field.min}
                value={props[field.key] ?? field.default ?? 0}
                onChange={(e) => set({ [field.key]: Number(e.target.value) })}
              />
            </Field>
          )
        case "color":
          return (
            <Field key={i} label={field.label}>
              <ColorEdit
                value={String(props[field.key] ?? field.fallback ?? "#ffffff")}
                onChange={(v) => set({ [field.key]: v })}
              />
            </Field>
          )
        case "align":
          return (
            <Field key={i} label={field.label}>
              <AlignEdit
                value={props[field.key] || "left"}
                onChange={(v) => set({ [field.key]: v })}
              />
            </Field>
          )
        case "select":
          return (
            <Field key={i} label={field.label}>
              <select
                value={String(
                  props[field.key] ?? field.options[0]?.value ?? "",
                )}
                onChange={(e) => {
                  const opt = field.options.find(
                    (o) => String(o.value) === e.target.value,
                  )
                  set({ [field.key]: opt ? opt.value : e.target.value })
                }}
                className="ter-h-9 ter-w-full ter-rounded-md ter-border ter-border-border ter-bg-transparent ter-px-3 ter-text-sm"
              >
                {field.options.map((o) => (
                  <option key={String(o.value)} value={String(o.value)}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          )
        case "preset": {
          const current = String(
            props[field.key] ?? field.options[0]?.value ?? "",
          )
          return (
            <Field key={i} label={field.label}>
              <select
                value={current}
                onChange={(e) => {
                  const opt = field.options.find(
                    (o) => o.value === e.target.value,
                  )
                  set({
                    [field.key]: e.target.value,
                    ...(opt ? opt.build() : {}),
                  })
                }}
                className="ter-h-9 ter-w-full ter-rounded-md ter-border ter-border-border ter-bg-transparent ter-px-3 ter-text-sm"
              >
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          )
        }
        case "layout": {
          const current = String(
            props[field.key] ?? field.options[0]?.value ?? "",
          )
          const reshape = (widths: number[]) => {
            const existing = Array.isArray(props.columns)
              ? (props.columns as { id: string }[])
              : []
            return widths.map((w, j) =>
              existing[j]
                ? { ...existing[j], width: w }
                : { id: newId(), width: w, blocks: [] },
            )
          }
          return (
            <Field key={i} label={field.label}>
              <select
                value={current}
                onChange={(e) => {
                  const opt = field.options.find(
                    (o) => o.value === e.target.value,
                  )
                  set({
                    [field.key]: e.target.value,
                    columns: reshape(opt?.widths ?? []),
                  })
                }}
                className="ter-h-9 ter-w-full ter-rounded-md ter-border ter-border-border ter-bg-transparent ter-px-3 ter-text-sm"
              >
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          )
        }
        case "image":
          return (
            <ImageEdit
              key={i}
              value={String(props[field.key] ?? "")}
              onChange={(v) => set({ [field.key]: v })}
            />
          )
        case "icons":
          return (
            <Field key={i} label={field.label}>
              <div className="ter-flex ter-flex-wrap ter-gap-1.5">
                {field.options.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    className={`ter-flex ter-h-8 ter-w-8 ter-items-center ter-justify-center ter-rounded-md ter-border ter-text-base ter-transition-colors ${
                      (props[field.key] || "✓") === ic
                        ? "ter-border-[#d7b227] ter-bg-[#d7b227]/10 ter-text-[#a98a1e]"
                        : "ter-border-border ter-text-muted-foreground ter-hover:border-primary"
                    }`}
                    onClick={() => set({ [field.key]: ic })}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </Field>
          )
        case "hint":
          return <InlineHint key={i} text={String(labels[field.labelKey])} />
        case "row":
          return (
            <div key={i} className="ter-grid ter-grid-cols-2 ter-gap-3">
              <FieldsRenderer
                props={props}
                set={set}
                labels={labels}
                fields={[field.fields[0]]}
              />
              {field.fields[1] ? (
                <FieldsRenderer
                  props={props}
                  set={set}
                  labels={labels}
                  fields={[field.fields[1]]}
                />
              ) : null}
            </div>
          )
        case "group": {
          if (field.visibleWhen) {
            const current = props[field.visibleWhen.key]
            const expected = field.visibleWhen.equals
            const visible = Array.isArray(expected)
              ? expected.includes(current)
              : current === expected
            if (!visible) return null
          }
          return (
            <div
              key={i}
              className="ter-space-y-3 ter-rounded-lg ter-border ter-border-border ter-bg-muted/20 ter-p-3"
            >
              <p className="ter-text-xs ter-font-semibold ter-text-muted-foreground ter-uppercase">
                {field.label}
              </p>
              <FieldsRenderer
                props={props}
                set={set}
                labels={labels}
                fields={field.fields}
              />
            </div>
          )
        }
        case "stringList": {
          const items = Array.isArray(props[field.key])
            ? (props[field.key] as string[])
            : []
          const update = (next: string[]) => set({ [field.key]: next })
          return (
            <Field key={i} label={field.label}>
              <div className="ter-grid ter-gap-2">
                {items.map((item, j) => (
                  <div key={j} className="ter-flex ter-items-center ter-gap-1.5">
                    <Input
                      value={item}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        update(
                          items.map((v, k) => (k === j ? e.target.value : v)),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title={labels.delete}
                      onClick={() => update(items.filter((_, k) => k !== j))}
                    >
                      <Trash2 className="ter-h-4 ter-w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => update([...items, ""])}
                >
                  <Plus className="ter-mr-1.5 ter-h-4 ter-w-4" />
                  {labels.addListItem}
                </Button>
              </div>
            </Field>
          )
        }
        case "repeat": {
          const items = Array.isArray(props[field.key])
            ? (props[field.key] as Record<string, unknown>[])
            : []
          const update = (next: Record<string, unknown>[]) =>
            set({ [field.key]: next })
          const defaults = (): Record<string, unknown> =>
            Object.fromEntries(
              field.fields
                .filter(
                  (f): f is Extract<BlockFieldDef, { key: string }> =>
                    "key" in f,
                )
                .map((f) => [
                  f.key,
                  "default" in f ? (f.default ?? "") : "",
                ]),
            )
          return (
            <div key={i} className="ter-grid ter-gap-2">
              <Label className="ter-text-xs ter-font-semibold ter-text-muted-foreground ter-uppercase">
                {field.label}
              </Label>
              {items.map((item, j) => (
                <div
                  key={j}
                  className="ter-grid ter-gap-2 ter-rounded-lg ter-border ter-border-border ter-p-2.5"
                >
                  <div className="ter-flex ter-items-center ter-justify-between">
                    <span className="ter-text-[11px] ter-font-semibold ter-text-muted-foreground">
                      {field.itemLabel} {j + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title={labels.delete}
                      onClick={() => update(items.filter((_, k) => k !== j))}
                    >
                      <Trash2 className="ter-h-4 ter-w-4" />
                    </Button>
                  </div>
                  <FieldsRenderer
                    props={item}
                    set={(patch) =>
                      update(
                        items.map((it, k) => (k === j ? { ...it, ...patch } : it)),
                      )
                    }
                    labels={labels}
                    fields={field.fields}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => update([...items, { id: newId(), ...defaults() }])}
              >
                <Plus className="ter-mr-1.5 ter-h-4 ter-w-4" />
                {labels.addListItem}
              </Button>
            </div>
          )
        }
        case "custom":
          return null
        default:
          return null
      }
    })}
  </>
)
