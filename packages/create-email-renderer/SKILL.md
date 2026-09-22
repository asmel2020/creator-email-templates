---
name: create-email-renderer
description: Render and build email templates as JSON blocks into email-safe HTML without React (Node, Workers, edge)
licence: MIT
metadata:
  author: asmel2020
  version: 1.0.0
---

# Skill: `create-email-renderer`

Renderiza plantillas de email **por bloques** (JSON → HTML email-safe) **sin React**. JS puro:
corre en Node, Cloudflare Workers, Vercel Edge, Deno y Bun. Es el compañero sin UI de
`create-email-template` (el editor visual): comparten el mismo core, así que el preview del
editor y el HTML final nunca divergen.

- 📖 Catálogo de los **25 bloques** (props, defaults, variantes, ejemplos): [`docs/BLOCKS.md`](./docs/BLOCKS.md)
- 🔌 Cómo exponerlo como **MCP**: [`docs/MCP.md`](./docs/MCP.md)

---

## Cuándo usar esto

| Quieres… | Usa |
|---|---|
| Mandar un correo desde el back-end a partir de una plantilla guardada | `renderTemplateEmail` |
| Construir el correo por código (sin editor) | `blockJson` + `templateJson` |
| Inyectar datos reales (carrito, pedido, productos) en una plantilla guardada | mutar `content` del payload y renderizar |
| Leer/limpiar un payload viejo o sucio | `parseTemplatePayload` / `normalizeBlocks` |
| Píxel de apertura y tracking de clics | opción `tracking` |

## Instalación

```sh
npm install create-email-renderer
```

Sin React, sin DOM, sin peer deps. Única dependencia: `sanitize-html`.

## Modelo mental (30 segundos)

```
payload = { content: EmailBlock[], settings }      ← lo que guarda el editor
            └── block = { id, type, props }        ← uno de los 25 tipos
```

1. **`content`** es una lista ordenada de bloques. Cada bloque tiene un `type` y sus `props`.
2. Lo que no venga en `props` se completa con el **default del esquema**, y lo desconocido se
   descarta (`normalizeBlocks`) → **añadir props nuevas no rompe plantillas viejas**.
3. Las variables `{clave}` se resuelven con el `context` en tiempo de render.
4. El HTML final es tablas con estilos inline (`<table role="presentation">`), email-safe.

## Los 3 flujos

```
① Editor (create-email-template) ──getPayload()──▶ { content, settings } ──PUT──▶ tu backend
② Tu backend ──renderTemplateEmail({ subject, payload, context })──▶ { html, subject } ──▶ ESP
③ Tu backend ──blockJson()/templateJson()──▶ payload ──▶ mismo render (sin editor de por medio)
```

## Recetas (tarea → API)

### Renderizar una plantilla guardada

```ts
import { renderTemplateEmail } from "create-email-renderer/server";

const { html, subject } = await renderTemplateEmail({
  subject: "Hola {firstName}",                 // resuelve variables
  payload: template.payload,                   // string JSON u objeto {content, settings}
  context: { firstName: user.name },
  settings: { cardBorderWidth: 0 },            // sobrescribe los settings guardados
  palette: { INK: "#111", DARK: "#000", GOLD: "#d7b227", CREAM_DIM: "#aaa" },
});
```

- `payload` tolera `null`/string inválido (devuelve vacío) pero **lanza** `Template payload has no blocks` si tras normalizar no queda ningún bloque.
- No re-exporta `renderEmailHtml` (el paquete UI tiene su versión React con el mismo nombre). Para el HTML puro: `create-email-renderer/html-render`.

### Construir un bloque (tipado, con defaults e ids)

```ts
import { blockJson, templateJson } from "create-email-renderer";

blockJson("image", { src: "https://…/foto.jpg", alt: "Foto" });
blockJson("checkout", { lines: [{ name: "Camiseta", price: "$20" }] }); // id/quantity se rellenan
blockJson("columns", { columns: [{ blocks: [["text", { text: "Hola" }]] }] });

templateJson([/* bloques */], { fontFamily: "" }); // → { content, settings } listo para render
```

- Posicional y **tipado** (`blockJson("image", {` autocompleta solo las props de `image`).
- Tipo desconocido → `null` (y `templateJson` lo descarta).
- **Nunca administras ids**: se generan para el bloque y para cada registro.
- Hijos: acepta `blockJson(...)`, `[type, props]` o `{ type, props }`; respeta `MAX_BLOCK_DEPTH = 1`.

### Inyectar el carrito / datos del pedido

