---
name: create-email-template
description: React email template builder UI (drag & drop editor with autosave) backed by create-email-renderer
licence: MIT
metadata:
  author: asmel2020
  version: 1.0.0
---

# Skill: `create-email-template`

Editor visual de plantillas de email para React. Se apoya en `create-email-renderer` (el core sin
React) para tipos, defaults, normalización y el HTML final → **el preview del editor y el HTML
del back-end nunca divergen**.

- 📖 Catálogo de bloques, props y defaults: [`create-email-renderer/docs/BLOCKS.md`](../create-email-renderer/docs/BLOCKS.md)
- 🔌 Exponer un MCP en el back-end: [`create-email-renderer/docs/MCP.md`](../create-email-renderer/docs/MCP.md)

> Instalado desde npm, el catálogo vive en
> `node_modules/create-email-renderer/docs/BLOCKS.md`.

---

## Cuándo usar esto

- Meter un editor de correos en tu app (drag & drop, panel de propiedades, undo, autosave).
- Cargar una plantilla guardada para editarla y volver a guardarla.
- Reusar el **payload** (`{ content, settings }`) que tu back-end renderiza con
  `create-email-renderer`.

## Instalación y CSS (importante)

```sh
npm install create-email-template create-email-renderer
```

```tsx
import { EmailBuilderProvider, EmailBuilder } from "create-email-template";
import "create-email-template/style.css"; // ← OBLIGATORIO
```

El CSS es **autocontenido** (fuente Geist inline) y está **scopeado bajo `.ter-theme`**. El
consumidor debe importarlo explícitamente; sin él, el editor se ve sin estilos.

## Uso mínimo

```tsx
<EmailBuilderProvider
  config={{ variables: [{ key: "firstName", label: "Nombre" }] }}
  autosave={{ onSave: async (payload) => { await api.put(`/templates/${id}`, payload); } }}
>
  <EmailBuilder />
</EmailBuilderProvider>
```

`onSave` recibe el payload `{ content, settings }`; la librería **no** hace red.

## API pública

### Componentes

| Componente | Para qué |
|---|---|
| `EmailBuilder` | Editor completo (paleta + canvas + panel). |
| `BlockPalette` | Paleta de bloques suelta. |
| `Canvas` / `SortableCanvas` | Lienzo con drag & drop. |
| `EditableBlockRenderer` | Render editable de un bloque concreto. |
| `PropertiesPanel` | Panel de propiedades schema-driven. |
| `InlineTextEditor`, `SelectionToolbar`, `VariablesInfoDialog` | Piezas internas reutilizables. |

### Hooks (siempre dentro de `<EmailBuilderProvider>`)

| Hook | Devuelve |
|---|---|
| `useRenderEmail()` | `{ getPayload, renderHtml, getHtml, resolve, html, isPending, setHtml }` |
| `useAutosaveStatus()` | `{ isSaving, lastSavedAt, lastError, lastResult, saveNow }` |
| `useEmailBuilderStore(selector)` | Estado/acciones con selector. |
| `useEmailBuilderStoreInstance()` | Instancia vanilla del store (`getState`/`setState`/`subscribe`). |
| `useEmailBuilderConfig()` | Config resuelta. |

### Store

Estado: `blocks, selectedId, settings, dirty, propertiesOpen, past`.
Acciones: `addBlock(type, index?, location?)`, `removeBlock`, `duplicateBlock`,
`updateBlockProps`, `reorder(a, b, location?)`, `moveBlock`, `setSettings`, `select`,
`setPropertiesOpen`, `hydrate({ blocks, settings? })`, `markSaved`, `getPayload`, `undo`.

### Provider (`EmailBuilderConfig`)

`variables`, `variableSections`, `blockLibrary`, `blockDefaults`, `palette`, `defaultSettings`,
`sampleContext`, `labels`, `historyLimit` (default 50). `autosave` recibe
`{ onSave, intervalMs (10s), enabled, onSaved }` y `uploadImage` sirve para subir imágenes.

## Flujos típicos

### Cargar una plantilla del backend

```ts
const { json } = await api.get(`/templates/${id}`);
store.hydrate({ blocks: json.content, settings: json.settings }); // normaliza y reinicia el undo
```

### Guardar

```ts
const payload = store.getPayload();      // { content, settings }
await api.put(`/templates/${id}`, payload); // tu backend lo renderiza con create-email-renderer
```

### Forzar guardado (botón manual)

```ts
const { saveNow } = useAutosaveStatus();
await saveNow();
```

## Cómo extender

- **Bloques nuevos de UI** (preview + editable + campos): registra una vista con `registerBlockViews`
  (`block-views.ts`) y el render del backend con `registerBlock` en `create-email-renderer`.
- **Recetas de variantes** (estilos de un bloque): un archivo `*-presets.ts` con `{ value, label, build() }`
  que el panel consume con el kind `preset`.
- **Kinds del panel** (`BlockFieldDef`): `text, richText, number, color, align, select, layout,
  preset, image, icons, hint, row, group, stringList, repeat, custom`; los `group` aceptan
  `visibleWhen: { key, equals }` para mostrar solo la sección de la variante activa.
- **Labels**: todo texto de UI pasa por `labels` (`EmailBuilderLabels`) para i18n.

## Reglas de oro

1. **Core compartido en el renderer**: `src/core/*` son shims de una línea hacia
   `create-email-renderer`. No dupliques tipos ni defaults aquí.
2. **Nunca externalices** más de `react`, `react-dom` y `use-sync-external-store`.
3. **CSS**: todo bajo `.ter-theme`/`ter-*`; los portales (dialog/sheet/toolbar) también. Un
   selector global rompe la app del consumidor.
4. **No expongas un entry `/server`**: el back-end usa el renderer.

## Errores comunes

| Síntoma | Causa |
|---|---|
| El editor se ve sin estilos | Falta `import "create-email-template/style.css"`. |
| Un hook lanza "outside provider" | Está fuera de `<EmailBuilderProvider>`. |
| Estilos raros en tu app | Un selector del CSS de la lib no está scopeado (`check:css-scope` lo vigila). |
| El canvas muestra una versión vieja | Caché del dev server: borra `node_modules/.vite` y reinicia. |
| `dirty` no baja | Solo `markSaved()` (autosave o manual) lo limpia. |
