# @repo/create-email-template

Constructor de plantillas de correo **reutilizable** (paleta de bloques + canvas +
panel de opciones) para integrarlo en cualquier proyecto React.

La librería aporta el **editor** y el **render del correo**. Todo lo demás
(persistencia, asunto, envío, preview como dialog) es responsabilidad del
consumidor, usando los hooks exportados.

## Stack

- **Zustand** — estado por instancia (fábrica + contexto React)
- **shadcn/ui** (`button`, `input`, `label`, `dialog`, `sheet`)
- **@dnd-kit** — drag & drop de bloques
- **@react-email/components + @react-email/render** — render final del HTML
- **Tailwind v4** — estilos (compilados en `style.css`)

## Instalación / consumo

Como workspace del monorepo:

```ts
import {
  EmailBuilder,
  EmailBuilderProvider,
  EmailBody,
  useEmailBuilder,
  useRenderEmail,
  type EmailBuilderConfig,
} from "@repo/create-email-template";

import "@repo/create-email-template/style.css"; // tema + utilidades compiladas
```

- El paquete compila a `dist/` (JS + CSS + tipos). Requisitos: **React 18+/19** (peer) y
  Node ≥18 para el render en backend.

### CSS

- `@repo/create-email-template/style.css` — tema completo + utilidades
  (para proyectos que NO tienen tema propio).
- `@repo/create-email-template/bare.css` — solo utilidades (sin `:root`/`.dark`),
  compatibles con temas shadcn clásicos (`hsl(var(--x))`). Es el que usa apps/web.

### Subpath server (recomendado v0.1.1)

Para route handlers / servicios (backend) que solo renderizan el HTML, usa el
subpath **`./server`** (core sin UI ni hooks de cliente). **Desde v0.1.1 el
paquete expone `renderTemplateEmail` que esconde el `React.createElement` feo:**

```ts
// helper limpio del paquete — 1 línea, sin React.createElement visible
import { renderTemplateEmail, buildTemplateContext } from "@repo/create-email-template/server";

const ctx = buildTemplateContext({}, {
  name: "Ana Gómez",
  email: "ana@ejemplo.com",
  webinarName: "Webinar de Finanzas",
  siteUrl: "https://www.sincorbatas.com",
  completeRegistrationUrl: "https://.../completar-registro?token=...",
});

const { html, subject: resolvedSubject } = await renderTemplateEmail({
  subject,                // string con {name} etc.
  payload,                // string JSON o {content, settings} tal cual se guarda en DB
  context: ctx,
});
```

> El helper hace `parseTemplatePayload(payload)` + `merge SAMPLE_CONTEXT` + `render(<EmailTemplate>)` + `resolveVariables(subject)` internamente (usa `React.createElement` oculto). Si prefieres control total, sigue disponible el camino low-level:

```ts
import { EmailTemplate, resolveVariables, SAMPLE_CONTEXT, type EmailBlock } from "@repo/create-email-template/server";
import { render } from "@react-email/render"; // build node en el servidor

const html = await render(
  <EmailTemplate
    blocks={content}
    subject={subject}
    context={mergedContext}
    pageBackground={settings.pageBackground}
    cardBorderWidth={settings.cardBorderWidth}
    cardBorderRadius={settings.cardBorderRadius}
  />,
);
```

> En **Next.js (App Router)** usa `renderTemplateEmail` del paquete (ya trae `React` bien importado y externalizado) — evita el bug `ref.current` que daba `renderEmailHtml` del `dist/server.js` sin `React`. El paquete también exporta `renderEmailHtml` (build browser) útil solo para preview en cliente.

## Guía rápida

El mínimo para ver el editor:

