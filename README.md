# @repo — Email Template Builder & Renderer

Monorepo con dos librerías para construir y renderizar plantillas de email por bloques:

| Paquete | Para qué | React |
|---|---|---|
| **`create-email-template`** | Editor visual drag & drop: palette, canvas editable inline, panel de propiedades, autoguardado, deshacer, preview. | Sí (`^18 \|\| ^19`) |
| **`create-email-renderer`** | Convertir el JSON de la plantilla a **HTML email-safe sin React**: tablas + estilos inline, listo para Node, Workers o edge. | **No** — cero dependencias React |

**El flujo completo:**

```
Editor (front) ──getPayload()──▶ JSON { content, settings } ──▶ tu base de datos
                                                                      │
Email HTML ◀── renderTemplateEmail({ payload, context }) ◀────────────┘
              (create-email-renderer, sin React)
```

Ambas librerías comparten el mismo core, por lo que **el preview del editor y el HTML del backend nunca divergen**.

> 📐 **Documentación técnica completa** (arquitectura, estructura, convenciones, gotchas, testing y checklist de publicación): ver [AGENTS.md](./AGENTS.md).

---

## Características

- 🧱 **12 tipos de bloque**: header, hero, heading, text, list, button, image, quote, columns, divider, spacer, footer — todos con estilos email-safe (tablas + inline).
- ✍️ **Edición inline enriquecida** (negrita, cursiva, enlaces) directamente en el canvas, con drag & drop (`@dnd-kit`).
- 🏷️ **Variables** `{firstName}` con resolución en preview y en el HTML final.
- 💾 **Autoguardado integrado** (opt-in, default cada 10s) con estado reactivo y guardado manual vía `saveNow()`.
- ↩️ **Deshacer lineal** (sin redo) con agrupación de escritura, tope configurable y reinicio al cargar plantillas.
- 🛡️ **Normalización de payloads**: plantillas guardadas con versiones anteriores del esquema se auto-reparan al cargarse o renderizarse.
- 🎨 **Temas por configuración**: paleta, defaults por bloque, etiquetas de UI (i18n) y contexto de ejemplo.
- ☁️ **Renderer portable**: JS puro — Node, Cloudflare Workers, Vercel Edge, Deno, Bun.

---

## Instalación

Las librerías se consumen como workspaces de este monorepo (preparadas para publicarse a npm — ver checklist en [AGENTS.md](./AGENTS.md#10-publicación-npm-estado-y-procedimiento)):

```jsonc
// package.json de tu app
{
  "dependencies": {
    "create-email-template": "workspace:*",  // solo front-end (editor)
    "create-email-renderer": "workspace:*"   // solo back-end (render HTML)
  }
}
```

```sh
pnpm install
pnpm build   # compila renderer → template → apps
```

Requisitos: Node ≥ 18, pnpm 9, React ≥ 18 (solo para el editor).

---

## Quick start — Editor (front-end)

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
      uploadImage={async (file) => subirAS3(file)}          // opcional
      autosave={{                                            // opcional (default 10s)
        onSave: async (payload) => {
          const res = await fetch("/api/templates/1", {
            method: "PUT",
            body: JSON.stringify(payload),
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

### Hooks principales

| Hook | Uso |
|---|---|
| `useAutosaveStatus()` | `{ isSaving, lastSavedAt, lastError, lastResult, saveNow }` — **`saveNow()` = tu botón "Guardar"** manual usando el mismo `onSave`. |
| `useRenderEmail()` | `{ getPayload, renderHtml, getHtml, resolve }` — payload para persistir y preview. |
| `useEmailBuilderStore(selector)` | Estado y acciones: `blocks`, `dirty`, `past.length > 0` (puede deshacer), `undo()`, `hydrate({ blocks, settings })` para cargar plantillas del backend. |

### Guardar con botón + autoguardado

```tsx
function Toolbar() {
  const { saveNow, isSaving } = useAutosaveStatus();
  return <button onClick={() => saveNow()} disabled={isSaving}>Guardar</button>;
}
```

Un solo `onSave` sirve para ambos: el ciclo automático y el botón manual.

### Cargar una plantilla guardada

```tsx
const store = useEmailBuilderStoreInstance();
const template = await fetch(`/api/templates/${id}`).then((r) => r.json());
store.getState().hydrate({ blocks: template.payload.content, settings: template.payload.settings });
// normaliza el payload, reinicia el historial de deshacer y deja dirty en false
```

**Deshacer** está incluido: Ctrl/Cmd+Z ya funciona dentro de `<EmailBuilder />`, y `undo()` / `canUndo` están expuestos para tu propia UI.

---

## Quick start — Renderer (back-end, sin React)

```ts
import { renderTemplateEmail } from "create-email-renderer";

// template.payload = el JSON guardado desde el editor
const { html, subject } = await renderTemplateEmail({
  subject: "Hola {firstName}, tu webinar es el {webinarDate}",
  payload: template.payload,
  context: { firstName: user.firstName, webinarDate: "12 de octubre" },
});

await emailClient.send({ to: user.email, subject, html });
```

- Funciona en **Node, Cloudflare Workers, Vercel Edge, Deno y Bun** (JS puro).
- Las variables `{key}` se resuelven en el HTML **y en el subject**.
- Payloads corruptos o de versiones anteriores del esquema se **normalizan automáticamente** (nunca lanza por datos sucios; lanza solo si el payload no tiene bloques).

**Endpoint recomendado** (devuelve JSON + HTML; el front lo recibe en `useAutosaveStatus().lastResult`):

```ts
app.put("/templates/:id", async (c) => {
  const payload = await c.req.json();
  const { html, subject } = await renderTemplateEmail({
    subject: template.subject,
    payload,
    context: userContext,
  });
  await db.updateTemplate(c.req.param("id"), payload);
  return c.json({ json: payload, html });
});
```

---

## API en una tabla

| Necesito… | Uso |
|---|---|
| El editor completo | `<EmailBuilderProvider><EmailBuilder /></EmailBuilderProvider>` + `style.css` |
| Configurar el editor | `config={{ blockDefaults, palette, defaultSettings, sampleContext, labels, variables, blockLibrary, historyLimit }}` |
| Guardar (auto o botón) | `autosave={{ onSave, intervalMs?, enabled?, onSaved? }}` + `useAutosaveStatus().saveNow()` |
| Cargar del backend | `useEmailBuilderStoreInstance().getState().hydrate({ blocks, settings? })` |
| Deshacer | Ctrl/Cmd+Z (incluido) · `useEmailBuilderStore((s) => s.undo)` |
| Renderizar a HTML | `renderTemplateEmail({ subject, payload, context })` |
| Bloques crudos → HTML | `renderEmailHtml({ blocks, settings, palette })` |
| Validar/normalizar JSON | `normalizeBlocks` / `normalizeSettings` / `parseTemplatePayload` |

Referencia completa de parámetros, tipos y ciclo de vida: **[AGENTS.md](./AGENTS.md)**.

---

## Demo

`apps/vite-test` → ruta **`/email-builder`** (pública): editor completo con la configuración de muestra, autoguardado, deshacer y un dialog de **comparación en vivo** entre el render de React y el HTML del renderer del backend.

```sh
pnpm --filter vite-test dev
```

## Estructura del monorepo

```
apps/
├── vite-test/            # App demo de integración (TanStack Router)
├── template-back-end/    # API Hono + Cloudflare Workers
└── api/
packages/
├── create-email-template/   # Editor visual (React)
└── create-email-renderer/   # Core puro + render HTML (sin React)
```

## Licencia

MIT
