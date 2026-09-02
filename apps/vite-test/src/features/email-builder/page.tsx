import { EmailBuilder, EmailBuilderProvider } from "create-email-template"
import {
  SAMPLE_EMAIL_BUILDER_CONFIG,
  onSaveDemo,
  uploadImageDemo,
} from "./config"
import { EditorToolbar } from "./components/editor-toolbar"
import { EmailBuilderDialogs } from "./components/dialogs"

/**
 * Página de demostración: provider (config + uploadImage + autosave)
 * + toolbar con los hooks del sistema + builder + dialogs.
 */
export default function EmailBuilderPage() {
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
        <EditorToolbar />

        <EmailBuilder />

        <EmailBuilderDialogs />
      </div>
    </EmailBuilderProvider>
  )
}