```tsx
const config: EmailBuilderConfig = {
  variableSections: [
    {
      id: "general",
      title: "Generales — aplica a todo",
      description: "Variables con dato real en cualquier plantilla.",
      variables: [
        { key: "name", label: "Nombre completo" },
        { key: "email", label: "Correo electrónico" },
        { key: "phone", label: "Teléfono" },
        { key: "companyName", label: "Marca / Empresa" },
        { key: "siteUrl", label: "URL del sitio" },
        { key: "completeRegistrationUrl", label: "URL completar registro" },
      ],
    },
    {
      id: "webinar",
      title: "Webinar — registro",
      description: "Solo si el correo está asociado a un webinar.",
      variables: [
        { key: "webinarName", label: "Nombre del webinar" },
        { key: "webinarSlug", label: "Slug del webinar" },
      ],
    },
    {
      id: "course",
      title: "Curso — pago aprobado",
      description: "Solo si el correo está asociado a un curso y el pago es aprobado.",
      variables: [
        { key: "courseName", label: "Nombre del curso" },
        { key: "productName", label: "Nombre del producto" },
        { key: "amountVes", label: "Monto en Bs." },
        { key: "paymentUrl", label: "URL de detalle del pago" },
      ],
    },
  ],
  palette: {
    INK: "#1e293b",
    DARK: "#0f172a",
    GOLD: "#0ea5e9",
    CREAM_DIM: "#94a3b8",
  },
  defaultSettings: { pageBackground: "#f8fafc", cardBorderRadius: 8 },
  sampleContext: { name: "Ana Gómez", email: "ana@ejemplo.com", siteUrl: "https://..." },
};

export function Page() {
  return (
    <EmailBuilderProvider config={config} uploadImage={miUploadImage}>
      <MiToolbar />   {/* externo: usa los hooks */}
      <EmailBuilder />
    </EmailBuilderProvider>
  );
}
```

`EmailBuilder` solo dibuja paleta + canvas + opciones. Todo lo externo (toolbar,
asunto, persistencia, envío, preview) se hace desde el consumidor con los hooks
(`useEmailBuilder`, `useRenderEmail`), que **requieren estar dentro de
`<EmailBuilderProvider>`**.

> Compatibilidad: `config.variables: EmailVariable[]` (plano) sigue funcionando para
> proyectos viejos; se convierte internamente en una sola sección con título
> `labels.variablesGroup`. Usa `variableSections` para el nuevo dialog por acordeones.

---

## Integración completa

### 1. Crear un template y guardarlo

El botón Guardar lo construye el consumidor. El paquete entrega lo que hay que
persistir con `getPayload()` (un **único JSON** por template):

```tsx
function MiToolbar() {
  const { dirty, markSaved } = useEmailBuilder();
  const { getPayload } = useRenderEmail();

  const handleSave = async () => {
    const payload = getPayload(); // { content: EmailBlock[], settings: EmailSettings }
    await fetch("/api/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    markSaved(); // dirty -> false, botón vuelve a "Guardado"
  };

  return (
    <button onClick={handleSave} disabled={!dirty}>
      {dirty ? "Guardar" : "Guardado"}
    </button>
  );
}
```

> `dirty` se activa al editar bloques o ajustes. `markSaved()` lo resetea tras
> persistir. `name`/`subject` son **externos**: guárdalos en tus propias columnas.

### 2. Editar un template guardado

El JSON guardado se mete al store con `hydrate()` desde un componente dentro del
provider (el `<EmailBuilder />` NO recibe bloques por prop):

```tsx
function EditarEmail({ id }) {
  return (
    <EmailBuilderProvider config={config} uploadImage={miUploadImage}>
      <CargadorTemplate id={id} />
      <MiToolbar />
      <EmailBuilder />
    </EmailBuilderProvider>
  );
}

function CargadorTemplate({ id }) {
  const { hydrate } = useEmailBuilder();

  useEffect(() => {
    fetch(`/api/emails/${id}`)
      .then((r) => r.json())
      .then((guardado) => {
        // guardado = { content: [...], settings: {...}, subject: "..." }
        hydrate({ blocks: guardado.content, settings: guardado.settings });
        // setSubject(guardado.subject); // asunto externo, lo manejas tú
      });
  }, [id, hydrate]);

  return null; // solo llena el store
}
```

