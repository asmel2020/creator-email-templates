# AGENTS.md

Guía operativa para agentes de código (y humanos) que trabajan en este monorepo. Contiene estructura, arquitectura, API, convenciones, advertencias y estrategia de testing. El `README.md` es la cara pública npm; **este archivo es la fuente de verdad técnica**.

---

## 1. Overview

| Aspecto | Valor |
|---|---|
| Stack | Turborepo + pnpm 9 (`packageManager: pnpm@9.0.0`) + TypeScript ~6 + Vite 8 (rolldown) |
| Node | >= 18 |
| React | peer `^18.0.0 \|\| ^19.0.0` — **solo** en `create-email-template` |
| Paquetes | `create-email-template` (UI React), `create-email-renderer` (core puro, **sin React**) |

**Regla de oro #1: `create-email-renderer` NUNCA depende de React ni de nada que lo arrastre.** Es JS puro (strings + `sanitize-html`), consumible en Node, Workers, edge, y también en el browser (la demo lo usa para simular el backend). Si un módulo necesita React, pertenece a `create-email-template`.

**Regla de oro #2: el core compartido vive en el renderer.** Tipos, defaults, variables, richtext y normalización se definen ahí; `create-email-template` los reexporta mediante shims de una línea. Nunca dupliques lógica del modelo entre paquetes.

---

## 2. Comandos

Todos desde la raíz salvo indicación contraria. Turbo respeta el orden renderer → template → apps (`dependsOn: ["^build"]`).

| Comando | Qué hace |
|---|---|
| `pnpm install` | Instala y enlaza workspaces. **Obligatorio** tras añadir una dependencia a cualquier package.json. |
| `pnpm build` | Build de todo: `tsc` (renderer) y `vite build` + `tsc -p tsconfig.build.json` (template), apps con `tsc -b && vite build`. |
| `pnpm dev` | Dev de todas las apps (turbo, persistente). |
| `pnpm lint` | ESLint en packages que lo definen (renderer usa `tsc --noEmit`). |
| `pnpm check-types` | `tsc --noEmit` en todos los paquetes. |
| `pnpm --filter vite-test dev` | Solo la app demo → `http://localhost:5173/email-builder` (ruta pública, sin login). |
| `pnpm --filter create-email-renderer build` | Solo el renderer (tsc, emite `dist/` con `.d.ts`). |
| `pnpm --filter create-email-template build` | Solo la librería UI (vite lib mode → `dist/index.js` + `dist/style.css`). |

Los builds son la principal verificación: `tsc -b` en las apps compila contra el `dist` de los paquetes, así que un build de `vite-test` en verde valida la API pública completa.

---

## 3. Estructura del monorepo

```
apps/
├── vite-test/            # App demo (TanStack Router, Tailwind v4, shadcn/base-ui).
│   └── src/features/email-builder/   # Feature de integración — EJEMPLO DE REFERENCIA
│       ├── page.tsx                  # Composición: provider + toolbar + builder + dialogs
│       ├── config.ts                 # Config de muestra + onSaveDemo (backend simulado)
│       ├── stores/use-email-builder-dialogs.ts
│       └── components/               # editor-toolbar, preview-dialog, dialogs (orquestador), autosave-indicator
├── template-back-end/    # API Hono + Cloudflare Workers + D1 (tiene el renderer instalado;
│   │                     # el endpoint de plantillas aún NO está implementado)
└── api/
packages/
├── create-email-template/   # create-email-template — builder UI (React)
│   ├── vite.config.ts       # lib mode: entry único src/index.ts, cssFileName "style"
│   └── src/
│       ├── index.ts         # TODA la API pública (import "./index.css" side-effect)
│       ├── core/            # shims 1-línea hacia create-email-renderer
│       │   ├── blocks.tsx   # EmailTemplate/BlockRenderer react-email (SOLO preview cliente)
│       │   ├── render.tsx   # renderEmailHtml (versión React, preview; usa @react-email/render)
│       │   ├── normalize.ts / types.ts / variables.ts / richtext.ts / default-blocks.ts / template.ts
│       │   └── id.ts        # shim: reexporta newId del renderer
│       ├── config/          # types.ts (EmailBuilderConfig, AutosaveOptions, labels) + defaults.ts (resolve)
│       ├── store/           # vanilla-store.ts (store genérico), create-email-builder-store.ts (estado+undo),
│       │                    # email-builder-provider.tsx (contextos), autosave-context.tsx
│       ├── hooks/           # use-email-builder, use-render-email, use-autosave
│       └── components/      # builder/ (email-builder, canvas, block-palette, properties-panel,
│                            # editable-block-renderer, inline-text-editor, selection-toolbar,
│                            # sortable-item, variables-info-dialog, settings-dialog) + ui/ (button, dialog, sheet…) + index.css
└── create-email-renderer/   # create-email-renderer — core puro + render HTML
    ├── tsconfig.json        # NodeNext ⇒ imports relativos CON extensión ".js"
    └── src/
        ├── index.ts         # exporta todo; subpaths: /server /html-render /normalize /types /variables /richtext /default-blocks /build
        ├── types.ts         # EmailBlock/Props/Settings/Palette/Context + createBlock/buildBlockMap
        ├── default-blocks.ts # DEFAULT_BLOCK_LIBRARY (26 tipos), DEFAULT_PALETTE, DEFAULT_SETTINGS
        ├── variables.ts     # DEFAULT_VARIABLES, SAMPLE_CONTEXT, resolveVariables ({key})
        ├── richtext.ts      # sanitize-html: renderRichText/sanitizeRichText/escapeHtml/normalizeBlockHtml
        ├── normalize.ts     # normalizeBlocks/normalizeSettings (defensa contra payloads legacy)
        ├── html-render.ts   # renderEmailHtml: JSON → HTML email-safe (tablas + inline styles)
        ├── build.ts         # blockJson(type, props?) / templateJson: constructor tipado de bloques
        ├── tracking.ts      # applyTracking: pixel de apertura + reescritura de enlaces (opt-in)
        ├── SKILL.md         # orientación para agentes (se publica: va en "files")
        ├── docs/BLOCKS.md   # catálogo de los 26 bloques (props, variantes, ejemplos) — lo vigila test/docs.test.ts
        ├── docs/MCP.md      # cómo exponer el paquete como servidor MCP
        ├── llms.txt         # índice corto para agentes (convención llms.txt)
        ├── records.ts       # interno: coerción + RECORD_ARRAY_FIELDS (normalize y build)
        ├── server.ts        # parseTemplatePayload (normaliza), renderTemplateEmail, buildTemplateContext
        └── id.ts            # newId = UUID v7-like (timestamp + contador), sin crypto/Math.random (Workers)
```

