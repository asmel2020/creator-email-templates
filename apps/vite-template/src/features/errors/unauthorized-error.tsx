import { useNavigate, useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, Lock, LogIn } from "lucide-react"

interface UnauthorizedErrorProps {
  className?: string
}

export function UnauthorizedError({ className }: UnauthorizedErrorProps) {
  const navigate = useNavigate()
  const router = useRouter()

  return (
    <div
      className={`flex min-h-svh flex-col items-center justify-center bg-background p-6 text-foreground md:p-10 ${className || ""}`}
    >
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        {/* Icon & Glow */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full bg-amber-500/15 blur-xl dark:bg-amber-500/25" />
          <div className="relative flex size-20 items-center justify-center rounded-2xl border border-amber-500/20 bg-card shadow-sm">
            <Lock className="size-10 text-amber-500" />
          </div>
        </div>

        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-500">
          Error 401
        </span>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          No autenticado
        </h1>

        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          Necesitas iniciar sesión para acceder a este recurso. Por favor, autentícate con tus credenciales.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="default"
            className="w-full sm:w-auto"
            onClick={() => navigate({ to: "/login" })}
          >
            <LogIn className="mr-2 size-4" />
            Iniciar sesión
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

export default UnauthorizedError