```ts
import { parseTemplatePayload } from "create-email-renderer";

const { content, settings } = parseTemplatePayload(template.payload);
const blocks = content.map((b) =>
  b.type === "checkout"
    ? { ...b, props: { ...b.props, heading: "Tu pedido está listo",
        lines: cart.items.map((i) => ({ name: i.name, price: i.price, quantity: String(i.qty) })) } }
    : b,
);
const html = await renderEmailHtml({ blocks, subject, context, settings });
```

`normalize` repara ids/tipos de los registros, así que puedes construir el array "flojo".
Ver [`docs/BLOCKS.md`](./docs/BLOCKS.md) para las props de cada bloque y
[`docs/MCP.md`](./docs/MCP.md) para exponer esto como tool.

### Tracking (opt-in, por envío)

```ts
await renderTemplateEmail({
  subject, payload, context,
  tracking: {
    pixelUrl: "https://track.mi-app.com/o?cid=123&e={email}",   // apertura 1×1
    clickUrl: "https://track.mi-app.com/c?cid=123&u={url}",     // clics
    utm: { source: "email", medium: "email", campaign: "carrito" },
    // exclude: ["/baja"], transformLink: (href) => …
  },
});
```

Nunca se guarda en la plantilla (no contamina el preview) y con `tracking` apagado la salida es
idéntica. La baja (`/baja`, `unsubscribe`, `mailto:`…) **no** se reescribe ni con `exclude` por
defecto.

### Otros helpers

| Export | Para qué |
|---|---|
| `parseTemplatePayload(raw)` | `{ content, settings }` normalizado, nunca lanza. |
| `normalizeBlocks(input, library?)` / `normalizeSettings(input)` | Limpiar payloads legacy. |
| `resolveVariables(text, ctx)` / `extractVariables` / `validateVariables` | Variables `{key}`. |
| `buildTemplateContext(base, extra?)` | Contexto limpio (quita `null`/`""`) sobre `SAMPLE_CONTEXT`. |
| `renderRichText` / `sanitizeRichText` / `escapeHtml` | Pipeline de rich text. |
| `DEFAULT_BLOCK_LIBRARY` / `DEFAULT_PALETTE` / `DEFAULT_SETTINGS` / `SAMPLE_CONTEXT` | Defaults. |
| `listBlockDefinitions()` / `registerBlock()` | Registry vivo: catálogo y plugins. |

## Subpaths

```
create-email-renderer                  → todo
create-email-renderer/server           → parseTemplatePayload, renderTemplateEmail, buildTemplateContext
create-email-renderer/html-render      → renderEmailHtml
create-email-renderer/build            → blockJson, templateJson
create-email-renderer/normalize        → normalizeBlocks, normalizeSettings
create-email-renderer/types            → tipos (EmailBlock, EmailBlockType, EmailSettings…)
create-email-renderer/variables        → variables + contextos
create-email-renderer/richtext         → helpers de rich text
create-email-renderer/default-blocks   → defaults de bloques, paleta y settings
create-email-renderer/registry         → registerBlock, listBlockDefinitions
```

## Reglas de oro (no las rompas)

1. **Este paquete nunca depende de React** ni de nada que lo arrastre. Si algo necesita DOM/JSX,
   pertenece a `create-email-template`.
2. **El core vive aquí**: tipos, defaults, normalización y preset de bloques. El paquete UI los
   reexporta con shims de una línea. No dupliques esa lógica.
3. **Todo helper nuevo debe ser puro y no-lanzador** con datos corruptos (salvo `blockJson` con
   tipo desconocido → `null`, y `renderTemplateEmail` sin bloques → throw).
4. **Es aditivo por diseño**: no cambies defaults ni el HTML existente sin querer; hay un snapshot
   de paridad por tipo de bloque para vigilarlo.

## Errores comunes

| Síntoma | Causa |
|---|---|
| `Template payload has no blocks` | Todo el `content` se descartó al normalizar (tipos desconocidos). |
| `{firstName}` sale literal en el correo | La clave no está en el `context` (las desconocidas se dejan tal cual). |
| El correo se ve con otra tipografía | `settings.fontFamily` vacío ⇒ hereda la del cliente; pon un stack. |
| Las imágenes se estiran | `imageHeight` con `object-fit` en Outlook escritorio; usa `0`. |
| Las imágenes no cargan en Gmail | Son `data:` (SVG inline); Gmail las descarta. Usa URLs `https:`. |
| Un array de registros queda vacío | Usaste `items` para registros: los registros van en `lines`/`products`/… |
| El bloque anidado desaparece | `MAX_BLOCK_DEPTH = 1`: los hijos no pueden contener bloques. |

## Verificación antes de dar algo por hecho

```sh
pnpm --filter create-email-renderer test     # snapshots de paridad + unitarios
pnpm lint && pnpm check-types && pnpm build
```
