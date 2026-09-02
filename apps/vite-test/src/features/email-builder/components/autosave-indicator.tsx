import { CloudUploadIcon, CloudCheckIcon, CloudAlertIcon } from "lucide-react"
import { useAutosaveStatus } from "create-email-template"

/** Indicador del autoguardado: usa `useAutosaveStatus()` de la librería. */
export function AutosaveIndicator() {
  const { isSaving, lastSavedAt, lastError } = useAutosaveStatus()

  if (isSaving) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CloudUploadIcon className="size-4 animate-pulse" />
        Guardando…
      </span>
    )
  }

  if (lastError) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <CloudAlertIcon className="size-4" />
        Error al guardar
      </span>
    )
  }

  if (lastSavedAt) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CloudCheckIcon className="size-4 text-emerald-600" />
        Guardado a las{" "}
        {lastSavedAt.toLocaleTimeString("es", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>
    )
  }

  return (
    <span className="text-xs text-muted-foreground">
      Autoguardado cada 10s
    </span>
  )
}
