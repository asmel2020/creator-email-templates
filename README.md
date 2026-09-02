# creator-email — Monorepo de plantillas de email

Monorepo (Turborepo + pnpm) con dos paquetes para construir y renderizar plantillas de email por bloques:

| Paquete | Nombre | Qué hace | React |
|---|---|---|---|
| `packages/create-email-template` | `@repo/create-email-template` | **Editor visual (front-end)**: builder drag & drop, palette, canvas editable, panel de propiedades, preview React (react-email). Exporta componentes, hooks y store. | **Sí** — peer `react`/`react-dom` |
| `packages/create-email-renderer` | `@repo/create-email-renderer` | **Renderizado (back-end)**: convierte el JSON de bloques a HTML email-safe (tablas + estilos inline). Solo manipulación de strings. | **No** — cero React, corre en Node, Workers, edge |

El flujo completo es:

```
Editor (front)  ──getPayload()──▶  JSON { content, settings }  ──▶  Base de datos
                                                                        │
Email HTML  ◀──renderTemplateEmail({ payload, context })  ◀──────────────┘
             (@repo/create-email-renderer, sin React)
```

Ambos paquetes comparten el mismo core (tipos, bloques por defecto, variables, richtext) desde `@repo/create-email-renderer`, por lo que **el preview del editor y el HTML del backend nunca divergen**.

---

## Requisitos

- **Node.js >= 18** · **pnpm 9** (el repo usa `packageManager: pnpm@9.0.0`)
- **React mínimo permitido: `^18.0.0`** (también `^19.0.0`). Solo lo necesita `@repo/create-email-template` (usa `useSyncExternalStore`, nativo desde React 18). `@repo/create-email-renderer` no tiene React ni ninguna dependencia más allá de `sanitize-html`.

## Instalación

### Dentro de este monorepo (workspace pnpm)

En el `package.json` de la app que lo consuma:

```jsonc
{
  "dependencies": {
    // Solo front-end (builder + preview):
    "@repo/create-email-template": "workspace:*",
    // Solo back-end (render a HTML), o ambos si la app hace las dos cosas:
    "@repo/create-email-renderer": "workspace:*"
  }
}
```

```sh
pnpm install          # enlaza los workspace
pnpm build            # turbo compila renderer → template → apps (respeta dependencias)
```

> Los paquetes son `private: true`: se consumen por workspace, no por npm publish. Si algún día se publican, bastaría cambiar `"workspace:*"` por la versión.

### Estructura

```
apps/
├── vite-test/            # app de ejemplo (TanStack Router) con el builder integrado
├── template-back-end/    # API Hono + Cloudflare Workers (ya incluye el renderer)
└── api/
packages/
├── create-email-template/   # UI del builder (React)
└── create-email-renderer/   # core puro + render HTML (sin React)
```

---

## 1. Front-end: `@repo/create-email-template`

### Setup mínimo

```tsx
import {
  EmailBuilder,
  EmailBuilderProvider,
} from "@repo/create-email-template";
import "@repo/create-email-template/style.css"; // ¡necesario! estilos .ter-theme autocontenidos

export function EditorPage() {
  return (
    <EmailBuilderProvider>
      <EmailBuilder />
    </EmailBuilderProvider>
  );
}
```

`EmailBuilder` es el editor completo (palette + canvas + panel). Todo lo demás es opcional.

### `<EmailBuilderProvider>` — parámetros

```tsx
<EmailBuilderProvider
  config={{
    /* Todas opcionales */
    variables?: EmailVariable[];               // etiquetas {name} disponibles (default: DEFAULT_VARIABLES)
    variableSections?: EmailVariableSection[]; // agrupación para el dialog "Etiquetas disponibles"
    blockLibrary?: BlockDefinition[];          // bloques del palette (default: DEFAULT_BLOCK_LIBRARY)
    blockDefaults?: BlockDefaultsMap;          // sobrescribe defaultProps por tipo de bloque
    palette?: Partial<EmailPalette>;           // colores base: { INK, DARK, GOLD, CREAM_DIM }
    defaultSettings?: Partial<EmailSettings>;  // { pageBackground, cardBorderWidth, cardBorderRadius }
    sampleContext?: EmailContext;              // datos de ejemplo para el preview ({name: "Juan"...})
    labels?: Partial<EmailBuilderLabels>;      // textos de la UI (i18n)
  }}
  uploadImage={async (file: File) => {
    // Sube a R2/S3/tu API y devuelve la URL pública
    const url = await miApi.upload(file);
    return url;
  }}
>
  {children}
</EmailBuilderProvider>
```

