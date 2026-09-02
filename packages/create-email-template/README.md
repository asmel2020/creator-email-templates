# create-email-template

Editor visual de plantillas de email por bloques para React: palette, canvas con drag & drop, edición de texto inline enriquecida, panel de propiedades, autoguardado, deshacer y preview.

El JSON que produce se renderiza a HTML email-safe con su compañero [`create-email-renderer`](https://www.npmjs.com/package/create-email-renderer) (**sin React**, para backend/edge). Comparten el mismo core, por lo que el preview del editor y el HTML final nunca divergen.

## Instalación

```sh
npm install create-email-template
```

Requiere React `^18 || ^19` como peer dependency.

## Uso mínimo

```tsx
import { EmailBuilder, EmailBuilderProvider } from "create-email-template";
import "create-email-template/style.css";

export function EditorPage() {
  return (
    <EmailBuilderProvider
      config={{
        blockDefaults: {
          header: { brandName: "Mi Marca", logoUrl: "https://mi-cdn.com/logo.png" },
          button: { label: "Quiero mi cupo", href: "{registerUrl}" },
        },
        sampleContext: { firstName: "Danny", registerUrl: "https://mi-sitio.com/registro" },
      }}
      uploadImage={async (file) => subirAS3(file)}   // opcional
      autosave={{                                     // opcional (default cada 10s)
        onSave: async (payload) => {
          const res = await fetch("/api/templates/1", {
            method: "PUT",
            body: JSON.stringify(payload), // { content, settings } → tu BD
          });
          return res.json(); // ej. { json, html } — disponible en useAutosaveStatus()
        },
      }}
    >
      <EmailBuilder />
    </EmailBuilderProvider>
  );
}
```

## Hooks

| Hook | Uso |
|---|---|
| `useAutosaveStatus()` | `{ isSaving, lastSavedAt, lastError, lastResult, saveNow }` — **`saveNow()` = botón "Guardar" manual** con el mismo `onSave` del autoguardado. |
| `useRenderEmail()` | `{ getPayload, renderHtml, getHtml, resolve, html, isPending }` — payload para persistir y preview. |
| `useEmailBuilderStore(selector)` | Estado y acciones: `blocks`, `settings`, `dirty`, `past.length > 0`, `undo()`, `hydrate({ blocks, settings? })`, `addBlock`, `removeBlock`, `reorder`… |

## Incluido

- **12 tipos de bloque**: header, hero, heading, text, list, button, image, quote, columns, divider, spacer, footer.
- **Autoguardado** (opt-in, default cada 10s, con guards anti-carrera) y **guardado manual** con el mismo `onSave`.
- **Deshacer lineal** (sin redo): Ctrl/Cmd+Z incluido, agrupa escrituras continuas, tope configurable (`historyLimit`).
- **Carga de plantillas**: `hydrate()` normaliza payloads de versiones anteriores del esquema y reinicia el historial.
- **Variables** `{firstName}` con dialog de etiquetas disponibles y resolución en preview.
- **Temas**: paleta, defaults por bloque y textos de UI (i18n) por configuración.
- Estilos autocontenidos (`style.css` con fuente embebida, scope `.ter-theme`).

## Flujo completo

El JSON del editor se renderiza en tu backend con [`create-email-renderer`](https://www.npmjs.com/package/create-email-renderer) — sin React, ejecutable en Node/Workers/edge. Ejemplo de endpoint y ciclo completo en el [README del monorepo](https://github.com/asmel2020/creator-email).

## Licencia

MIT