Demo clave: `apps/vite-test/src/routes/email-builder.tsx` es una ruta pública que solo importa la feature; `.agents/skills/manage-dialogs-zustand/SKILL.md` define el patrón de dialogs que usa. El skill `.agents/skills/create-email-builder/SKILL.md` es el puntero de repo a toda la documentación para agentes.

---

## 4. Arquitectura

### 4.1 Grafo de dependencias

```
create-email-renderer   (sin React; deps: sanitize-html)
        ▲  workspace:*
create-email-template   (React peer; deps: react-email, dnd-kit, base-ui…)
        ▲  workspace:*
apps/vite-test ── apps/template-back-end
```

El paquete UI *incluye* el código del renderer en su bundle (`vite build` no lo externaliza). El backend instala **solo** el renderer.

### 4.2 Ciclo de vida del payload

```
Editor ──getPayload()──▶ { content: EmailBlock[], settings }  ──PUT──▶ Backend
                                              │
                              parseTemplatePayload() ── normalizeBlocks/normalizeSettings
                                              │
                              renderEmailHtml() ──▶ HTML email-safe ──▶ cliente de correo
                                              │
                              return { json, html } ──▶ lastResult (useAutosaveStatus)
```

- `hydrate({ blocks, settings })` en el editor **también normaliza** (contra la blockLibrary resuelta del config) y **reinicia el historial de undo** (nueva base) con `dirty: false`.
- El undo marca `dirty: true` → el autoguardado persiste el estado deshecho en el siguiente tick.
- El `subject` NO vive en el payload: lo maneja el backend (`renderTemplateEmail` lo resuelve con variables).

### 4.3 Orden de compilación y cachés

1. `pnpm build` compila renderer primero (turbo). Si tocas el renderer, reconstrúyelo antes de probar en apps.
2. El dev server de Vite puede servir transformaciones cacheadas de paquetes workspace. Si tras `pnpm install` o rebuild ves imports que no resuelven o código viejo: reload duro; si persiste, borrar `apps/*/node_modules/.vite` y reiniciar el dev server.

---

## 5. API pública

### `create-email-renderer` (backend / core)

| Export | Firma / notas |
|---|---|
| `renderTemplateEmail({ subject, payload, context?, settings?, palette?, tracking? })` | Async → `{ html, subject }`. Los `settings.files` del payload alimentan el bloque `downloads`. `payload` acepta string/objeto/null. Lanza solo si no quedan bloques tras normalizar. |
| `renderEmailHtml({ blocks, subject?, context?, settings?, palette? })` | Async → HTML string. Subpath `/html-render`. |
| `parseTemplatePayload(raw)` | → `{ content, settings }`. **Normaliza** (normalizeBlocks + normalizeSettings) y nunca lanza. |
| `normalizeFiles(input)` | Repara `settings.files`: ids, nombre derivado de la URL, `size` numérico, defaults `link: true`/`attach: false` y **whitelist de esquemas** (`http`/`https`/`data`); tope 50. Subpath `/normalize`. |
| `normalizeBlocks(input, library?)` / `normalizeSettings(input)` | Normalización de payloads legacy: descarta tipos desconocidos, completa props desde defaults, repara ids, coacciona tipos. Subpath `/normalize`. |
| `buildTemplateContext(base, extra?)` | Limpia null/"" y mezcla sobre `SAMPLE_CONTEXT`. |
| `blockJson(type, props?)` | Constructor **tipado** de un bloque: defaults del esquema vivo + coerción + ids automáticos (bloque y registros) + hijos (`columns`/`blocks` aceptan `[type, props]`, `{type, props}` o un `EmailBlock`). Tipo desconocido → `null`. Subpath `/build`. |
| `templateJson(blocks, settings?)` | → `{ content, settings }` listo para `renderTemplateEmail({ payload })`; filtra los `null`. |
| `applyTracking(html, tracking, context)` | Post-proceso del HTML: inyecta el pixel de apertura y reescribe los `<a href>` (respeta exclusiones). Lo llaman `renderEmailHtml`/`renderTemplateEmail` cuando pasas `tracking`. |
| `resolveVariables(text, ctx)` / `extractVariables` / `validateVariables` | Sintaxis `{key}`. |
| `renderRichText` / `sanitizeRichText` / `escapeHtml` / `normalizeBlockHtml` / `isRichText` | Pipeline richtext (sanitize-html). |
| Defaults | `DEFAULT_BLOCK_LIBRARY`, `DEFAULT_PALETTE`, `DEFAULT_SETTINGS`, `DEFAULT_VARIABLES`, `DEFAULT_BASE_VARIABLES`, `DEFAULT_CONTEXTUAL_VARIABLES`, `SAMPLE_CONTEXT`. |