`hydrate({ blocks, settings })` carga los bloques, fusiona `settings` sobre los
defaults y pone `dirty: false`.

### 3. Vista previa

Con el componente **`EmailBody`** (react-email) dentro de tu propio dialog, usando
el `sampleContext` y la paleta de la config:

```tsx
function MiPreviewDialog({ open, onOpenChange }) {
  const config = useEmailBuilderConfig();
  const { blocks, settings } = useEmailBuilder();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[660px]">
        <EmailBody
          blocks={blocks}
          context={config.sampleContext}
          palette={config.palette}
          cardBorderWidth={settings.cardBorderWidth}
          cardBorderRadius={settings.cardBorderRadius}
        />
      </DialogContent>
    </Dialog>
  );
}
```

O con el HTML final vía `getHtml()` (si necesitas el HTML exacto que se envía).

### 4. Envío de prueba (dialog del consumidor)

El paquete entrega el HTML (`getHtml`) y la resolución de etiquetas (`resolve`);
el envío lo hace tu API:

```tsx
function MiDialogEnvio({ open, onOpenChange, subject }) {
  const { getHtml, resolve } = useRenderEmail();
  const config = useEmailBuilderConfig();
  const [to, setTo] = useState("");
  const [values, setValues] = useState({ ...config.sampleContext });

  const handleSend = async () => {
    const context = values;
    const html = await getHtml({ subject, context });        // HTML con las {} resueltas
    const resolvedSubject = resolve(subject, context);       // asunto con las {} resueltas

    await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject: resolvedSubject, html }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* input to + inputs por variable (values) + botón Enviar */}
    </Dialog>
  );
}
```

### 5. Backend: enviar un template guardado a un destinatario real (v0.1.1)

**Recomendado — `renderTemplateEmail` (1 línea, sin `React.createElement` visible):**

```ts
import { renderTemplateEmail, buildTemplateContext, validateVariables } from "@repo/create-email-template/server";

// 1. Cargar lo guardado (payload es el JSON tal cual se guarda: {content, settings}) y subject
const template = await db.emailTemplates.get(id); // {subject, payload: string}

// 2. Contexto real (usa el helper del paquete para mergear SAMPLE_CONTEXT)
const ctx = buildTemplateContext({}, {
  name: "Ana Gómez",
  email: "ana@ejemplo.com",
  phone: "+57 300 111 2233",
  companyName: "Sin Corbatas",
  siteUrl: "https://www.sincorbatas.com",
  completeRegistrationUrl: "https://.../completar-registro?token=...",
  webinarName: "Webinar de Finanzas",
  webinarSlug: "finanzas-101",
  // o para curso: courseName, productName, amountVes, paymentUrl
});

// 3. (Opcional) detectar etiquetas sin valor
import { parseTemplatePayload } from "@repo/create-email-template/server";
const { content } = parseTemplatePayload(template.payload);
const missing = content
  .flatMap((b) => JSON.stringify(b.props))
  .flatMap((t) => validateVariables(t, Object.keys(ctx)));

// 4. Render + asunto resuelto en 1 llamada
const { html, subject: resolvedSubject } = await renderTemplateEmail({
  subject: template.subject,
  payload: template.payload, // string JSON tal cual en DB
  context: ctx,
});
await sendEmail({ to: ctx.email, subject: resolvedSubject, html });
```

**Alternativa low-level (sigue disponible):**

```ts
import { renderEmailHtml, resolveVariables, validateVariables } from "@repo/create-email-template";
import { parseTemplatePayload } from "@repo/create-email-template/server";
const { content, settings } = parseTemplatePayload(template.payload);
const html = await renderEmailHtml({ blocks: content, subject: template.subject, context: ctx, settings });
const resolvedSubject = resolveVariables(template.subject, ctx);
```

> Recomendado: usa `variableSections` para documentar qué contexto alimenta cada
> sección (Generales = `name/email/phone/companyName/siteUrl/completeRegistrationUrl`,
> Webinar = `webinarName/webinarSlug`, Curso = `courseName/productName/amountVes/paymentUrl`).
> Si una etiqueta de otra sección se usa sin contexto, quedará literal (`{key}`).

