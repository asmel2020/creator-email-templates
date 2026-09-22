# Exponer `create-email-renderer` como MCP

Guía para montar un **servidor MCP** (Model Context Protocol) en el sistema donde ya está
instalado el paquete, de forma que un agente pueda listar bloques, construir correos y
renderizarlos sin conocer el JSON a mano.

El renderer es JS puro **sin React ni DOM**, así que el MCP puede correr en **Node** (stdio) o en
un **Worker** (HTTP/SSE) con el mismo código de dominio.

> Antes de escribir tools, ten a mano [`docs/BLOCKS.md`](./BLOCKS.md): es la referencia que
> deben leer los prompts para elegir `type` y props.

---

## Tools recomendadas

Mapeo directo a la API real, sin lógica de negocio propia:

| Tool | Input | Output | API que envuelve |
|---|---|---|---|
| `list_blocks` | `{}` | `[{ type, label, description, defaultProps }]` | `listBlockDefinitions()` (registry vivo, incluye plugins) |
| `get_block_schema` | `{ type }` | `{ type, label, description, defaultProps }` o `null` | `listBlockDefinitions().find(...)` |
| `build_block` | `{ type, props? }` | `EmailBlock` o `null` | `blockJson(type, props)` |
| `render_email` | `{ subject, blocks?, payload?, context?, settings?, tracking? }` | `{ html, subject }` | `templateJson` + `renderTemplateEmail` |
| `parse_template` | `{ payload }` | `{ content, settings }` | `parseTemplatePayload(payload)` |
| `validate_template` | `{ payload }` | `{ ok, warnings[], blocks }` | `parseTemplatePayload` + chequeos propios |

### Detalles de diseño

- **`list_blocks` primero**: es lo que permite que el modelo no invente tipos. Devuelve el
  `defaultProps` de cada bloque, que ya es el "esquema real" (con `type`/`label`/`description`).
- **`build_block` nunca debería recibir un `id`**: `blockJson` lo genera. Si el modelo se empeña,
  ignóralo.
- **`render_email` acepta `blocks` (array) o `payload` (lo guardado)**; si vienen ambos, gana
  `payload`.
- **Archivos**: `settings.files` viaja dentro del payload; `render_email` lista en el HTML los que
  tengan `link !== false` y tú decides los adjuntos reales con los que tengan `attach: true`
  (`parse_template` te devuelve los settings ya normalizados).
- **`validate_template`** es el guardarraíl: cuenta los bloques descartados por tipo desconocido,
  avisa de `href` vacíos en CTAs, de imágenes sin `src` y del peso del HTML (Gmail recorta a
  ~102 KB).
- **Estados**: no inventes tools que muten la plantilla guardada; el renderer solo transforma
  JSON a HTML. El guardado es de tu backend.

## Ejemplo mínimo (Node, stdio)

```ts
// mcp-server.ts — `npm i create-email-renderer @modelcontextprotocol/sdk zod`
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  blockJson,
  listBlockDefinitions,
  renderTemplateEmail,
  parseTemplatePayload,
  templateJson,
} from "create-email-renderer";

const server = new McpServer({ name: "email-builder", version: "1.0.0" });

server.tool("list_blocks", {}, async () => ({
  content: [
    {
      type: "text",
      text: JSON.stringify(
        listBlockDefinitions().map((d) => ({
          type: d.type,
          label: d.label,
          description: d.description,
          defaultProps: d.defaultProps,
        })),
      ),
    },
  ],
}));

server.tool(
  "build_block",
  { type: z.string(), props: z.record(z.unknown()).optional() },
  async ({ type, props }) => {
    const block = blockJson(type, props as never);
    return {
      content: [
        {
          type: "text",
          text: block
            ? JSON.stringify(block)
            : `Tipo desconocido "${type}". Usa list_blocks para ver los válidos.`,
        },
      ],
    };
  },
);

server.tool(
  "render_email",
  {
    subject: z.string(),
    blocks: z.array(z.unknown()).optional(),
    payload: z.unknown().optional(),
    context: z.record(z.string()).optional(),
    settings: z.record(z.unknown()).optional(),
    tracking: z.record(z.unknown()).optional(),
  },
  async ({ subject, blocks, payload, context, settings, tracking }) => {
    const { html, subject: resolved } = await renderTemplateEmail({
      subject,
      payload: payload ?? templateJson((blocks ?? []) as never, settings as never),
      context,
      settings: settings as never,
      tracking: tracking as never,
    });
    return { content: [{ type: "text", text: html }], structuredContent: { subject: resolved, html } };
  },
);

server.tool(
  "parse_template",
  { payload: z.unknown() },
  async ({ payload }) => ({
    content: [{ type: "text", text: JSON.stringify(parseTemplatePayload(payload)) }],
  }),
);

server.tool(
  "validate_template",
  { payload: z.unknown() },
  async ({ payload }) => {
    const { content, settings } = parseTemplatePayload(payload);
    const warnings: string[] = [];
    if (content.length === 0) warnings.push("No queda ningún bloque tras normalizar.");
    const count = (t: string) => content.filter((b) => b.type === t).length;
    for (const t of ["checkout", "product", "pricing"]) {
      if (count(t) > 0 && !JSON.stringify(content.find((b) => b.type === t)).includes("https://")) {
        warnings.push(`${t}: revisa que tenga enlaces/imágenes reales.`);
      }
    }
    return {
      content: [{ type: "text", text: JSON.stringify({ ok: warnings.length === 0, warnings, blocks: content.length }, null, 2) }],
      structuredContent: { ok: warnings.length === 0, warnings, content, settings },
    };
  },
);

await server.connect(new StdioServerTransport());
```

Registro en el cliente MCP (ejemplo Claude Desktop / opencode):

```json
{
  "mcpServers": {
    "email-builder": {
      "command": "node",
      "args": ["/ruta/absoluta/mcp-server.js"]
    }
  }
}
```

## Variante Cloudflare Workers (HTTP)

- Igual que arriba, pero en vez de `StdioServerTransport` monta el handler en un `fetch` y aplica
  **`nodejs_compat`** si tu SDK lo pide.
- El renderer ya está pensado para Workers: `id.ts` no usa `crypto` ni `Math.random`, y no hay
  dependencias de Node.

## Prompt sugerido para el agente

```
Eres un asistente que arma correos con create-email-renderer.
Flujo obligatorio:
1) list_blocks para conocer los tipos y sus defaultProps.
2) build_block(type, props) para cada bloque (NO escribas el JSON a mano ni pongas ids).
3) render_email({ subject, blocks, context }) para obtener el HTML.
4) validate_template({ payload }) antes de dar por bueno el correo.
Reglas: variables con {clave}; imágenes con URLs https (nunca data:);
los registros van en lines/products/images/links/entries/plans (nunca items);
un solo nivel de anidamiento; un footer por correo.
```

## Checklist antes de publicar el MCP

- [ ] `list_blocks` devuelve los 25 tipos (o los del registry que registres).
- [ ] `build_block` con un tipo inválido responde un mensaje claro, no un crash.
- [ ] `render_email` con `payload` inválido no tumba el server (el renderer ya tolera basura).
- [ ] `validate_template` avisa de bloques descartados, `href` vacíos, imágenes sin `src` y peso > 102 KB.
- [ ] Nada de estado global mutable: cada tool es una función pura sobre el JSON.