**Documentación publicada con el paquete** (viaja en `npm install`, `files: ["dist","SKILL.md","llms.txt","docs"]`): `SKILL.md` (orientación para agentes), `docs/BLOCKS.md` (catálogo de los 26 bloques con props/defaults/variantes y ejemplos `blockJson`), `docs/MCP.md` (tools y código para montar un MCP) y `llms.txt`. En `create-email-template` solo `SKILL.md` + `llms.txt` (el catálogo es el del renderer). `test/docs.test.ts` falla si un bloque o una API deja de estar documentado.
| Tipos | `EmailBlock`, `EmailBlockType` (26), `EmailBlockProps` (unión por tipo), `ColumnDef`, `ContainerProps`, `EmailSettings`, `EmailFileAttachment`, `FileKind`/`fileKind`/`formatBytes`, `EmailPalette`, `EmailContext`, `BlockDefinition`, `EmailVariable(Section)`, `isContainerType`, `MAX_BLOCK_DEPTH`. `BlockCommonProps` incluye layout: `paddingY/paddingX` + overrides `paddingTop/Right/Bottom/Left`, `marginTop/marginBottom`, `gap`. |

**Contrato del endpoint de guardado** (a implementar en template-back-end):

```ts
app.put("/templates/:id", async (c) => {
  const payload = await c.req.json();
  const { html, subject } = await renderTemplateEmail({ subject: template.subject, payload, context: userContext });
  await db.updateTemplate(id, payload);
  return c.json({ json: payload, html }); // ← lastResult en el front
});
```

### `create-email-template` (front-end)

Componentes: `EmailBuilder` (editor completo), `BlockPalette`, `Canvas`/`SortableCanvas`, `EditableBlockRenderer`, `PropertiesPanel`, `InlineTextEditor`, `SelectionToolbar`, `VariablesInfoDialog`. CSS: `import "create-email-template/style.css"` (autocontenido, fuente Geist inline, scope `.ter-theme`).

Hooks (todos requieren estar dentro de `<EmailBuilderProvider>`):

| Hook | Devuelve |
|---|---|
| `useRenderEmail()` | `{ getPayload, renderHtml, getHtml, resolve, html, isPending, setHtml }` — preview react-email + payload. |
| `useAutosaveStatus()` | `{ isSaving, lastSavedAt, lastError, lastResult, saveNow }` — `saveNow()` fuerza guardado con los mismos guards del autosave. |
| `useEmailBuilderStore(selector)` | Estado/acciones con selector (useSyncExternalStore). |
| `useEmailBuilderStoreInstance()` | Instancia del store vanilla (`getState/setState/subscribe`). |
| `useEmailBuilderConfig()` | Config resuelta. |

Store (`EmailBuilderState`): estado `blocks, selectedId, settings, dirty, propertiesOpen, past` y acciones `addBlock(type, index?)`, `removeBlock(id)`, `duplicateBlock(id)`, `updateBlockProps(id, props)`, `reorder(a, b)`, `setSettings(patch)`, `select(id)`, `setPropertiesOpen(open)`, `hydrate({ blocks, settings? })`, `markSaved()`, `getPayload()`, `undo()`.

Provider: `<EmailBuilderProvider config? uploadImage? uploadFile? autosave?>` — `config` incluye `variables, variableSections, blockLibrary, blockDefaults, palette, defaultSettings, files (límites de subida), sampleContext, labels, historyLimit (default 50)`.

---

## 6. Sistemas transversales

### Autoguardado (`autosave` en el provider, opt-in)
Ciclo: `setInterval(intervalMs /* default 10_000 */)` → si `dirty && !inFlight` → `getPayload()` → `await onSave(payload)` (fetch del consumidor; la librería NO hace network) → `markSaved()` + estado `{ lastResult }`. `enabled: false` desactiva sin desmontar. `saveNow()` comparte `onSave` — es el puente del botón manual. La librería exporta el tipo `AutosaveOptions` (`onSave, intervalMs, enabled, onSaved`).

### Undo lineal (sin redo)
`past: EmailHistoryEntry[]` en el store; cada acción mutante registra snapshot (`structuredClone`) del estado previo. **Coalescing 600ms** por `bloque:prop` (o `settings:prop`): escribir continuo genera un solo undo. `historyLimit` (50) poda la pila. `hydrate()` la vacía. Ctrl/Cmd+Z cableado en `EmailBuilder` — se ignora si el foco está en `contenteditable/input/textarea` (el editor inline conserva su undo nativo). Undo marca `dirty: true`.

