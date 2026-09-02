import { useEmailBuilderDialogsStore } from "../stores/use-email-builder-dialogs"
import { PreviewDialog } from "./preview-dialog"

/** Orquestador: revisa el store y renderiza el dialog activo. */
export const EmailBuilderDialogs = () => {
  const { open, setOpen } = useEmailBuilderDialogsStore()

  const handleClose = () => setOpen(null)

  return (
    <>
      {open === "preview" && (
        <PreviewDialog open={open === "preview"} onOpenChange={handleClose} />
      )}
    </>
  )
}
