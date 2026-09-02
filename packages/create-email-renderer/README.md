# create-email-renderer

Renderiza plantillas de email por bloques a **HTML email-safe sin React**. JS puro: funciona en Node, Cloudflare Workers, Vercel Edge, Deno y Bun — solo manipulación de strings, nada que compilar ni ejecutar en un runtime especial.

Es el compañero de [`create-email-template`](https://www.npmjs.com/package/create-email-template) (editor visual). Comparten el mismo core: los tipos, los defaults y la normalización son idénticos en ambos lados, por lo que el preview del editor y el HTML final nunca divergen.

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
| `settings` | `Partial<EmailSettings>` | settings del payload | Sobrescribe `{ pageBackground, cardBorderWidth, cardBorderRadius }` guardados. |
| `palette` | `EmailPalette` | `DEFAULT_PALETTE` | Sobrescribe los colores: `{ INK, DARK, GOLD, CREAM_DIM }`. |

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
| `createBlock(type, library)` | Crea un bloque nuevo con defaultProps (útil para generar plantillas por código). |
| Defaults | `DEFAULT_BLOCK_LIBRARY`, `DEFAULT_PALETTE`, `DEFAULT_SETTINGS`, `DEFAULT_VARIABLES`, `SAMPLE_CONTEXT`. |

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
```

## Licencia

MIT
