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
│       │   └── id.ts        # newId() = crypto.randomUUID (local, 3 líneas)
│       ├── config/          # types.ts (EmailBuilderConfig, AutosaveOptions, labels) + defaults.ts (resolve)
│       ├── store/           # vanilla-store.ts (store genérico), create-email-builder-store.ts (estado+undo),
│       │                    # email-builder-provider.tsx (contextos), autosave-context.tsx
│       ├── hooks/           # use-email-builder, use-render-email, use-autosave
│       └── components/      # builder/ (email-builder, canvas, block-palette, properties-panel,
│                            # editable-block-renderer, inline-text-editor, selection-toolbar,
│                            # sortable-item, variables-info-dialog) + ui/ (button, dialog, sheet…) + index.css
└── create-email-renderer/   # create-email-renderer — core puro + render HTML
    ├── tsconfig.json        # NodeNext ⇒ imports relativos CON extensión ".js"
    └── src/
        ├── index.ts         # exporta todo; subpaths: /server /html-render /normalize /types /variables /richtext /default-blocks
        ├── types.ts         # EmailBlock/Props/Settings/Palette/Context + createBlock/buildBlockMap
        ├── default-blocks.ts # DEFAULT_BLOCK_LIBRARY (12 tipos), DEFAULT_PALETTE, DEFAULT_SETTINGS
        ├── variables.ts     # DEFAULT_VARIABLES, SAMPLE_CONTEXT, resolveVariables ({key})
        ├── richtext.ts      # sanitize-html: renderRichText/sanitizeRichText/escapeHtml/normalizeBlockHtml
        ├── normalize.ts     # normalizeBlocks/normalizeSettings (defensa contra payloads legacy)
        ├── html-render.ts   # renderEmailHtml: JSON → HTML email-safe (tablas + inline styles)
        ├── server.ts        # parseTemplatePayload (normaliza), renderTemplateEmail, buildTemplateContext
        └── id.ts            # newId = crypto.randomUUID