Ejemplo de `blockDefaults` y `labels`:

```tsx
<EmailBuilderProvider
  config={{
    blockDefaults: {
      text: { text: "Tu mensaje aquí. Usa {firstName}." },
      button: { label: "Ver más", backgroundColor: "#d7b227" },
    },
    labels: { blocksTitle: "Blocks", optionsTitle: "Options" },
    palette: { GOLD: "#c9a227" },
    sampleContext: { firstName: "Danny", unsubscribeUrl: "https://mi-sitio.com/baja" },
  }}
>
```

### Guardar la plantilla (el payload que entiende el backend)

```tsx
import { useRenderEmail } from "@repo/create-email-template";

function Toolbar() {
  const { getPayload } = useRenderEmail(); // debe estar dentro del <EmailBuilderProvider>

  const save = async () => {
    const payload = getPayload(); // { content: EmailBlock[], settings: EmailSettings }
    await fetch("/api/templates", {
      method: "POST",
      body: JSON.stringify(payload), // esto es lo que se guarda en la BD
    });
  };
  return <button onClick={save}>Guardar</button>;
}
```

El payload es JSON plano, sin funciones ni refs — seguro para persistir tal cual.

### Autoguardado (opt-in)

El builder puede administrar el guardado periódico: cada `intervalMs` (default **10s**), si hay cambios (`dirty`) y no hay un guardado en vuelo, llama a tu `onSave` y marca el store como salvado. La librería **no hace network** — `onSave` es tu fetch; lo típico es que el backend persista el JSON y devuelva también el HTML renderizado:

```tsx
import {
  EmailBuilder,
  EmailBuilderProvider,
  useAutosaveStatus,
} from "@repo/create-email-template";
import type { AutosavePayload } from "@repo/create-email-template";

async function onSave(payload: AutosavePayload) {
  const res = await fetch(`/api/templates/${templateId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al guardar");
  return res.json() as Promise<{ json: AutosavePayload; html: string }>;
}

<EmailBuilderProvider
  config={config}
  autosave={{
    onSave,                     // obligatorio: tu fetch al backend
    intervalMs: 10_000,         // default 10s
    enabled: true,              // default true (interruptor sin desmontar el provider)
    onSaved: (result) => {      // opcional: toast/feedback
      if (!result.ok) console.error("Autosave falló", result.error);
      else console.log("Guardado:", result.data); // { json, html } del backend
    },
  }}
>
  <MiIndicadorDeGuardado />
  <EmailBuilder />
</EmailBuilderProvider>
```

Estado del autoguardado desde cualquier componente dentro del provider:

```tsx
function MiIndicadorDeGuardado() {
  const { isSaving, lastSavedAt, lastError, lastResult, saveNow } = useAutosaveStatus();
  // lastResult = lo que devolvió tu onSave (ej. { json, html } del backend)
  return <button onClick={() => saveNow()} disabled={isSaving}>Guardar ahora</button>;
}
```

Contrato del endpoint (backend con el renderer):

```ts
app.put("/templates/:id", async (c) => {
  const payload = await c.req.json(); // { content, settings }
  const { html, subject } = await renderTemplateEmail({
    subject: template.subject,
    payload,
    context: userContext,
  });
  await db.updateTemplate(c.req.param("id"), payload);
  return c.json({ json: payload, html }); // ← lo recibe `lastResult`
});
```

Detalles del ciclo: si editas mientras se guarda, `dirty` vuelve a `true` y el próximo tick lo toma (no se pierden cambios); sin `autosave` el provider se comporta exactamente igual que antes.

### Hooks y store (uso avanzado)

| API | Descripción |
|---|---|
| `useRenderEmail()` | `{ renderHtml, getHtml, getPayload, resolve, html, isPending }` — renderiza el preview con react-email y expone el payload actual. |
| `useEmailBuilderStore((s) => s.blocks)` | Zustand-like: selecciona estado del builder (`blocks`, `selectedId`, `settings`, `dirty`, acciones `addBlock`, `reorder`, `updateBlockProps`, `removeBlock`, `duplicateBlock`, `select`, `hydrate`, `getPayload`...). Requiere el provider. |
| `createEmailBuilderStore(config)` | Store vanilla (mismo shape, `getState`/`setState`/`subscribe`) para usar fuera de React. Cero dependencias. |

Componentes sueltos también exportados: `BlockPalette`, `Canvas`, `SortableCanvas`, `EditableBlockRenderer`, `PropertiesPanel`, `InlineTextEditor`, `SelectionToolbar`, `VariablesInfoDialog` — por si quieres armar un editor a medida.

---

## 2. Back-end: `@repo/create-email-renderer` (sin React)

Funciona en **Node, Cloudflare Workers, Vercel Edge, Deno, Bun** — es JS puro.

### Renderizar una plantilla guardada

```ts
import { renderTemplateEmail, buildTemplateContext } from "@repo/create-email-renderer";

