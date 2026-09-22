"use client"

// Ajustes globales del correo: tipografía, fondo, bordes y archivos.
// Antes vivía en un popover del lienzo; con la lista de archivos ya no cabía.
import { useRef, useState } from "react"
import {
  Check,
  Copy,
  Link2,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  useEmailBuilderConfig,
  useEmailBuilderStore,
} from "../../store/email-builder-provider"
import { newId } from "../../core/id"
import { isSafeFileUrl } from "../../core/richtext"
import {
  FILE_KIND_LABELS,
  FONT_STACKS,
  fileKind,
  formatBytes,
} from "../../core/types"
import type { EmailFileAttachment } from "../../core/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** `accept` del input (".pdf,image/*") contra un `File`. */
const isAccepted = (file: File, accept: string): boolean => {
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
  if (tokens.length === 0) return true
  const name = file.name.toLowerCase()
  const type = (file.type || "").toLowerCase()
  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token)
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1))
    return type === token
  })
}

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="ter-grid ter-grid-cols-1 ter-gap-2.5">
    <span className="ter-text-xs ter-font-semibold ter-text-muted-foreground ter-uppercase">
      {title}
    </span>
    {children}
  </div>
)

/** Interruptor compacto por archivo (Adjuntar / Enlace). */
const FileToggle = ({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
}) => (
  <button
    type="button"
    title={label}
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      "ter-inline-flex ter-items-center ter-gap-1 ter-rounded ter-border ter-px-2 ter-py-1 ter-text-[10px] ter-font-semibold ter-transition-colors ter-cursor-pointer",
      active
        ? "ter-border-[#d7b227] ter-bg-[#d7b227]/15 ter-text-[#a98a1e]"
        : "ter-border-border ter-text-muted-foreground ter-hover:text-foreground",
    )}
  >
    <Icon className="ter-h-3.5 ter-w-3.5" />
    {label}
  </button>
)