### Layout y espaciado (padding / margen / gap)
`BlockCommonProps` expone el layout de todo bloque: `paddingY/paddingX` (shorthand) y los overrides por lado `paddingTop/Right/Bottom/Left`, que **ganan sobre el shorthand** cuando están definidos. Además `marginTop`/`marginBottom` (separación externa) y `gap` (separación interna: gutter de columnas, futuro separador de listas). Los overrides y márgenes son **opcionales y viven fuera de `defaultProps`** (`undefined` = heredar); `normalize.ts` los preserva vía `LAYOUT_KEYS` y descarta props legadas desconocidas (ej. `marginLeft`).

En el HTML el padding se aplica al `<td>` y **los márgenes se mueven a la tabla contenedora** (`section()` divide las claves `margin*`) porque `margin` no aplica a un `<td>`. Con el shorthand y sin márgenes la salida es byte-idéntica a versiones previas (tests de paridad). El React preview (`core/blocks.tsx`) replica la misma lógica con `blockPadding`/`blockSpacing` (exportadas) y el canvas editable las reutiliza. En el panel, la sección "Espaciado" es un `BlockFieldDef` de `kind: "group"` que `register-builtin-views.ts` añade a los bloques con layout (spacer/footer quedan fuera: tienen layout fijo). Es un helper puro y tolerante: no lanza con props corruptas.

### Bloques disponibles y campos del panel
26 bloques built-in: `header, hero, heading, text, list, button, image, quote, columns, container, grid, divider, spacer, footer, social, gallery, stats, pricing, product, checkout, downloads, testimonial, features, avatar, code, link`. Los últimos son "avanzados" (fila de enlaces, galería de imágenes, cifras, tarjeta de plan, ficha de producto, testimonio con avatar, cuadrícula de features, avatar, código, enlace suelto y resumen de pedido) y se registran igual que el resto (definition en `default-blocks.ts` + `renderHtml` + Preview/Editable/fields). `social` tiene `mode: "text" | "logo"` (nombre vs. medallón con ícono); en modo logo cada `SocialLink.icon` acepta un glifo (`SOCIAL_ICONS`) o una URL de imagen (`http(s)://` o `data:`), con `iconSize` (default 32) y `gap` (separación, default 6).

El panel es schema-driven (`BlockFieldDef`). Kinds: `text, richText, number, color, align, select, layout, preset, image, icons, hint, row, group, stringList, repeat, custom`. Para arrays de registros se usan `repeat` (`key`, `itemLabel`, `fields[]`; los sub-campos se editan contra el item; `hideIndex: true` quita el número de la etiqueta, p. ej. "Plan" en vez de "Plan 1") y `stringList` (`key`; array de strings). `normalize.ts` normaliza esos arrays vía `RECORD_ARRAY_FIELDS` (`links`, `images`, `stats`, `features`, `entries`, `plans`, `products`, `lines`) y coacciona `bullets` a `string[]`.

### Footer con variantes (3 estilos)
El bloque `footer` es un **contenedor** (`isContainerType("footer")`) con `variant: "classic" | "one-column" | "two-columns"` (default `"classic"`). `classic` (Footer 1) mantiene la barra oscura de siempre con `text`/`brandName` → **sin migración** para plantillas viejas. `one-column` / `two-columns` (Footer 2/3) viven de `columns: ColumnDef[]` (recetas de 1 o 2 celdas con hijos anidados editables). El panel usa el field kind **`preset`** ("Estilo"): al cambiar, `set({ variant, ...build() })` donde `build()` viene de `footer-presets.ts` (`FOOTER_VARIANTS`) y reescribe `columns`+fondo+padding con `newId()` fresco. Un footer **no puede anidarse** (es contenedor → se descarta a profundidad > 0).

### Anidamiento (profundidad 1)
`container` y `columns` son bloques contenedores. `columns` v2 guarda `ColumnDef[] = { id, blocks: EmailBlock[] }[]` (antes eran columnas de texto plano); el `container` guarda `blocks: EmailBlock[]`; la `grid` guarda el mismo `ColumnDef[]` pero con `width` (porcentaje) por celda y un preset `layout` en el panel (`50/50`, `1/3+2/3`, `2/3+1/3`, `3×1/3`, `4×1/4`) que reescribe las celdas conservando los hijos por índice. `MAX_BLOCK_DEPTH = 1`: un bloque puede contener hijos, pero esos hijos no pueden volver a contener bloques. Lo aplica `normalize.ts` (descarta contenedores a profundidad > 0 al normalizar hijos) y el store vía `canNestType` (la paleta ignora un drop de contenedor dentro de un contenedor).

`normalizeBlocks` migra automáticamente columnas legacy `{ id, text }` a `{ id, blocks: [text] }` — las plantillas viejas se auto-reparan. El render HTML (`renderContainer`/`renderColumns`) y el preview react-email (`BlockContainer`/`BlockColumns`) delegan en el render por bloque, así que cualquier tipo built-in o plugin funciona anidado.

En la UI, `store/block-tree.ts` concentra las operaciones puras sobre el árbol (`BlockLocation = { parentId?, columnId? }`, `findBlockDeep`, `getBlockList`/`setBlockList`, `updateBlockDeep`, `removeBlockDeep`). El store expone `addBlock(type, index?, location?)`, `reorder(a, b, location?)` y `moveBlock(id, targetLocation, targetIndex)`. El canvas raíz usa `SortableItem` (drag con dnd-kit); los anidados usan `NestedBlockList` (droppable para la paleta + reordenamiento por botones, sin DnD anidado). Los editables de contenedores viven en `components/builder/nested-blocks.tsx` (módulo aparte para romper el ciclo `NestedBlockList → EditableBlockRenderer`).

