import { useNavigate, useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, SearchX } from "lucide-react"

interface NotFoundErrorProps {
  className?: string
}

export function NotFoundError({ className }: NotFoundErrorProps) {
  const navigate = useNavigate()
  const router = useRouter()

  return (
    <div
      className={`flex min-h-svh flex-col items-center justify-center bg-background p-6 text-foreground md:p-10 ${className || ""}`}
    >
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        {/* Icon & Code Badge */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl dark:bg-primary/20" />
          <div className="relative flex size-20 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
            <SearchX className="size-10 text-primary" />
          </div>
        </div>

        <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Error 404
        </span>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Página no encontrada
        </h1>

        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          Lo sentimos, no pudimos encontrar la página que buscas. Es posible que
          haya sido movida, eliminada o que la dirección sea incorrecta.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
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
            variant="default"
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

export default NotFoundError
