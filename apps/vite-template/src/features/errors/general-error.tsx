import { useState } from "react"
import { useNavigate, useRouter, type ErrorComponentProps } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronDown, ChevronUp, Home, RotateCcw, ServerCrash } from "lucide-react"

interface GeneralErrorProps extends Partial<ErrorComponentProps> {
  className?: string
}

export function GeneralError({ error, reset, className }: GeneralErrorProps = {}) {
  const navigate = useNavigate()
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Ocurrió un error inesperado en el servidor o en la aplicación."

  const errorStack = error instanceof Error ? error.stack : null

  const handleRetry = () => {
    if (reset) {
      reset()
    } else {
      window.location.reload()
    }
  }

  return (
    <div
      className={`flex min-h-svh flex-col items-center justify-center bg-background p-6 text-foreground md:p-10 ${className || ""}`}
    >
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        {/* Icon & Glow */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full bg-destructive/15 blur-xl dark:bg-destructive/25" />
          <div className="relative flex size-20 items-center justify-center rounded-2xl border border-destructive/20 bg-card shadow-sm">
            <ServerCrash className="size-10 text-destructive" />
          </div>
        </div>

        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-destructive">
          Error 500
        </span>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Error interno del servidor
        </h1>

        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          Ha ocurrido un problema inesperado de nuestro lado. Nuestro equipo ha sido notificado e intentaremos solucionarlo lo antes posible.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="default"
            className="w-full sm:w-auto"
            onClick={handleRetry}
          >
            <RotateCcw className="mr-2 size-4" />
            Reintentar
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              if (window.history.length > 1) {
                router.history.back()
              } else {
                navigate({ to: "/" })
              }
            }}
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver atrás
          </Button>

          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => navigate({ to: "/" })}
          >
            <Home className="mr-2 size-4" />
            Ir al inicio
          </Button>
        </div>

        {/* Error Details Accordion (especially in development or when error is provided) */}
        {error && (
          <div className="mt-8 w-full text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              <span>Detalles técnicos del error</span>
              {showDetails ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>

            {showDetails && (
              <div className="mt-2 max-h-60 overflow-auto rounded-lg border border-border bg-card p-4 font-mono text-xs text-destructive">
                <p className="font-semibold">{errorMessage}</p>
                {errorStack && (
                  <pre className="mt-2 whitespace-pre-wrap text-[11px] text-muted-foreground">
                    {errorStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GeneralError