---

## Sistema de etiquetas `{}`

- Las etiquetas se escriben en el texto de los bloques: `"Hola {name}"`,
  `href: ""` (vacío por defecto para CTA, el usuario debe colocarlo). **Se guardan literales** dentro del JSON del template.
- **Dialog de etiquetas:** acordeones colapsables por sección (solo 1 abierto al inicio), badge con contador, botón **Copiar** (icono `Copy` → `Check` verde 1.5s) con `navigator.clipboard.writeText("{key}")` y `text-select-all` para copia rápida. Scroll global del dialog: `max-h-[85vh]` + `flex-1 overflow-y-auto`, header fijo, nunca se desborda de la pantalla por más secciones que agregues.
- Al **preview / enviar prueba** se resuelven con el `sampleContext` (o el que
  pases). `SAMPLE_CONTEXT` por defecto trae `Sin Corbatas` como `companyName` y valores de ejemplo para `courseName/paymentUrl/webinarSlug`.
- En el **backend**, se resuelven con el contexto real de cada destinatario vía
  `renderEmailHtml` (bloques) y `resolveVariables` (asunto).
- Una etiqueta **sin valor en el contexto se queda literal** (`{name}`) en el
  output → usa `validateVariables(text, knownKeys)` para detectarla.

Utilidades exportadas:

| Función | Descripción |
|---|---|
| `resolveVariables(text, context)` | Reemplaza `{key}` con `context[key]` (deja las desconocidas) |
| `extractVariables(text)` | Lista de keys usadas |
| `validateVariables(text, knownKeys)` | Keys usadas que no están en `knownKeys` |
| `renderEmailHtml(opts)` | Render a HTML string con `@react-email/render` |

### Etiquetas por secciones (desde v0.1.0)

Antes `config.variables: EmailVariable[]` era plano (1 lista). Ahora:

```ts
type EmailVariableSection = {
  id: string;           // "general" | "webinar" | "course" | custom
  title: string;        // "Generales — aplica a todo"
  description?: string;
  variables: EmailVariable[]; // {key,label}[]
}
config.variableSections?: EmailVariableSection[]
```

- Si pasas `variableSections`, el dialog muestra **acordeones** (uno por sección, el primero abierto, resto colapsado).
- Si pasas `variables` (legacy), se convierte en 1 sola sección con título `labels.variablesGroup` para compatibilidad.
- Si no pasas nada, usa `DEFAULT_VARIABLES` como 1 sección (comportamiento previo).

**Para agregar nueva funcionalidad:** solo haz push de `{id, title, variables}` en tu `EMAIL_BUILDER_CONFIG.variableSections` (ej. `{id:"newsletter", title:"Newsletter", variables:[...]}`) — el dialog escala automáticamente y el backend solo debe alimentar ese `context` al llamar `renderTemplateEmail`/`renderEmailHtml`.

## Subida de imágenes

El bloque de imagen no sube archivos por sí solo. Pasa `uploadImage` como prop de
`EmailBuilderProvider` (o de `EmailBuilder`):

```ts
const uploadImage = async (file: File): Promise<string> => {
  // PUT a tu API/R2 y devuelve la URL pública
  const url = await miServicio.subirImagen(file);
  return url;
};
```

Si no se provee, se usa `URL.createObjectURL(file)` (solo útil en desarrollo).

## Configuración (`EmailBuilderConfig`)