### Normalización de payloads
`normalizeBlocks` completa props desde los defaults de la blockLibrary, descarta tipos desconocidos y props legadas, repara ids/columnas y coacciona números/strings/arrays. Puntos de aplicación: `parseTemplatePayload` (backend) y `hydrate` (editor). **Consecuencia**: añadir props nuevas a un bloque no rompe plantillas viejas — se auto-reparan al cargarse. Sin script de migración.

### Aislamiento de estilos
Todo el CSS del builder vive en `src/index.css` bajo `.ter-theme` con clases `ter-*`; se extrae a `dist/style.css` (fuente embebida base64). El consumidor DEBE importarlo explícitamente. El canvas editable (`editable-block-renderer.tsx`) replica los estilos de `core/blocks.tsx` — mantenlos sincronizados al cambiar un bloque.

### Plantillas de correos ya armados (demo app)
`apps/vite-test/src/features/email-builder/templates.ts` define `SAMPLE_TEMPLATES`: plantillas **completas** (varios bloques) que la toolbar carga con `store.hydrate({ blocks })` (normaliza el payload y reinicia el undo). Hoy trae una de ejemplo (**Ecommerce · novedades**) armada con **`blockJson` / `templateJson`** — el mismo constructor que usaría el back-end para inyectar sus datos. Si no hubiera ninguna, el menú "Plantillas" (`TemplatesMenu`) muestra "Sin plantillas todavía". Los patrones de **un** bloque (p. ej. las variantes del bloque Footer) no van acá: viven en la librería (`footer-presets.ts` → `FOOTER_VARIANTS`, consumido por el panel).

### Precio / Plan con variantes (3 estilos)
`pricing` tiene `variant: "card" | "offer" | "two-tiers"` (default `"card"` = la tarjeta de siempre → **sin migración**). `offer` (tabla de oferta) y `two-tiers` (2+ planes con uno destacado) son **data-driven**: `offer` usa `eyebrow/description/note/note2` y botón full-width; `two-tiers` usa `heading/subtitle/plans[]/footnote` (`PricingPlan` = `title/price/period/description/features/ctaLabel/ctaHref/highlighted`). `normalize.ts` normaliza `plans` vía `RECORD_ARRAY_FIELDS` (que ahora soporta campos `boolean` y `string[]`). El selector "Estilo" usa el kind **`preset`** con las recetas de `pricing-presets.ts` (`PRICING_VARIANTS`). `set` con `highlighted` escribe un booleano real (el kind `select` acepta valores no-string). Los `group` del panel usan **`visibleWhen: { key, equals }`** para mostrar solo la sección de la variante activa.

### Galería con variantes (4 diseños)
`gallery` tiene `variant: "grid" | "three-columns" | "horizontal" | "vertical"` (default `"grid"` = la cuadrícula clásica de 2/3 columnas → **sin migración**, salida byte-idéntica). Son los 4 patrones de react.email/components/gallery: `grid` (filas de `columns` imágenes), `three-columns` (una fila de tres), `horizontal` (dos apiladas + una alta que cubre las dos más el gutter) y `vertical` (una ancha arriba + dos abajo). El estilo de imagen es común: `radius` (default 6) y `imageHeight` (px; **0 = alto automático**, que emite el `<img width="240">` de siempre; con alto fijo emite `height` + `object-fit:cover`). `gap` (opcional, layout) pasa a ser el gutter entre celdas (default 12, `half = gap/2`). El selector "Diseño" usa el kind **`preset`** con las recetas de `gallery-presets.ts` (`GALLERY_VARIANTS`, imágenes data-URI SVG para funcionar offline); la sección `Cuadrícula` del panel (`columns`) solo aparece con `visibleWhen: { key: "variant", equals: "grid" }`. **Ojo**: las props nuevas deben estar en `defaultProps` — `normalizeProps` solo itera las claves de los defaults, así que una prop opcional que no viva ahí se descarta al normalizar.
`normalize.ts` distingue `columns` **array** (`columns`/`grid`/`footer` = `ColumnDef[]`) de `columns` **numérico** (`gallery` = imágenes por fila): antes todo iba a `normalizeColumns` y un gallery guardado con `columns: 3` volvía a 2.

### Lista con variantes (3 estilos)
`list` tiene `variant: "bullets" | "numbered" | "with-image"` (default `"bullets"` = la lista de viñetas de siempre → **sin migración**, salida byte-idéntica). Son los patrones de react.email/components/list: `numbered` (badge circular de 24px + título + descripción) y `with-image` (imagen 40% + título + descripción + enlace "Aprender más →" en el 60%, **sin badge numerado**). Las viñetas siguen usando `items: string[]` + `icon`; las otras dos variantes usan `entries: ListEntry[]` (`title/description/number/image/href/linkLabel`; `number` vacío = número de la posición, solo lo usa `numbered`). Estilo: `accentColor` (badge y enlace, default `#d7b227`) y, en `with-image`, `radius` (4) e `imageHeight` (168). `gap` (layout) es la separación entre filas (`gap ?? 8` en `bullets`). El selector "Diseño" usa el kind **`preset`** con las recetas de `list-presets.ts` (`LIST_VARIANTS`); los grupos `Viñetas` / `Entradas` / `Estilo` / `Imagen` del panel usan `visibleWhen`. **Sin encabezado de sección** (a diferencia de la página de react.email). En el canvas los títulos y descripciones se editan inline en cada fila (`EditableList`).

