import { useNavigate, useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Construction, Home, RotateCcw } from "lucide-react"

interface MaintenanceErrorProps {
  className?: string
}

export function MaintenanceError({ className }: MaintenanceErrorProps) {
  const navigate = useNavigate()
  const router = useRouter()

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div
      className={`flex min-h-svh flex-col items-center justify-center bg-background p-6 text-foreground md:p-10 ${className || ""}`}
    >
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        {/* Icon & Glow */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full bg-orange-500/15 blur-xl dark:bg-orange-500/25" />
          <div className="relative flex size-20 items-center justify-center rounded-2xl border border-orange-500/20 bg-card shadow-sm">
            <Construction className="size-10 text-orange-500" />
          </div>
        </div>

        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-orange-500">
          Error 503
        </span>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Servicio en mantenimiento
        </h1>

        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          Estamos realizando labores de mantenimiento o el servicio no se encuentra disponible temporalmente. Por favor, vuelve a intentarlo en unos minutos.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="default"
            className="w-full sm:w-auto"
            onClick={handleRefresh}
          >
            <RotateCcw className="mr-2 size-4" />
            Recargar página
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
      </div>
    </div>
  )
}

export default MaintenanceError
