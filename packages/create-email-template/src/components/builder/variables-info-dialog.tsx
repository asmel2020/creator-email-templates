"use client"

import { useState } from "react"
import { ChevronDown, Copy, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEmailBuilderConfig } from "../../store/email-builder-provider"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SectionAccordion = ({
  id,
  title,
  description,
  variables,
  defaultOpen = false,
}: {
  id: string
  title: string
  description?: string
  variables: { key: string; label: string }[]
  defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = async (key: string) => {
    const text = `{${key}}`
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    } catch {
      // fallback
      const el = document.createElement("textarea")
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    }
  }

  return (
    <div className="ter-rounded-lg ter-border ter-bg-card ter-overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ter-flex ter-w-full ter-items-center ter-justify-between ter-gap-2 ter-bg-muted/30 ter-px-3 ter-py-2.5 ter-text-left ter-transition-colors hover:ter-bg-muted/50"
        aria-expanded={open}
        aria-controls={`ter-var-section-${id}`}
      >
        <div className="ter-flex ter-items-center ter-gap-2">
          <h4 className="ter-text-xs ter-font-bold ter-text-foreground ter-uppercase">
            {title}
          </h4>
          <span className="ter-rounded-full ter-bg-muted ter-px-1.5 ter-py-0.5 ter-text-[10px] ter-font-semibold ter-text-muted-foreground">
            {variables.length}
          </span>
        </div>
        <ChevronDown
          className={`ter-h-3.5 ter-w-3.5 ter-text-muted-foreground ter-transition-all ${open ? "ter-rotate-180" : ""}`}
        />
      </button>
      {description && open && (
        <p className="ter-px-3 ter-pt-2 ter-text-xs ter-text-muted-foreground">
          {description}
        </p>
      )}
      <div
        id={`ter-var-section-${id}`}
        className={`ter-grid ter-transition-all ${open ? "ter-grid-rows-[1fr] ter-opacity-100" : "ter-grid-rows-[0fr] ter-opacity-0"}`}
      >
        <div className="ter-overflow-hidden">
          <div className="ter-grid ter-gap-1.5 ter-p-3 ter-pt-2">
            {variables.map((v) => {
              const isCopied = copiedKey === v.key
              return (
                <div
                  key={v.key}
                  className="ter-flex ter-items-center ter-justify-between ter-gap-2 ter-rounded-md ter-border ter-bg-muted/40 ter-px-3 ter-py-1.5"
                >
                  <span className="ter-font-mono ter-text-xs ter-text-foreground ter-select-all">
                    {`{${v.key}}`}
                  </span>
                  <div className="ter-flex ter-items-center ter-gap-2 ter-shrink-0">
                    <span className="ter-text-xs ter-text-muted-foreground ter-hidden sm:ter-inline">
                      {v.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(v.key)}
                      className="ter-inline-flex ter-h-6 ter-w-6 ter-items-center ter-justify-center ter-text-muted-foreground hover:ter-text-foreground ter-transition-colors"
                      title={`Copiar {${v.key}}`}
                      aria-label={`Copiar ${v.key}`}
                    >
                      {isCopied ? (
                        <Check className="ter-h-3.5 ter-w-3.5 ter-text-green-600" />
                      ) : (
                        <Copy className="ter-h-3.5 ter-w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export const VariablesInfoDialog = ({ open, onOpenChange }: Props) => {
  const config = useEmailBuilderConfig()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ter-max-w-md ter-bg-popover ter-border ter-shadow-xl ter-max-h-[85vh] ter-flex ter-flex-col ter-overflow-hidden">
        <DialogHeader className="ter-shrink-0">
          <DialogTitle>{config.labels.variablesInfoTitle}</DialogTitle>
          <DialogDescription>
            {config.labels.variablesInfoDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="ter-flex-1 ter-min-h-0 ter-space-y-3 ter-overflow-y-auto ter-pr-1 ter-pb-1">
          {config.variableSections.map((section, idx) => (
            <SectionAccordion
              key={section.id}
              id={section.id}
              title={section.title}
              description={section.description}
              variables={section.variables}
              defaultOpen={idx === 0}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
