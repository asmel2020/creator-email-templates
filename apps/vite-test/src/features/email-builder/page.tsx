import { EyeIcon } from "lucide-react"
import { EmailBuilder, EmailBuilderProvider } from "@repo/create-email-template"
import { Button } from "@/components/ui/button"
import {
  SAMPLE_EMAIL_BUILDER_CONFIG,
  onSaveDemo,
  uploadImageDemo,
} from "./config"
import { useEmailBuilderDialogsStore } from "./stores/use-email-builder-dialogs"
import { EmailBuilderDialogs } from "./components/dialogs"
import { AutosaveIndicator } from "./components/autosave-indicator"

export default function EmailBuilderPage() {
  const setOpen = useEmailBuilderDialogsStore((s) => s.setOpen)

  return (
    <EmailBuilderProvider
      config={SAMPLE_EMAIL_BUILDER_CONFIG}
      uploadImage={uploadImageDemo}
      autosave={{
        intervalMs: 10_000,
        onSave: onSaveDemo,
        onSaved: (result) => {
          if (!result.ok) console.error("[autosave] error:", result.error)
        },
      }}
    >
      <div className="flex min-h-svh flex-col">
        <header className="flex items-center justify-between gap-4 border-b px-4 py-2">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-heading text-base font-medium">
                Email Builder
              </h1>
              <p className="text-xs text-muted-foreground">
                Edita la plantilla y compara los renders desde la vista previa
              </p>
            </div>
            <AutosaveIndicator />
          </div>
          <Button size="sm" onClick={() => setOpen("preview")}>
            <EyeIcon data-slot="icon" />
            Vista previa
          </Button>
        </header>

        <EmailBuilder />

        <EmailBuilderDialogs />
      </div>
    </EmailBuilderProvider>
  )
}
