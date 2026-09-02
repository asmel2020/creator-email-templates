import { useEffect, useState } from "react"
import {
  useEmailBuilderConfig,
  useEmailBuilderStoreInstance,
  useRenderEmail,
} from "@repo/create-email-template"
import { renderEmailHtml as renderServerEmailHtml } from "@repo/create-email-renderer/html-render"
import { SAMPLE_CONTEXT } from "@repo/create-email-renderer/variables"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Dialog controlado (sin DialogTrigger): compara en vivo el HTML del render
 * de React (react-email, preview del editor) contra el del renderer puro
 * que usa el backend (@repo/create-email-renderer).
 */
export function PreviewDialog({ open, onOpenChange }: PreviewDialogProps) {
  const store = useEmailBuilderStoreInstance()
  const config = useEmailBuilderConfig()
  const { renderHtml } = useRenderEmail()

  const [reactHtml, setReactHtml] = useState<string | null>(null)
  const [serverHtml, setServerHtml] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(true)

  useEffect(() => {
    let cancelled = false
    const payload = store.getState().getPayload()
    const subject = "Vista previa del correo"
    const context = { ...SAMPLE_CONTEXT, ...config.sampleContext }

    setIsPending(true)
    Promise.all([
      renderHtml({ subject, context }),
      renderServerEmailHtml({
        blocks: payload.content,
        subject,
        context,
        settings: payload.settings,
        palette: config.palette,
      }),
    ])
      .then(([reactHtml, serverHtml]) => {
        if (cancelled) return
        setReactHtml(reactHtml)
        setServerHtml(serverHtml)
      })
      .finally(() => {
        if (!cancelled) setIsPending(false)
      })
    return () => {
      cancelled = true
    }
  }, [store, config, renderHtml])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85svh] flex-col sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Vista previa del correo</DialogTitle>
          <DialogDescription>
            Compara el render de React (preview del editor) con el HTML que
            genera el renderer del backend sin React.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2">
          <div className="flex min-h-0 flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Render React (react-email)
            </span>
            <iframe
              title="Render React (react-email)"
              srcDoc={reactHtml ?? ""}
              sandbox=""
              className="h-full w-full flex-1 rounded-lg border bg-white"
            />
          </div>
          <div className="flex min-h-0 flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Render Server (create-email-renderer)
            </span>
            <iframe
              title="Render Server (create-email-renderer)"
              srcDoc={serverHtml ?? ""}
              sandbox=""
              className="h-full w-full flex-1 rounded-lg border bg-white"
            />
          </div>
        </div>

        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-popover/70">
            <span className="text-sm text-muted-foreground">
              Renderizando…
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