### Producto con variantes (4 estilos) + Resumen de pedido
`product` tiene `variant: "card" | "hero" | "image-left" | "grid"` (default `"card"` = la tarjeta de siempre → **sin migración**, byte-idéntica). Son los patrones de react.email/components/ecommerce: `hero` (imagen ancha arriba, `eyebrow` + título 36px + descripción + precio + botón, centrado), `image-left` (tabla 50/50: imagen a la izquierda, ficha a la derecha con botón al 75%) y `grid` (encabezado opcional `heading`/`subheading` + tarjetas de `products[]`, `columns` 2/3/4; con **4** se pinta 2×2 y se inserta un `Hr` entre filas). Estilo: `accentColor` (eyebrow, precio y botón), `radius` (hero 12 · resto 8) e `imageHeight` (hero 320 · grid 180/250; 0 = el default de cada layout). Las recetas viven en `product-presets.ts` (`PRODUCT_VARIANTS`, imágenes data-URI SVG offline) y el panel las expone con el kind `preset` + grupos `visibleWhen` (`Producto` / `Encabezado` / `Tarjetas` / `Cuadrícula` / `Estilo`).
`checkout` (**bloque 25**, "Resumen de pedido") es el patrón de carrito: `heading` + caja con borde + tabla `Producto / Cantidad / Precio` (`lines: CheckoutLine[]` = `imageUrl/name/quantity/price`) + botón full-width. Props: `imageHeight` (110), `radius` (8), `accentColor` (botón, default `#4f46e5`), `borderColor`. Está en `SPACING_TYPES` (tiene layout) y en `RECORD_ARRAY_FIELDS` vía `lines`.
**Ojo**: los arrays de registros de estos bloques se llaman `products` y `lines` a propósito — **no** `items`, porque `normalizeProps` tiene una rama especial para `key === "items"` (la de `list`, que coacciona a `string[]`) y `RECORD_ARRAY_FIELDS` se indexa por nombre de prop.

### Tipografía (stack de sistema, opt-out)
El correo **no** hereda la fuente del editor: `EmailSettings.fontFamily` (default `DEFAULT_FONT_STACK`) se emite inline en el `<body>` y en el `<td>` que envuelve los bloques. `""` = no emitir `font-family` (se hereda la del cliente). El bloque `code` conserva su stack monoespaciado inline (gana por especificidad). `FONT_STACKS` (en `types.ts`, junto a `LIST_ICONS`) trae 7 grupos seguros y el dialog **Ajustes** (`settings-dialog.tsx`, abierto con el engranaje del canvas) los expone en un `select` + input libre (Personalizada). **Ojo**: los stacks usan comillas **simples** (`'Segoe UI'`) porque van dentro de un atributo `style="…"`; las dobles romperían el HTML. Las webfonts (`@font-face`) no son fiables (Gmail las elimina, Outlook escritorio las ignora) → dejar siempre fallback de sistema. El canvas y el preview React (`core/blocks.tsx`) aplican la misma familia para no divergir del HTML final.

### Archivos descargables y adjuntos (`settings.files`)
Los archivos **no viven en un bloque**: se suben una vez en **Ajustes** y quedan en `settings.files`
(`EmailFileAttachment = { id, url, name, size?, mimeType?, attach?, link? }`), así que viajan en el
payload y el bloque **`downloads`** los lista donde lo pongas.

- **Interruptores por archivo**: `attach` (lo adjunta tu ESP al enviar; el HTML **no** adjunta nada) y
  `link` (aparece en `downloads`). Defaults: `link: true`, `attach: false`.
- **Subida**: prop del provider `uploadFile?: (file: File) => Promise<string>` (espejo de `uploadImage`;
  debe devolver URL **pública**) + límites en `config.files` (`accept`, `maxSizeMb` 10, `maxCount` 10,
  `warnTotalMb` 5, con `DEFAULT_FILE_OPTIONS`). Sin `uploadFile` la librería usa `URL.createObjectURL`
  (blob local: solo preview). El dialog valida formato/tamaño/cantidad con `toast` y avisa si el total
  adjunto supera `warnTotalMb`.
- **Normalización**: `normalizeSettings` incluye `files` vía `normalizeFiles` (reutiliza
  `normalizeRecordArray` + `FILE_FIELDS` de `records.ts`): repara ids/tipos, deriva `name` de la URL
  (nunca de un `data:`, para no generar nombres gigantes), aplica los defaults cuando la clave falta,
  **descarta** URLs con esquema no permitido (`http`/`https`/`data`; `javascript:`/`blob:` fuera) y
  topa en 50. El store **normaliza los settings** al crear el estado y en `hydrate`, así que `files`
  siempre llega con ids y booleanos al dialog.