```

Demo clave: `apps/vite-test/src/routes/email-builder.tsx` es una ruta pública que solo importa la feature; `.agents/skills/manage-dialogs-zustand/SKILL.md` define el patrón de dialogs que usa.

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
| `renderTemplateEmail({ subject, payload, context?, settings?, palette? })` | Async → `{ html, subject }`. `payload` acepta string/objeto/null. Lanza solo si no quedan bloques tras normalizar. |
| `renderEmailHtml({ blocks, subject?, context?, settings?, palette? })` | Async → HTML string. Subpath `/html-render`. |
| `parseTemplatePayload(raw)` | → `{ content, settings }`. **Normaliza** (normalizeBlocks + normalizeSettings) y nunca lanza. |
| `normalizeBlocks(input, library?)` / `normalizeSettings(input)` | Normalización de payloads legacy: descarta tipos desconocidos, completa props desde defaults, repara ids, coacciona tipos. Subpath `/normalize`. |
| `buildTemplateContext(base, extra?)` | Limpia null/"" y mezcla sobre `SAMPLE_CONTEXT`. |
| `resolveVariables(text, ctx)` / `extractVariables` / `validateVariables` | Sintaxis `{key}`. |
| `renderRichText` / `sanitizeRichText` / `escapeHtml` / `normalizeBlockHtml` / `isRichText` | Pipeline richtext (sanitize-html). |
| Defaults | `DEFAULT_BLOCK_LIBRARY`, `DEFAULT_PALETTE`, `DEFAULT_SETTINGS`, `DEFAULT_VARIABLES`, `DEFAULT_BASE_VARIABLES`, `DEFAULT_CONTEXTUAL_VARIABLES`, `SAMPLE_CONTEXT`. |
| Tipos | `EmailBlock`, `EmailBlockType` (12), `EmailBlockProps` (unión por tipo), `EmailSettings`, `EmailPalette`, `EmailContext`, `BlockDefinition`, `EmailVariable(Section)`. |

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

Provider: `<EmailBuilderProvider config? uploadImage? autosave?>` — `config` incluye `variables, variableSections, blockLibrary, blockDefaults, palette, defaultSettings, sampleContext, labels, historyLimit (default 50)`.

---

## 6. Sistemas transversales

### Autoguardado (`autosave` en el provider, opt-in)
Ciclo: `setInterval(intervalMs /* default 10_000 */)` → si `dirty && !inFlight` → `getPayload()` → `await onSave(payload)` (fetch del consumidor; la librería NO hace network) → `markSaved()` + estado `{ lastResult }`. `enabled: false` desactiva sin desmontar. `saveNow()` comparte `onSave` — es el puente del botón manual. La librería exporta el tipo `AutosaveOptions` (`onSave, intervalMs, enabled, onSaved`).

### Undo lineal (sin redo)
`past: EmailHistoryEntry[]` en el store; cada acción mutante registra snapshot (`structuredClone`) del estado previo. **Coalescing 600ms** por `bloque:prop` (o `settings:prop`): escribir continuo genera un solo undo. `historyLimit` (50) poda la pila. `hydrate()` la vacía. Ctrl/Cmd+Z cableado en `EmailBuilder` — se ignora si el foco está en `contenteditable/input/textarea` (el editor inline conserva su undo nativo). Undo marca `dirty: true`.

### Normalización de payloads
`normalizeBlocks` completa props desde los defaults de la blockLibrary, descarta tipos desconocidos y props legadas, repara ids/columnas y coacciona números/strings/arrays. Puntos de aplicación: `parseTemplatePayload` (backend) y `hydrate` (editor). **Consecuencia**: añadir props nuevas a un bloque no rompe plantillas viejas — se auto-reparan al cargarse. Sin script de migración.

### Aislamiento de estilos
Todo el CSS del builder vive en `src/index.css` bajo `.ter-theme` con clases `ter-*`; se extrae a `dist/style.css` (fuente embebida base64). El consumidor DEBE importarlo explícitamente. El canvas editable (`editable-block-renderer.tsx`) replica los estilos de `core/blocks.tsx` — mantenlos sincronizados al cambiar un bloque.

### Dialogs (demo app)
Patrón de `.agents/skills/manage-dialogs-zustand/SKILL.md`: store zustand por feature con `open: DialogType | null`, dialogs controlados SIN `DialogTrigger`, y un orquestador `components/dialogs.tsx` que monta el dialog activo. `apps/vite-test/src/features/email-builder/` es la referencia (toolbar, preview dialog React-vs-Server, autosave indicator).

---

## 7. Convenciones por paquete

**`create-email-renderer`**
- ESM puro, `module: NodeNext` → **imports relativos siempre con `.js`** (`from "./types.js"`).
- Sin JSX, sin React, sin DOM salvo APIs estándar (`crypto.randomUUID` en `id.ts`; `lib: ["ES2022","DOM"]`).
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

---

## 9. Testing

Estado actual: **sin tests unitarios**. Los gates son `pnpm check-types` + `pnpm build` (el build de `vite-test` valida la API pública completa contra los dist).

Estrategia recomendada (al añadir tests, usar Vitest):

1. **Renderer** (prioridad): snapshots de `renderEmailHtml` por tipo de bloque; `normalizeBlocks` con payloads corruptos/legacy; `parseTemplatePayload` tolerancia (null, string inválido, arrays raros); `resolveVariables`.
2. **Store del builder**: `createEmailBuilderStore` es vanilla — probar directamente: undo con coalescing (fake timers), `historyLimit`, hydrate reinicia `past`, `dirty`/`markSaved` ciclo con autosave simulado.
3. **Integración**: render de `EmailBuilderProvider + EmailBuilder` con Testing Library (smoke: paleta y canvas montan).

Ejecución: `pnpm check-types && pnpm build` siempre antes de dar una tarea por terminada; verificación visual de la demo en `/email-builder` cuando se toca UI.

---

## 10. Publicación npm (estado y procedimiento)

**Hecho (2026-09-02):** paquetes renombrados a `create-email-template` y `create-email-renderer` (nombres sueltos, libres en npm, paquete independiente — sin marca), `private` eliminado de ambos, `license: MIT`, `publishConfig.access: "public"`, `prepublishOnly: pnpm build && pnpm check-types`, `repository`/`homepage` apuntando a `asmel2020/creator-email-templates`, README propio por paquete y workflows en `.github/workflows/` (`ci.yml` verificación en push/PR; `publish.yml` publica en tags `v*`).

**Procedimiento de publicación (GitHub Actions):**

1. Crear el repo `creator-email` en GitHub y hacer push de `main` (el repo local aún no tiene `.git`; inicializar con `git init`).
2. npmjs.com → crear un **Access Token** de tipo Automation → GitHub → Settings → Secrets and variables → Actions → `NPM_TOKEN`.
3. Para publicar una versión: subir `"version"` (semver) **solo de los paquetes cambiados** → commit → `git tag vX.Y.Z && git push origin vX.Y.Z`. El workflow `publish.yml` detecta vía `git diff` contra el tag anterior qué paquetes cambiaron y publica **solo esos** (un cambio solo en apps, ej. `vite-test`, no publica nada). Reglas del workflow: (a) un cambio en `create-email-renderer` también republica `create-email-template` (el renderer se empaqueta dentro de su dist); (b) guard extra: si la versión ya existe en el registry, se omite. `prepublishOnly` re-verifica build + tipos como última red de seguridad.

Checklist restante:

- [x] Nombres definidos y disponibles en npm: `create-email-template`, `create-email-renderer`.
- [x] `private` eliminado; `files: ["dist"]` y `exports` map completos con `types` por subpath.
- [x] README por paquete + `repository`/`license`/`homepage` en package.json.
- [x] Workflows CI + Publish creados.
- [ ] Paso manual del usuario: token `NPM_TOKEN` en GitHub Secrets.
- [ ] Ajustar `repository`/`homepage` si el repo final tiene otro nombre/propietario.
- [ ] Estrategia de versionado (manual por tag hoy; migrar a Changesets si el ritmo crece).
- [ ] `peerDependenciesMeta` del template: evaluar marcar `react` no-opcional explícito.
- [ ] Confirmar licencia MIT como la deseada.