| Prop | Tipo | Descripción |
|---|---|---|
| `variableSections` | `EmailVariableSection[]` | **Nuevo (v0.1.0)** — secciones de etiquetas por acordeón. Reemplaza a `variables` cuando se quiere agrupar. |
| `variables` | `EmailVariable[]` | **Legacy** — etiquetas `{}` planas (compat). `{ key, label }`. Si se usa con `variableSections`, `variableSections` tiene prioridad |
| `blockLibrary` | `BlockDefinition[]` | Reemplaza por completo la librería de 12 bloques |
| `blockDefaults` | `BlockDefaultsMap` | Defaults por tipo de bloque: `{ text: { text: "..." }, button: { label: "Ver más", href: "" } }` — desde v0.1.0 `button.href` por defecto es `""` (vacío) para forzar al usuario a colocarlo |
| `palette` | `Partial<EmailPalette>` | Colores de marca: `{ INK, DARK, GOLD, CREAM_DIM }` |
| `defaultSettings` | `Partial<EmailSettings>` | `{ pageBackground, cardBorderWidth, cardBorderRadius }` |
| `sampleContext` | `EmailContext` | Valores de ejemplo para preview / envío de prueba. Por defecto `companyName:"Sin Corbatas"` + ejemplos de `webinarName/courseName/paymentUrl` |
| `labels` | `Partial<EmailBuilderLabels>` | Textos de la UI (i18n). Incluye `variablesInfoTitle`, `variablesGroup`, etc. |

Los valores por defecto son **genéricos** (sin marca): `header.brandName = "Tu Marca"`,
`footer.brandName = "Tu Marca"`, etc. Para tu marca usa `blockDefaults`.

## API Reference

### `EmailBuilderProvider`

```ts
<EmailBuilderProvider config={config} uploadImage={uploadImage}>
  {children}
</EmailBuilderProvider>
```

Crea el store Zustand (instancia) y el config resuelto. Props: `config?`,
`uploadImage?`, `children`.

Hooks de acceso (usar dentro del provider):

- `useEmailBuilderConfig()` → `ResolvedEmailBuilderConfig` ( `variableSections`, `variables` (flatten), `blockLibrary`,
  `blockMap`, `palette`, `defaultSettings`, `sampleContext`, `uploadImage`, `labels`).
- `useEmailBuilderStore(selector)` → acceso selectivo al estado del store.
- `useEmailBuilderStoreInstance()` → el store vanilla completo.

### `EmailBuilder`

```ts
<EmailBuilder className="h-[calc(100vh-120px)]" />
```

Renderiza paleta + canvas + opciones. Props: `className?` (altura por defecto
`h-[calc(100vh-120px)]`). Requiere estar dentro del provider.

- **Desktop (≥1024px):** 3 columnas `[240px_1fr_300px]` con paleta y opciones fijas, canvas scrolleable.
- **Móvil:** paleta horizontal con `min-h-[110px]` y `overflow-x-auto` (fix v0.1.0 para que no colapse a 0px), canvas `min-h-[60vh]`, opciones en `Sheet` deslizante. El layout usa `ter-overflow-visible` en móvil para no cortar el scroll horizontal.

### `useEmailBuilder()`

Estado + acciones del editor:

- Estado: `blocks`, `selectedId`, `propertiesOpen`, `settings`, `dirty`.
- Acciones: `hydrate({ blocks, settings? })`, `setSettings`, `addBlock(type, index?)`,
  `reorder(a, b)`, `updateBlockProps(id, props)`, `removeBlock(id)`,
  `duplicateBlock(id)`, `select(id)`, `setPropertiesOpen(open)`, `markSaved()`.
- Helpers: `getSavePayload()` (alias de `getPayload`), `renderHtml({ context?, subject? })`,
  `resolve(text, context?)`.

### `useRenderEmail()`

Lo que el paquete aporta para guardar / preview / envío:

| Retorno | Descripción |
|---|---|
| `getHtml({ context?, subject? })` | Devuelve el HTML; si no se generó aún (o pasas opciones) lo genera |
| `renderHtml(opts?)` | Regenera siempre el HTML |
| `getPayload()` | `{ content, settings }` — lo que se guarda en DB |
| `resolve(text, context?)` | Inyecta los valores de `{}` en un texto |
| `html` | Último HTML generado (para preview) |
| `isPending` / `setHtml` | Estado de generación / setter manual |

### Render core (backend / preview)

