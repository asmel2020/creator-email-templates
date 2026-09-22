# create-email-renderer

Renderiza plantillas de email por bloques a **HTML email-safe sin React**. JS puro: funciona en Node, Cloudflare Workers, Vercel Edge, Deno y Bun — solo manipulación de strings, nada que compilar ni ejecutar en un runtime especial.

Es el compañero de [`create-email-template`](https://www.npmjs.com/package/create-email-template) (editor visual). Comparten el mismo core: los tipos, los defaults y la normalización son idénticos en ambos lados, por lo que el preview del editor y el HTML final nunca divergen.

## ¿Programas con una IA o vas a integrarlo?

La documentación para agentes viaja dentro del paquete:

- **[`SKILL.md`](./SKILL.md)** — orientación: modelo mental del payload, los 3 flujos, recetas
  (tarea → API) y reglas de oro.
- **[`docs/BLOCKS.md`](./docs/BLOCKS.md)** — catálogo de los **25 bloques** con props, defaults,
  variantes y ejemplos `blockJson` copiables.
- **[`docs/MCP.md`](./docs/MCP.md)** — cómo exponer el renderer como **servidor MCP** (tools
  `list_blocks`, `build_block`, `render_email`, `validate_template`…).
- **[`llms.txt`](./llms.txt)** — índice corto para herramientas que lo buscan por convención.

## Instalación

```sh
npm install create-email-renderer
```

Sin React, sin DOM, sin peer dependencies. Única dependencia: `sanitize-html`.

## `renderTemplateEmail` — el que usarás el 95% del tiempo

Toma el payload JSON guardado desde el editor y devuelve el HTML final con las variables resueltas:

```ts
import { renderTemplateEmail } from "create-email-renderer";

const { html, subject } = await renderTemplateEmail({
  subject: "Hola {firstName}, tu webinar es el {webinarDate}",
  payload: template.payload,        // string JSON u objeto { content, settings }
  context: {                        // tus datos reales
    firstName: user.name,
    webinarDate: "12 de octubre",
    registerUrl: "https://mi-sitio.com/registro",
  },
});

await emailClient.send({ to: user.email, subject, html });
```

### Opciones

| Opción | Tipo | Default | Descripción |
|---|---|---|---|
| `subject` | `string` | — (obligatorio) | Asunto del correo. **Resuelve variables**: `"Hola {firstName}"` → `"Hola Danny"`. También queda en `<title>` y en el preview oculto del email. |
| `payload` | `string \| object \| null` | — | El JSON del editor. Tolera `null`/`undefined`/string inválido (devuelve vacío). |
| `context` | `EmailContext` | `SAMPLE_CONTEXT` | Valores para las variables `{key}`. Se mezcla sobre `SAMPLE_CONTEXT`, así que los correos de prueba siempre se ven completos aunque falten claves. |
| `settings` | `Partial<EmailSettings>` | settings del payload | Sobrescribe `{ pageBackground, cardBorderWidth, cardBorderRadius, fontFamily }` guardados. |
| `palette` | `EmailPalette` | `DEFAULT_PALETTE` | Sobrescribe los colores: `{ INK, DARK, GOLD, CREAM_DIM }`. |
| `tracking` | `EmailTracking` | — | Trackeo **por envío**: pixel de apertura y reescritura de enlaces. Ver [Trackeo](#trackeo-aperturas-y-clics). |

**Comportamiento**: lanza `Template payload has no blocks` si tras normalizar no queda ningún bloque. En cualquier otro caso de datos sucios, normaliza sin quejarse (ver [Normalización](#normalización-de-payloads)).

## `renderEmailHtml` — bloques ya parseados

Si tú ya tienes los bloques normalizados y quieres el HTML directo:

```ts
import { renderEmailHtml } from "create-email-renderer";

const html = await renderEmailHtml({
  blocks: [
    { id: "1", type: "header", props: { brandName: "Mi Marca" } },
    { id: "2", type: "button", props: { label: "Ver más", href: "{link}" } },
  ],
  subject: "Bienvenida {firstName}",
  context: { firstName: "Ana", link: "https://mi-sitio.com" },
  // settings?: Partial<EmailSettings>
  // palette?: EmailPalette
});
```

## Variables disponibles por defecto

Cualquier texto del editor acepta `{key}`. Estas son las incluidas en `DEFAULT_VARIABLES`:

**Base:** `name`, `firstName`, `lastName`, `email`, `phone`, `role`, `companyName`, `unsubscribeUrl`, `link`, `date`, `year`, `siteUrl`, `supportEmail`

**Contextuales:** `webinarName`, `webinarDate`, `webinarTime`, `webinarDuration`, `webinarUrl`, `registerUrl`, `liveUrl`, `slotsLeft`, `reminderDate`, `webinarHost`, `completeRegistrationUrl`, `resetPasswordUrl`, `confirmEmailUrl`

Las resuelves pasando `context`; las claves que falten se mezclan con `SAMPLE_CONTEXT` (valores de ejemplo). Para usar otras, define tus propias variables en el editor (`config.variables`) y pásalas aquí en el `context`.

## Normalización de payloads

Los payloads guardados con versiones anteriores del esquema (props que ya no existen, campos faltantes, tipos desconocidos, ids perdidos) se **auto-reparan**. `parseTemplatePayload` normaliza automáticamente, y puedes usar las funciones directamente:

```ts
import { normalizeBlocks, normalizeSettings } from "create-email-renderer";

const blocks = normalizeBlocks(jsonMigrado.content, miBlockLibraryCustom?);
// → descarta tipos desconocidos, completa props con defaults del esquema actual,
//   repara ids faltantes y coacciona tipos ("17" → 17). Nunca lanza.
```

Esto significa que **añadir props nuevas a un bloque no rompe las plantillas ya guardadas**: se auto-completan al cargarse o renderizarse, sin script de migración.

## Otros helpers

| Export | Descripción |
|---|---|
| `parseTemplatePayload(raw)` | `string \| object \| null` → `{ content, settings }` normalizado. Nunca lanza. |
| `buildTemplateContext(base, extra?)` | Limpia `null`/`""` de `extra` y mezcla sobre `SAMPLE_CONTEXT`. |
| `resolveVariables(text, ctx)` | Reemplaza `{key}` en un texto. |
| `extractVariables(text)` / `validateVariables(text, knownKeys)` | Inspección de variables usadas/no reconocidas. |
| `renderRichText(html)` | Sanitiza y aplica estilos inline al rich text del editor. |
| `sanitizeRichText` / `escapeHtml` / `normalizeBlockHtml` / `isRichText` | Piezas del pipeline por separado. |
| `blockJson(type, props?)` | Constructor **tipado** de un bloque: defaults del esquema, coerción de tipos e ids automáticos. Tipo desconocido → `null`. |
| `templateJson(blocks, settings?)` | Arma el payload completo (`{ content, settings }`) para `renderTemplateEmail`. |
| `createBlock(type, library)` | Crea un bloque nuevo con defaultProps (helper de bajo nivel del editor). |
| Defaults | `DEFAULT_BLOCK_LIBRARY`, `DEFAULT_PALETTE`, `DEFAULT_SETTINGS`, `DEFAULT_VARIABLES`, `SAMPLE_CONTEXT`. |

## Construir bloques desde el back-end (`blockJson`)

Para inyectar contenido que no vive en la plantilla (un producto, un carrito, una imagen) no
hace falta escribir el JSON a mano: `blockJson` parte de los **defaults del esquema vivo**,
coacciona tipos, genera los ids y completa los arrays de registros.

```ts
import { blockJson, templateJson } from "create-email-renderer";

// Un bloque suelto: lo que no pases queda con su default.
const promo = blockJson("image", { src: "https://…/promo.jpg", alt: "Promo" });

// Carrito real: los registros se completan solos (id, imageUrl, quantity…).
const carrito = blockJson("checkout", {
  heading: "Tu pedido está listo",
  lines: cart.items.map((i) => ({ name: i.name, price: i.price, quantity: String(i.qty) })),
});

// Correo completo listo para enviar.
const { html, subject } = await renderTemplateEmail({
  subject: "Tu pedido {orderId}",
  payload: templateJson([promo, carrito], { cardBorderWidth: 0 }),
  context: { orderId: "A-123" },
});
```

- **Posicional**: `blockJson(type, props?)` y `templateJson(blocks, settings?)`.
- **Tipado**: el editor autocompleta solo las props del tipo elegido; una prop inexistente es error de compilación.
- **Tolerante**: un tipo desconocido devuelve `null` (y `templateJson` lo descarta).
- **Anidamiento**: `columns` / `blocks` aceptan `blockJson(...)`, el atajo `[type, props]` o `{ type, props }`; se respeta la profundidad máxima (`MAX_BLOCK_DEPTH`).
- **Ids**: nunca los administras, se generan con `newId()`.

## Trackeo (aperturas y clics)

Opcional y **por envío** (no se guarda en la plantilla, así que el preview del editor nunca
lleva pixel). Con `tracking` apagado la salida es idéntica a no usarlo.

```ts
await renderTemplateEmail({
  subject: "Tu carrito te espera",
  payload,
  context: { email: "ana@ejemplo.com" },
  tracking: {
    pixelUrl: "https://track.mi-app.com/o?cid=cart-123&e={email}",   // apertura (1×1)
    clickUrl: "https://track.mi-app.com/c?cid=cart-123&u={url}",     // clics
    utm: { source: "email", medium: "email", campaign: "carrito" },
    exclude: ["/baja"],                                            // extra opcional
    // transformLink: (href) => `https://mi-redirect/?to=${encodeURIComponent(href)}`,
  },
});
```

| Campo | Qué hace |
|---|---|
| `pixelUrl` | Inyecta un `<img width="1" height="1">` antes de `</body>`. Acepta `{variables}`. |
| `clickUrl` | Reescribe cada `<a href>`: el destino va en `{url}` (codificado) y el tracker recibe las mismas `{variables}`. |
| `utm` | Añade `utm_*` al destino **antes** de pasarlo por el tracker (respeta los parámetros que ya existían). |
| `exclude` | Substrings de href que no se reescriben; se suman a los de por defecto (`mailto:`, `tel:`, `sms:`, `#`, `unsubscribe`, `/baja`, `optout`…). |
| `transformLink` | Control total: devuelve el href final tú mismo. |

**Caveats honestos**

- Las **aperturas** ya no son fiables: Apple Mail precarga las imágenes (MPP) y Gmail las sirve
  por proxy. Úsalo como tendencia, no como verdad.
- El **click tracking** cambia la URL visible al pasar el ratón y la vista previa del enlace en
  algunos clientes; y **nunca** debe pasar por el tracker el enlace de baja.
- Si tu ESP (Mailflare, Resend, SES…) ya trackea, no lo dupliques: aquí tienes `transformLink`
  como salida de emergencia.

## Tipografía

El correo lleva un **stack de fuentes de sistema** (lista ordenada: el cliente usa la primera que
tenga instalada) para no depender de la fuente por defecto del cliente —que en Gmail/Outlook suele
ser Times New Roman—:

```ts
await renderTemplateEmail({
  subject: "Hola",
  payload,
  settings: { fontFamily: "Georgia, 'Times New Roman', serif" }, // o "" para no emitir nada
});
```

`FONT_STACKS` trae 7 grupos listos (Sistema, Arial/Helvetica, Verdana/Tahoma, Trebuchet MS,
Georgia, Times New Roman y Monoespaciada) y `DEFAULT_SETTINGS.fontFamily` es el stack de sistema.
Las **webfonts** (`@font-face`) no son fiables: Gmail las elimina y Outlook escritorio las ignora,
así que conviene dejar siempre un fallback de sistema al final del stack.

## Subpaths

Todo está disponible desde la raíz. Si prefieres imports granulares (menos bundle en serverless):

```
create-email-renderer/server          → parseTemplateEmail, renderTemplateEmail, buildTemplateContext
create-email-renderer/html-render     → renderEmailHtml
create-email-renderer/normalize       → normalizeBlocks, normalizeSettings
create-email-renderer/types           → todos los tipos + createBlock
create-email-renderer/variables       → variables, contextos y resolve
create-email-renderer/richtext        → helpers de rich text
create-email-renderer/default-blocks  → defaults de bloques, paleta y settings
create-email-renderer/build           → blockJson, templateJson
```

## Licencia

MIT