export const SettingsDialog = ({ open, onOpenChange }: Props) => {
  const config = useEmailBuilderConfig()
  const pageBackground = useEmailBuilderStore((s) => s.settings.pageBackground)
  const cardBorderWidth = useEmailBuilderStore((s) => s.settings.cardBorderWidth)
  const cardBorderRadius = useEmailBuilderStore(
    (s) => s.settings.cardBorderRadius,
  )
  const fontFamily = useEmailBuilderStore((s) => s.settings.fontFamily)
  const settingsFiles = useEmailBuilderStore((s) => s.settings.files)
  const setSettings = useEmailBuilderStore((s) => s.setSettings)

  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const files = settingsFiles ?? []
  const limits = config.files
  const maxBytes = Math.max(0, limits.maxSizeMb) * 1024 * 1024
  const attachedBytes = files.reduce(
    (total, file) => (file.attach ? total + (file.size ?? 0) : total),
    0,
  )
  const warnTotal = attachedBytes > limits.warnTotalMb * 1024 * 1024

  const handleFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return
    const added: EmailFileAttachment[] = []
    setUploading(true)
    try {
      for (const file of Array.from(list)) {
        if (files.length + added.length >= limits.maxCount) {
          toast.error(`${config.labels.tooManyFiles} (${limits.maxCount})`)
          break
        }
        if (maxBytes > 0 && file.size > maxBytes) {
          toast.error(
            `${config.labels.fileTooLarge}: ${file.name} (${limits.maxSizeMb} MB)`,
          )
          continue
        }
        if (!isAccepted(file, limits.accept)) {
          toast.error(`${config.labels.fileTypeNotAllowed}: ${file.name}`)
          continue
        }
        try {
          // Sin `uploadFile` (demo/offline) el archivo no sale del navegador.
          const url = config.uploadFile
            ? await config.uploadFile(file)
            : URL.createObjectURL(file)
          added.push({
            id: newId(),
            url,
            name: file.name,
            size: file.size,
            mimeType: file.type,
            attach: false,
            link: true,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : undefined
          toast.error(message || config.labels.fileUploadError)
        }
      }
      if (added.length > 0) {
        setSettings({ files: [...files, ...added] })
        toast.success(config.labels.fileUploaded)
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const updateFile = (id: string, patch: Partial<EmailFileAttachment>) =>
    setSettings({
      files: files.map((file) =>
        file.id === id ? { ...file, ...patch } : file,
      ),
    })

  const removeFile = (id: string) =>
    setSettings({ files: files.filter((file) => file.id !== id) })

  const copyUrl = async (file: EmailFileAttachment) => {
    try {
      await navigator.clipboard.writeText(file.url)
    } catch {
      const el = document.createElement("textarea")
      el.value = file.url
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    setCopiedId(file.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ter-sm:max-w-2xl ter-bg-popover ter-border ter-shadow-xl ter-max-h-[85vh] ter-flex ter-flex-col ter-overflow-hidden">
        <DialogHeader className="ter-shrink-0">
          <DialogTitle>{config.labels.settings}</DialogTitle>
          <DialogDescription>{config.labels.settingsHint}</DialogDescription>
        </DialogHeader>

        <div className="ter-flex-1 ter-min-h-0 ter-overflow-y-auto ter-pr-1 ter-pb-1 ter-grid ter-grid-cols-1 ter-gap-4 ter-pt-5">
          <Section title={config.labels.fontFamily}>
            <select
              value={
                FONT_STACKS.some((f) => f.stack === fontFamily)
                  ? fontFamily
                  : "custom"
              }
              onChange={(e) => {
                // "custom" no cambia nada: se edita en el input de abajo.
                if (e.target.value === "custom") return
                setSettings({ fontFamily: e.target.value })
              }}
              className="ter-h-8 ter-w-full ter-rounded-md ter-border ter-border-border ter-bg-transparent ter-px-3 ter-text-sm"
            >
              {FONT_STACKS.map((f) => (
                <option key={f.value} value={f.stack}>
                  {f.label}
                </option>
              ))}
              <option value="custom">{config.labels.fontCustom}</option>
            </select>
            <Input
              value={fontFamily}
              placeholder="font-family: …"
              onChange={(e) => setSettings({ fontFamily: e.target.value })}
              className="ter-font-mono ter-text-xs"
            />
          </Section>

          <Section title={config.labels.pageBackground}>
            <div className="ter-flex ter-items-center ter-gap-2">
              <input
                type="color"
                value={
                  /^#[0-9a-fA-F]{6}$/.test(pageBackground)
                    ? pageBackground
                    : "#f5f1e8"
                }
                onChange={(e) =>
                  setSettings({ pageBackground: e.target.value })
                }
                className="ter-h-7 ter-w-9 ter-cursor-pointer ter-rounded ter-border-0 ter-bg-transparent ter-p-0"
              />
              <span className="ter-font-mono ter-text-xs ter-text-muted-foreground">
                {pageBackground}
              </span>
            </div>
          </Section>

          <div className="ter-grid ter-grid-cols-2 ter-gap-3">
            <div className="ter-grid ter-grid-cols-1 ter-gap-1.5">
              <Label className="ter-text-xs ter-font-semibold ter-text-muted-foreground ter-uppercase">
                {config.labels.cardBorderWidth}
              </Label>
              <Input
                type="number"
                min={0}
                max={10}
                value={cardBorderWidth}
                onChange={(e) =>
                  setSettings({ cardBorderWidth: Number(e.target.value) })
                }
              />
            </div>
            <div className="ter-grid ter-grid-cols-1 ter-gap-1.5">
              <Label className="ter-text-xs ter-font-semibold ter-text-muted-foreground ter-uppercase">
                {config.labels.cardBorderRadius}
              </Label>
              <Input
                type="number"
                min={0}
                max={40}
                value={cardBorderRadius}
                onChange={(e) =>
                  setSettings({ cardBorderRadius: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <Section title={config.labels.files}>
            <p className="ter-rounded-md ter-border ter-border-dashed ter-border-border ter-bg-muted/40 ter-px-3 ter-py-2 ter-text-xs ter-text-muted-foreground">
              {config.labels.filesHint}
            </p>

            <input
              ref={fileRef}
              type="file"
              multiple
              accept={limits.accept}
              className="ter-hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div className="ter-flex ter-items-center ter-gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading || files.length >= limits.maxCount}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="ter-mr-2 ter-h-4 ter-w-4 ter-animate-spin" />
                ) : (
                  <Upload className="ter-mr-2 ter-h-4 ter-w-4" />
                )}
                {uploading
                  ? config.labels.uploading
                  : config.labels.uploadFile}
              </Button>
              <span className="ter-text-xs ter-text-muted-foreground">
                {files.length}/{limits.maxCount} · {limits.maxSizeMb} MB
              </span>
            </div>

            {warnTotal && (
              <p className="ter-rounded-md ter-bg-[#d7b227]/10 ter-px-3 ter-py-2 ter-text-xs ter-text-[#a98a1e]">
                {config.labels.totalSizeWarning} ({formatBytes(attachedBytes)})
              </p>
            )}

            {files.length === 0 ? (
              <p className="ter-text-xs ter-text-muted-foreground">
                {config.labels.filesEmpty}
              </p>
            ) : (
              <div className="ter-grid ter-grid-cols-1 ter-gap-2">
                {files.map((file) => {
                  const kind = fileKind(file.name, file.mimeType)
                  const size = formatBytes(file.size)
                  return (
                    <div
                      key={file.id}
                      className="ter-grid ter-grid-cols-1 ter-gap-2 ter-rounded-lg ter-border ter-border-border ter-bg-card ter-p-2.5"
                    >
                      <div className="ter-flex ter-items-center ter-gap-2">
                        <span className="ter-inline-block ter-w-10 ter-shrink-0 ter-rounded ter-bg-muted ter-py-0.5 ter-text-center ter-text-[10px] ter-font-bold ter-text-[#a98a1e]">
                          {FILE_KIND_LABELS[kind]}
                        </span>
                        <Input
                          value={file.name}
                          onChange={(e) =>
                            updateFile(file.id, { name: e.target.value })
                          }
                          className="ter-h-8 ter-flex-1 ter-text-xs"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          title={config.labels.removeFile}
                          onClick={() => removeFile(file.id)}
                        >
                          <Trash2 className="ter-h-3.5 ter-w-3.5 ter-text-red-400" />
                        </Button>
                      </div>

                      <div className="ter-flex ter-flex-wrap ter-items-center ter-gap-1.5">
                        <FileToggle
                          active={file.attach === true}
                          label={config.labels.attachFile}
                          icon={Paperclip}
                          onClick={() =>
                            updateFile(file.id, { attach: !file.attach })
                          }
                        />
                        <FileToggle
                          active={file.link !== false}
                          label={config.labels.linkFile}
                          icon={Link2}
                          onClick={() =>
                            updateFile(file.id, {
                              link: file.link === false,
                            })
                          }
                        />
                        {size && (
                          <span className="ter-ml-auto ter-text-[10px] ter-text-muted-foreground">
                            {size}
                          </span>
                        )}
                      </div>

                      <div className="ter-flex ter-items-center ter-gap-1.5">
                        <span
                          title={file.url}
                          className="ter-min-w-0 ter-flex-1 ter-truncate ter-font-mono ter-text-[10px] ter-text-muted-foreground"
                        >
                          {file.url}
                        </span>
                        <button
                          type="button"
                          title={config.labels.copyFileUrl}
                          onClick={() => copyUrl(file)}
                          className="ter-inline-flex ter-h-6 ter-w-6 ter-shrink-0 ter-items-center ter-justify-center ter-text-muted-foreground ter-hover:text-foreground ter-transition-colors ter-cursor-pointer"
                        >
                          {copiedId === file.id ? (
                            <Check className="ter-h-3.5 ter-w-3.5 ter-text-[#a98a1e]" />
                          ) : (
                            <Copy className="ter-h-3.5 ter-w-3.5" />
                          )}
                        </button>
                      </div>

                      {!isSafeFileUrl(file.url) && (
                        <p className="ter-rounded ter-bg-[#d7b227]/10 ter-px-2 ter-py-1 ter-text-[10px] ter-text-[#a98a1e]">
                          {config.labels.fileNotPublic}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