- `EmailBody({ blocks, context, palette?, cardBorderWidth?, cardBorderRadius? })`
  — componente react-email para vista previa.
- `EmailTemplate({ blocks, subject, context, palette?, pageBackground?, ... })`
  — template completo (`<Html>`) con preheader.
- `BlockRenderer({ block, context, palette? })` — render de un bloque.
- `renderEmailHtml({ blocks, subject?, context?, settings?, palette? })` → `Promise<string>` — low-level, requiere `blocks` ya parseados.
- **`renderTemplateEmail({ subject, payload, context?, settings?, palette? })` → `Promise<{html, subject}>` (v0.1.1, recomendado)** — helper limpio que hace `parseTemplatePayload(payload)` + `SAMPLE_CONTEXT` merge + `renderEmailHtml` + `resolveVariables(subject)` en 1 llamada. Esconde el `React.createElement(EmailTemplate)` feo. Usado en `apps/web/lib/email-template-render.ts` y en `app/api/webinar/[id]/broadcast`.
- `parseTemplatePayload(payload)` → `{content, settings}` — parsea string JSON o objeto, fallback a `{content:[], settings:{}}`.
- `buildTemplateContext(base, extra)` → `EmailContext` — mergea `SAMPLE_CONTEXT` + `base` + `extra` filtrando vacíos.
- `EmailVariableSection` — tipo de sección de etiquetas.

### Tipos clave

- `EmailBlock { id, type, props }` — un bloque del template.
- `EmailBlockProps` — unión de props por tipo de bloque (12 tipos: `header`, `hero`,
  `heading`, `text`, `list`, `button`, `image`, `quote`, `columns`, `divider`,
  `spacer`, `footer`).
- `EmailContext = Record<string, string>` — valores de las etiquetas.
- `EmailVariable { key, label }` y `EmailVariableSection { id, title, description?, variables }`.
- `EmailSettings { pageBackground, cardBorderWidth, cardBorderRadius }`.
- `EmailPalette { INK, DARK, GOLD, CREAM_DIM }`.
- `EmailBuilderPayload { content: EmailBlock[]; settings: EmailSettings }`.
- `BlockDefaultsMap`, `UploadImage`, `BlockDefinition`.

## Modelo de datos / persistencia

Cada template se guarda como **un solo JSON**:

```json
{
  "content": [
    { "id": "uuid", "type": "text", "props": { "text": "Hola {name}..." } }
  ],
  "settings": { "pageBackground": "#f8fafc", "cardBorderWidth": 1, "cardBorderRadius": 8 }
}
```

- `content` = bloques (las etiquetas `{}` viajan literales).
- `settings` = ajustes globales del template.
- `subject` / `name` son externos y se guardan aparte.

Para editar, se carga ese JSON y se pasa a `hydrate({ blocks: content, settings })`.

## Responsive / móvil

- **Desktop (≥1024px)**: columna lateral colapsable para el panel de opciones.
- **Móvil / pantallas pequeñas**: paleta horizontal scrolleable (`overflow-x-auto`, `min-h-[110px]` fix v0.1.0 para que no colapse), las opciones se abren en un **Sheet** (sidebar deslizante) con un botón flotante "Opciones". Ambos usan `ter-theme` en el portal para que `Dialog`/`Sheet` no se vean transparentes (fix v0.1.0: `ter-dialog-overlay`/`ter-sheet-overlay` a `0.45` + `ter-dialog-content`/`ter-sheet-content` con `ter-theme`, `border` y `shadow-xl`).

## Customización

- **Textos**: `config.labels` (i18n de la UI).
- **Bloques por defecto**: `config.blockDefaults` por tipo de bloque
  (texto, colores, tamaños, etc.) sin tocar la librería. Desde v0.1.0 `button.href` es `""` por defecto.
- **Librería completa**: `config.blockLibrary` (reemplaza los 12 bloques).
- **Marca**: `config.palette` (colores del render react-email) + `blockDefaults`.
- **Etiquetas**: `config.variableSections` (nuevo) o `config.variables` (legacy).