- **Render**: `BlockRenderInput` (registry) gana `settings?: Partial<EmailSettings>` y `renderBlock`
  lo hila por el anidamiento (`renderContainer`/`renderColumns`/`renderColumnsTable` → grid/footer). El
  bloque `downloads` filtra `link !== false` + `isSafeFileUrl` y **sin archivos (y sin `emptyText`) no
  emite ni un byte** (la salida es idéntica a la de una plantilla sin el bloque; lo cubre
  `test/downloads.test.ts`). En el preview React el equivalente es `EmailFilesContext`, provisto por
  `EmailTemplate`/`EmailBody` desde el prop `files` (`core/render.tsx` pasa `settings.files`); el
  editable del canvas lo lee del store. Está en `SPACING_TYPES` y el panel lo edita con kinds
  `hint`/`text`/`group`/`select` (los archivos se gestionan en Ajustes, no en el bloque).
- **Contrato del backend**: `settings.files.filter((f) => f.attach).map((f) => ({ filename: f.name, path: f.url }))`
  → parámetro de adjuntos de tu ESP (Resend/SES…). Documentado en `docs/BLOCKS.md`, `SKILL.md` y los README.

### Trackeo (aperturas y clics, opt-in por envío)
`renderEmailHtml` y `renderTemplateEmail` aceptan `tracking?: EmailTracking` (`pixelUrl`, `clickUrl` con `{url}`, `utm`, `exclude`, `transformLink`). Vive **solo en la opción de render**, no en `settings` ni en el payload: el pixel no se guarda en la plantilla ni aparece en el preview del editor. `tracking.ts` es un post-proceso puro sobre el HTML (regex sobre `<a href>`) y con `tracking` apagado la salida es **byte-idéntica** (lo cubre `test/tracking.test.ts` + el snapshot de paridad). `DEFAULT_TRACKING_EXCLUDE` protege la baja y los esquemas no web (`mailto:`, `tel:`, `sms:`, `#`). Caveats: las aperturas no son fiables (Apple MPP, proxy de Gmail) y el wrapping cambia la vista previa del enlace.

### Dialogs (demo app)
Patrón de `.agents/skills/manage-dialogs-zustand/SKILL.md`: store zustand por feature con `open: DialogType | null`, dialogs controlados SIN `DialogTrigger`, y un orquestador `components/dialogs.tsx` que monta el dialog activo. `apps/vite-test/src/features/email-builder/` es la referencia (toolbar, preview dialog React-vs-Server, autosave indicator).

---

## 7. Convenciones por paquete

**`create-email-renderer`**
- ESM puro, `module: NodeNext` → **imports relativos siempre con `.js`** (`from "./types.js"`).
- Sin JSX, sin React, sin DOM salvo APIs estándar (`lib: ["ES2022","DOM"]`). `id.ts` genera ids sin crypto ni `Math.random`: Workers prohíbe aleatoriedad en el arranque y `DEFAULT_BLOCK_LIBRARY` crea ids al importar.
- Estilo: comillas dobles, punto y coma. Build = `tsc -p tsconfig.json` (emite `.d.ts` + sourcemaps). `files: ["dist"]`.
- Todo helper nuevo debe ser puro y no-lanzador; la tolerancia a datos corruptos es requisito.

**`create-email-template`**
- Vite lib mode con entry único `src/index.ts`; `style.css` como export aparte (`"./style.css"`). No existe entry `./server` (se eliminó: el backend usa el renderer).
- `rollupOptions.external`: `react`, `react-dom`, `use-sync-external-store` — nunca externalizar nada más sin pensar el impacto en consumidores.
- Los módulos core (`src/core/*`) son **shims de una línea** hacia `create-email-renderer` — no copy/paste lógica ahí.
- `use-autosave.ts` recibe el **store por parámetro** (el provider no puede consumir su propio contexto).
- El shim de `use-sync-external-store` (`src/shims/use-sync-external-store.ts`) reemplaza el CJS de base-ui por hooks nativos; los alias de `vite.config.ts` van ordenados de subpath más largo a más corto (el alias reemplaza por prefijo).
- Estilo: sin punto y coma en store, con punto y coma en provider/hooks — respeta el archivo que edites.

**`apps/vite-test` (demo)**
- Features por dominio (`src/features/<dominio>`): `page.tsx` fina + `components/` + `stores/`. Routes de TanStack Router que solo importan la página del feature.
- UI shadcn/base-ui (`src/components/ui/*`); clases con tokens (`bg-popover`, `text-muted-foreground`).

---

## 8. Gotchas (errores reales ya ocurridos — no repetir)

