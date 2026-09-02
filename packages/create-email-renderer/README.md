# create-email-renderer

Renderiza plantillas de email por bloques a **HTML email-safe sin React**. JS puro: funciona en Node, Cloudflare Workers, Vercel Edge, Deno y Bun.

Es el compañero de [`create-email-template`](https://www.npmjs.com/package/create-email-template) (editor visual). Comparten el mismo core, por lo que el preview del editor y el HTML del backend nunca divergen.

## Instalación

```sh
npm install create-email-renderer
```

## Uso

```ts
import { renderTemplateEmail } from "create-email-renderer";

// template.payload = el JSON guardado desde el editor: { content, settings }
const { html, subject } = await renderTemplateEmail({
  subject: "Hola {firstName}, tu webinar es el {webinarDate}",
  payload: template.payload,
  context: { firstName: "Danny", webinarDate: "12 de octubre" },
});

await emailClient.send({ to: user.email, subject, html });
```

- Las variables `{key}` se resuelven en el HTML **y en el subject**.
- Payloads corruptos o de versiones anteriores del esquema se **normalizan automáticamente** (nunca lanza por datos sucios).
- Sin bloques tras normalizar lanza `Template payload has no blocks`.

## Endpoint recomendado

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

## API

| Export | Descripción |
|---|---|
| `renderTemplateEmail(opts)` | Plantilla completa → `{ html, subject }`. |
| `renderEmailHtml(opts)` | Bloques ya parseados → HTML. |
| `parseTemplatePayload(raw)` | `string \| object \| null` → `{ content, settings }` normalizado. Nunca lanza. |
| `normalizeBlocks` / `normalizeSettings` | Normalización de payloads legacy contra la blockLibrary. |
| `buildTemplateContext` / `resolveVariables` / `extractVariables` | Contexto y variables `{key}`. |
| `renderRichText` / `sanitizeRichText` / `escapeHtml` | Pipeline de richtext (sanitize-html). |
| Defaults | `DEFAULT_BLOCK_LIBRARY`, `DEFAULT_PALETTE`, `DEFAULT_SETTINGS`, `DEFAULT_VARIABLES`, `SAMPLE_CONTEXT`. |

Subpaths: `create-email-renderer/server`, `/html-render`, `/normalize`, `/types`, `/variables`, `/richtext`, `/default-blocks`.

## Tipos de bloque

`header` · `hero` · `heading` · `text` · `list` · `button` · `image` · `quote` · `columns` · `divider` · `spacer` · `footer`

## Licencia

MIT