## Desarrollo del paquete

```bash
yarn dev          # test app (Vite) para probar el builder
yarn build        # compila la librería a dist/ (JS + style.css + tipos)
yarn check-types  # tsc -p tsconfig.app.json --noEmit
yarn lint         # eslint
```

El test app (`src/App.tsx`) muestra la integración completa: config con `variableSections` (ej. Generales/Webinar/Curso), upload de imagen, toolbar externo (Guardar con `getPayload`, preview con `EmailBody`, envío de prueba con `getHtml` + `resolve` + API simulada).

## Changelog

### v0.1.1 — 2026-08-28
- **Nuevo helper `renderTemplateEmail` en `src/core/template.ts` (server):** `renderTemplateEmail({subject, payload, context}) → {html, subject}` esconde el `React.createElement(EmailTemplate, ...)` feo. Reemplaza el uso directo de `render(<EmailTemplate>)` en `apps/web`. Exportado por `server.ts` junto a `parseTemplatePayload`/`buildTemplateContext`. `apps/web/lib/email-template-render.ts` ahora es solo `export { renderTemplateEmail } from "@repo/create-email-template/server"` (fachada limpia, 1 línea en el consumidor).
- **Fix `ref.current` en server render:** `src/core/render.tsx` y `src/core/blocks.tsx` añaden `import * as React from "react"; void React;` para que `dist/server.js` (Vite, `react` external) no deje `ref` como `undefined` al hacer `renderEmailHtml`/`renderTemplateEmail` desde `apps/web` (era el `500` del broadcast con `payload len:880`).

### v0.1.0 — 2026-08-28
- **Etiquetas por secciones:** nuevo `EmailVariableSection` + `config.variableSections` (acordeones colapsables, badge con contador, descripción por sección). `config.variables` queda como legacy (1 sola sección). Nuevo export `EmailVariableSection` y `ResolvedEmailBuilderConfig.variableSections` (flatten en `variables` para compatibilidad). `SAMPLE_CONTEXT` actualizado a `companyName:"Sin Corbatas"` + `courseName/productName/amountVes/paymentUrl/webinarSlug` para preview real.
- **Dialog etiquetas:** botón **Copiar** por etiqueta (`Copy` → `Check` verde 1.5s, `navigator.clipboard` + fallback, `ter-select-all` en el `key`), sin óvalo/borde (solo icono). Scroll global del dialog: `DialogContent` con `ter-theme` + `ter-max-h-[85vh] ter-flex ter-flex-col`, header fijo y lista `ter-flex-1 overflow-y-auto` (antes se desbordaba). Fix de transparencia: `Dialog`/`Sheet` ahora llevan `ter-theme` en el portal y overlays a `0.45` con `backdrop-blur(6px)`, `DialogContent`/`SheetContent` con `ter-bg-popover ter-border ter-shadow-xl` y fallback `var(--popover, #fff)`.
- **Bloque Button:** `defaultProps.href` pasa de `"{link}"` a `""` (vacío) tanto en `src/core/default-blocks.ts` como en el ejemplo de `apps/web` — fuerza al usuario a colocar su URL, no deja placeholder engañoso.
- **Paleta móvil:** fix `ter-min-h-[110px]` + `ter-overflow-visible` en `email-builder.tsx` para que la sección de bloques no colapse a 0px en móvil; mantiene `overflow-x-auto` horizontal. Añadidas utilidades `ter-min-h-[90/110/120px]`, `ter-max-h-[85vh]`, `ter-rotate-180`, `ter-grid-rows-[0fr/1fr]`.

## Notas

- El rich text inline usa `document.execCommand` (deprecado pero estable y
  soportado por todos los navegadores); está aislado en `inline-text-editor.tsx`
  por si decides reemplazarlo.
- El paquete NO incluye dialogs de preview ni de envío: son del consumidor.
  La librería aporta el editor y el render del correo (`EmailBody`,
  `renderEmailHtml`).
