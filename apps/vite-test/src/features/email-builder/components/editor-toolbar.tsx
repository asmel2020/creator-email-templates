import { EyeIcon, LayoutTemplateIcon, MailIcon, Undo2Icon } from "lucide-react"
import {
  useEmailBuilderStore,
  useEmailBuilderStoreInstance,
} from "create-email-template"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEmailBuilderDialogsStore } from "../stores/use-email-builder-dialogs"
import { AutosaveIndicator } from "./autosave-indicator"
import { SAMPLE_TEMPLATES } from "../templates"

/**
 * Botón de undo: se habilita solo cuando hay historial (`past.length > 0`).
 * Ejemplo de suscripción selectiva al store del builder.
 */
function UndoButton() {
  const canUndo = useEmailBuilderStore((s) => s.past.length > 0)
  const undo = useEmailBuilderStore((s) => s.undo)
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={!canUndo}
      onClick={() => undo()}
    >
      <Undo2Icon data-slot="icon" />
      Deshacer
    </Button>
  )
}

/**
 * Contador de bloques del canvas: otro ejemplo de lectura reactiva del store
 * (`useEmailBuilderStore` con selector) desde fuera del builder.
 */
function BlockCount() {
  const count = useEmailBuilderStore((s) => s.blocks.length)
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
      {count} {count === 1 ? "bloque" : "bloques"}
    </span>
  )
}

/**
 * Cargador de correos ya armados: hidrata el canvas con plantillas completas.
 * `hydrate` normaliza el payload y reinicia el historial de undo.
 */
function TemplatesMenu() {
  const store = useEmailBuilderStoreInstance()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
        <LayoutTemplateIcon data-slot="icon" />
        Plantillas
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Correos ya armados</DropdownMenuLabel>
          {SAMPLE_TEMPLATES.length === 0 ? (
            <DropdownMenuItem disabled>Sin plantillas todavía</DropdownMenuItem>
          ) : (
            SAMPLE_TEMPLATES.map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() =>
                  store.getState().hydrate({ blocks: template.blocks })
                }
              >
                {template.name}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Toolbar del editor de demostración.
 * Composición de tres integraciones del sistema en un solo header:
 *  1. store del builder (undo, contador de bloques)
 *  2. autoguardado (`useAutosaveStatus` vía AutosaveIndicator)
 *  3. dialogs administrados con zustand (botón "Vista previa")
 */
export function EditorToolbar() {
  const setOpen = useEmailBuilderDialogsStore((s) => s.setOpen)

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MailIcon className="size-4" />
        </div>
        <div className="leading-tight">
          <h1 className="font-heading text-sm font-semibold">Email Builder</h1>
          <p className="text-xs text-muted-foreground">
            Editor de plantillas · demo de integración
          </p>
        </div>
        <Separator orientation="vertical" className="mx-1 !h-5" />
        <BlockCount />
      </div>

      <div className="flex items-center gap-2">
        <AutosaveIndicator />
        <Separator orientation="vertical" className="mx-1 !h-5" />
        <TemplatesMenu />
        <UndoButton />
        <Button size="sm" onClick={() => setOpen("preview")}>
          <EyeIcon data-slot="icon" />
          Vista previa
        </Button>
      </div>
    </header>
  )
}