1. **Provider auto-contexto**: un hook del provider NO puede llamar `useEmailBuilderStoreInstance` (el provider no ve su propio contexto). Pasar el store como parámetro (`useAutosaveEffect(options, store)`).
2. **`styleToString` sin unidades**: los números deben emitirse con `px` salvo props unitless (`font-weight`, `line-height`…). React lo hace automático; el serializador HTML no. Si un estilo "no se ve", revisa esto primero (`html-render.ts`).
3. **Shim CJS de `use-sync-external-store`**: `@base-ui/react` lo usa y hace `require("react")` → rompe el bundle ESM en dev. Ya está aliaseado al stub ESM (`src/shims/`). No lo elimines.
4. **Extensiones `.js` en imports del renderer**: NodeNext exige `from "./types.js"`. Sin ello, Node ESM falla al consumir el `dist`.
5. **Caché del dev server**: tras añadir dependencias o reconstruir paquetes workspace, recarga; si persiste, borra `node_modules/.vite` y reinicia.
6. **`use-sync-external-store` como dependencia fantasma**: si algún import externo lo necesita, decláralo explícitamente en el `package.json` del paquete que lo importa (pnpm estricto).
7. **Exports subpath**: al añadir un módulo público al renderer, actualiza `exports` del package.json Y emite `.d.ts` (tsc lo hace) Y el shim en el paquete UI si aplica.
8. **routeTree.gen.ts**: al crear rutas en apps TanStack, se regenera con `vite build`/`vite dev` — no lo edites a mano; si `tsc -b` falla por una ruta nueva, ejecuta `vite build` primero.
9. **`private: true`** en ambos paquetes: se consumen por `workspace:*`. Cambiar solo al publicar (ver §10).
10. **Selectores globales en el CSS de la lib**: el `dist/style.css` llega sin capas; cualquier selector no scopeado bajo `.ter-theme` (`*`, `button`, `:root`…) gana **siempre** a las utilidades `@layer` del host (Tailwind v4) y rompe la página entera del consumidor — ocurrió con el reset `*` hasta v0.1.4. Reglas: todo bajo `.ter-theme`/`ter-*` con `:where()` para mantener especificidad baja; los portales (dialog/sheet/SelectionToolbar) deben envolverse en `.ter-theme`. Lo vigila `check:css-scope` (`scripts/check-css-scope.mjs`, corre en `prepublishOnly`).

---

## 9. Testing

Estado actual: el renderer tiene **161 tests** (vitest, 18 archivos: paridad por bloque, normalize, trackeo, tipografía, variantes, docs, `downloads`…). Los gates son `pnpm check-types` + `pnpm build` (el build de `vite-test` valida la API pública completa contra los dist).

Estrategia recomendada (al añadir tests, usar Vitest):

1. **Renderer** (prioridad): snapshots de `renderEmailHtml` por tipo de bloque; `normalizeBlocks` con payloads corruptos/legacy; `parseTemplatePayload` tolerancia (null, string inválido, arrays raros); `resolveVariables`.
2. **Store del builder**: `createEmailBuilderStore` es vanilla — probar directamente: undo con coalescing (fake timers), `historyLimit`, hydrate reinicia `past`, `dirty`/`markSaved` ciclo con autosave simulado.
3. **Integración**: render de `EmailBuilderProvider + EmailBuilder` con Testing Library (smoke: paleta y canvas montan).

Ejecución: `pnpm check-types && pnpm build` siempre antes de dar una tarea por terminada; verificación visual de la demo en `/email-builder` cuando se toca UI.

---

## 10. Publicación npm (estado y procedimiento)

**Estado (2026-09-02): PUBLICADO.** Primera versión en npm vía GitHub Actions: `create-email-template@0.1.1` y `create-email-renderer@0.1.0` (tag `v0.1.1`). Repo: `asmel2020/creator-email-templates` (público — requerido por el provenance de npm). Setup listo: `NPM_TOKEN` en GitHub Secrets, `license: MIT`, `publishConfig.access: "public"`, `prepublishOnly: pnpm build && pnpm check-types`, README propio por paquete.

**Procedimiento para publicar una nueva versión:**

```sh
# 1. Sube "version" en packages/*/package.json SOLO de los paquetes que cambiaron.
#    REGLA: si cambió create-email-renderer, sube la versión de AMBOS — el
#    renderer se empaqueta dentro del dist del template, y sin bump el guard
#    de "versión ya publicada" omitiría el template.
# 2. Commit y tag:
git tag vX.Y.Z && git push origin vX.Y.Z
```

El workflow `publish.yml` hace el resto: install → build → check-types → detecta con `git diff` (contra el tag anterior) qué paquetes cambiaron → publica **solo esos** → si la versión ya existe en el registry, la omite. Cambios solo en apps (ej. `vite-test`) no publican nada. `prepublishOnly` re-verifica build + tipos como última barrera.

**Gotchas de publicación (ya corregidos en el workflow — no revertir):**

1. **Fallback del primer tag**: las rutas del fallback (`packages/create-email-renderer/ packages/create-email-template/`) deben llevar **slash final** — los greps de detección exigen `^packages/<nombre>/`.
2. **`--no-private` no existe en pnpm 9** (es de pnpm 10) → `Unknown option: 'private'`. `pnpm publish` ya omite privados por sí solo; con `--filter` ni hace falta.
3. **`--no-git-checks` obligatorio**: el checkout de un tag deja git en detached HEAD y pnpm exige estar en `publish-branch` (master|main) sin él.
4. **Provenance (`NPM_CONFIG_PROVENANCE: true`) solo funciona con repos PÚBLICOS**: npm rechaza el PUT con `E422 Unprocessable Entity` si el repo origen es privado. No quitarlo a menos que el repo deje de serlo.

**Pendientes menores:**

- [ ] Borrar el repo vacío `asmel2020/creator-email` (creado por accidente con `gh repo create`; requiere el scope `delete_repo` en gh o borrarlo desde la web).
- [ ] **Rotar el `NPM_TOKEN`** (quedó expuesto en chat durante el setup): npmjs.com → revocar → generar uno nuevo → `gh secret set NPM_TOKEN --repo asmel2020/creator-email-templates --body "<nuevo>"`.
- [ ] Estrategia de versionado: manual por tag hoy; migrar a Changesets si el ritmo crece.
- [ ] `peerDependenciesMeta` del template: evaluar marcar `react` no-opcional explícito.