// template.payload es el JSON guardado desde el editor: { content, settings }
const { html, subject } = await renderTemplateEmail({
  subject: "Hola {firstName}, tu webinar es el {webinarDate}",
  payload: template.payload,          // string JSON u objeto; tolera null/undefined (devuelve vacío)
  context: {
    firstName: user.firstName,        // tus datos reales
    webinarDate: "12 de octubre",
    confirmEmailUrl: confirmUrl,
  },
  // settings?: Partial<EmailSettings>  — sobrescribe los settings guardados
  // palette?: EmailPalette             — sobrescribe los colores
});

await emailClient.send({ to: user.email, subject, html });
```

- Las **variables `{key}`** se resuelven con `context` (merge sobre `SAMPLE_CONTEXT`, así los correos de prueba siempre se ven completos).
- El **subject también resuelve variables** (`"Hola {firstName}"` → `"Hola Danny"`).
- Si el payload no tiene bloques lanza `Error("Template payload has no blocks")`.

### Ruta de ejemplo (Hono / Express)

```ts
import { Hono } from "hono";
import { renderTemplateEmail } from "@repo/create-email-renderer";

const app = new Hono();

app.post("/emails/:templateId/preview", async (c) => {
  const template = await db.getTemplate(c.req.param("templateId"));
  const { html, subject } = await renderTemplateEmail({
    subject: template.subject,
    payload: template.payload,
    context: await c.req.json(),
  });
  return c.html(html);
});

export default app;
```

### API completa del renderer

| Export | Descripción |
|---|---|
| `renderTemplateEmail(opts)` | Plantilla completa: `{ html, subject }`. **El que usarás el 95% del tiempo.** |
| `renderEmailHtml(opts)` | Bloques ya parseados → HTML. Opciones: `{ blocks, subject?, context?, settings?, palette? }`. |
| `parseTemplatePayload(raw)` | `string \| object \| null` → `{ content, settings }` tolerante (nunca lanza). |
| `buildTemplateContext(base, extra)` | Limpia `null`/`""` y hace merge con `SAMPLE_CONTEXT`. |
| `resolveVariables(text, ctx)` | Reemplaza `{key}` por valores del contexto. |
| `renderRichText` / `sanitizeRichText` / `escapeHtml` | El mismo pipeline de richtext del editor (sanitize-html). |
| `DEFAULT_BLOCK_LIBRARY` / `DEFAULT_PALETTE` / `DEFAULT_SETTINGS` / `DEFAULT_VARIABLES` / `SAMPLE_CONTEXT` | Defaults compartidos con el editor. |
| Tipos | `EmailBlock`, `EmailBlockType`, `EmailBlockProps`, `EmailSettings`, `EmailPalette`, `EmailContext`, `BlockDefinition`... |

Subpaths disponibles: `@repo/create-email-renderer` (todo), `/server` (helpers de plantilla), `/html-render`, `/types`, `/variables`, `/richtext`, `/default-blocks`.

---

## 3. Tipos clave

```ts
type EmailBlockType =
  | "header" | "hero" | "heading" | "text" | "list" | "button"
  | "image" | "quote" | "columns" | "divider" | "spacer" | "footer";

interface EmailBlock {
  id: string;
  type: EmailBlockType;
  props: EmailBlockProps; // props específicas por tipo + align/backgroundColor/paddingY/paddingX
}

interface EmailSettings {
  pageBackground: string;   // "#f5f1e8"
  cardBorderWidth: number;  // 1
  cardBorderRadius: number; // 4
}

// Payload persistido = { content: EmailBlock[], settings: EmailSettings }
```

Las variables se escriben como `{key}` en cualquier texto del editor y se resuelven al enviar.

---

## Desarrollo

```sh
pnpm dev              # apps en dev (turbo)
pnpm build            # build de todo (renderer primero)
pnpm lint             # eslint en todos los packages
pnpm check-types      # tsc en todos los packages
pnpm --filter vite-test dev                      # solo la app de ejemplo
pnpm --filter @repo/create-email-renderer build  # solo el renderer
```

Demo integrada: `apps/vite-test` → ruta **`/email-builder`** (pública), con botón **"Vista previa"** que compara lado a lado el render de React y el del renderer del backend.
