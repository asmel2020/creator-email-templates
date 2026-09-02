# create-email-template

Editor visual de plantillas de email por bloques para React: palette, canvas con drag & drop, edición de texto inline enriquecida, panel de propiedades, autoguardado, deshacer y preview en móvil/escritorio.

El JSON que produce se renderiza a HTML email-safe con su compañero [`create-email-renderer`](https://www.npmjs.com/package/create-email-renderer) (**sin React**, pensado para backend/edge). Ambas librerías comparten el mismo core, por lo que el preview del editor y el HTML final nunca divergen.

## Instalación

```sh
npm install create-email-template
```

Requiere **React `^18 || ^19`** como peer dependency (usa `useSyncExternalStore`, nativo desde React 18).

## Uso mínimo

```tsx
import { EmailBuilder, EmailBuilderProvider } from "create-email-template";
import "create-email-template/style.css"; // ¡necesario! Estilos autocontenidos

export function EditorPage() {
  return (
    <EmailBuilderProvider>
      <EmailBuilder />
    </EmailBuilderProvider>
  );
}
```

`<EmailBuilder />` renderiza el editor completo (palette + canvas + panel de propiedades). Todo lo demás es configuración opcional.

> 📥 **¿Ya creaste una plantilla y quieres volver a editarla?** Ve a [Editar una plantilla existente](#editar-una-plantilla-existente-cargar-del-backend) — se carga con `hydrate()` y el autoguardado sigue guardando sobre esa misma plantilla.

---

## `<EmailBuilderProvider>` — configuración completa

```tsx
<EmailBuilderProvider
  config={{ /* opciones del builder (todas opcionales) */ }}
  uploadImage={fnUpload}   // opcional: subida de imágenes
  autosave={{ /* opcional: autoguardado */ }}
>
```

### `config`

| Opción | Tipo | Default | Qué hace |
|---|---|---|---|
| `blockDefaults` | `Partial<Record<Bloque, Partial<Props>>>` | — | Valores iniciales por tipo de bloque. Se aplican **al arrastrar** el bloque al canvas. |
| `blockLibrary` | `BlockDefinition[]` | `DEFAULT_BLOCK_LIBRARY` (12 bloques) | Qué bloques aparecen en la palette y con qué defaultProps. |
| `palette` | `Partial<EmailPalette>` | `DEFAULT_PALETTE` | Colores base del tema: `INK` (texto), `DARK` (fondos oscuros), `GOLD` (acentos), `CREAM_DIM` (texto secundario). |
| `defaultSettings` | `Partial<EmailSettings>` | `DEFAULT_SETTINGS` | Fondo de página, grosor y redondeo del borde de la tarjeta. |
| `variables` | `EmailVariable[]` | `DEFAULT_VARIABLES` | Etiquetas `{key}` disponibles para el usuario. |
| `variableSections` | `EmailVariableSection[]` | agrupación única | Agrupa las variables por categoría en el dialog "Etiquetas disponibles". |
| `sampleContext` | `EmailContext` | `SAMPLE_CONTEXT` | Datos de ejemplo: al previsualizar, `{firstName}` se ve como el valor de aquí. |
| `labels` | `Partial<EmailBuilderLabels>` | `DEFAULT_LABELS` (español) | Textos de la UI del editor (i18n). |
| `historyLimit` | `number` | `50` | Profundidad máxima del historial de deshacer. |

#### Ejemplo real de `config`

```tsx
<EmailBuilderProvider
  config={{
    // Al arrastrar un header, nace con la marca y el logo ya puestos
    blockDefaults: {
      header: { brandName: "Mi Marca", logoUrl: "https://mi-cdn.com/logo.png" },
      text: { text: "Hola {firstName}, gracias por ser parte de nuestra comunidad." },
      button: { label: "Quiero mi cupo", href: "{registerUrl}", backgroundColor: "#d7b227" },
      footer: { brandName: "Mi Marca" },
    },

    // Personaliza el tema completo
    palette: { INK: "#221d15", DARK: "#0d0b08", GOLD: "#d7b227", CREAM_DIM: "#b8ae9d" },
    defaultSettings: { pageBackground: "#f5f1e8", cardBorderWidth: 1, cardBorderRadius: 4 },

    // Contexto de ejemplo para el preview de variables
    sampleContext: {
      firstName: "Danny",
      companyName: "Mi Empresa",
      registerUrl: "https://mi-sitio.com/registro",
      unsubscribeUrl: "https://mi-sitio.com/baja",
    },

    // Solo estas variables aparecen en el editor (si lo omites: todas las defaults)
    variables: [
      { key: "firstName", label: "Nombre" },
      { key: "email", label: "Correo electrónico" },
      { key: "registerUrl", label: "URL de registro" },
    ],

    // Más undo (cada snapshot es del estado completo de bloques)
    historyLimit: 100,
  }}
>
```

#### Bloques disponibles y sus props

Todos los bloques aceptan `align` ("left" | "center" | "right"), `backgroundColor`, `paddingY` y `paddingX`.

| Tipo | Props específicas |
|---|---|
| `header` | `brandName`, `tagline?`, `logoUrl?` |
| `hero` | `title`, `subtitle?`, `imageUrl?` |
| `heading` | `text`, `size?`, `color?` |
| `text` | `text`, `size?`, `color?` |
| `list` | `items: string[]`, `icon?` ("✓", "•", "→"…) |
| `button` | `label`, `href` (acepta variables), `backgroundColor?`, `color?`, `blockBackgroundColor?` |
| `image` | `src`, `alt?`, `width?`, `href?` (si hay `href`, la imagen es clicable) |
| `quote` | `text`, `author?`, `borderColor?`, `borderWidth?`, `marginLeft?` |
| `columns` | `columns: { id: string; text: string }[]` |
| `divider` | `color?`, `height?` |
| `spacer` | `height?`, `backgroundColor?` |
| `footer` | `text?`, `brandName?`, `backgroundColor?` |

### `uploadImage`

Se invoca cuando el usuario sube una imagen desde el panel de propiedades. Recibe el `File` y debe devolver la **URL pública** donde quedó alojada (S3, R2, tu API…):

```tsx
uploadImage={async (file: File) => {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/uploads", { method: "POST", body: form });
  const { url } = await res.json();
  return url; // esta URL queda en la prop `src` del bloque image
}}
```

---

## Autoguardado (`autosave`) y guardado manual

Opt-in: sin la prop, no hay guardado automático. La librería **no hace network** — `onSave` es tu fetch.

```tsx
import type { AutosavePayload } from "create-email-template";

async function onSave(payload: AutosavePayload) {
  const res = await fetch(`/api/templates/${templateId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // { content, settings } → tu BD
  });
  if (!res.ok) throw new Error("Error al guardar");
  return res.json(); // lo que devuelvas llega a `lastResult` (ej. { json, html })
}

<EmailBuilderProvider
  autosave={{
    onSave,        // obligatorio
    intervalMs: 10_000, // default 10s
    enabled: true,      // interruptor sin desmontar el provider
    onSaved: (r) => {   // opcional: feedback por intento
      if (!r.ok) toast.error("No se pudo guardar");
    },
  }}
>
```

Cómo funciona el ciclo: cada `intervalMs`, si hay cambios (`dirty`) y no hay un guardado en vuelo, llama a `onSave` y limpia `dirty`. Si el usuario edita durante el guardado, el próximo tick toma los cambios — no se pierde nada.

### `useAutosaveStatus()` — estado y botón de guardado manual

```tsx
import { useAutosaveStatus } from "create-email-template";

function Toolbar() {
  const { isSaving, lastSavedAt, lastError, lastResult, saveNow } = useAutosaveStatus();

  return (
    <>
      {/* saveNow() dispara el MISMO onSave, inmediatamente → botón "Guardar" manual */}
      <button onClick={() => saveNow()} disabled={isSaving}>
        {isSaving ? "Guardando…" : "Guardar"}
      </button>

      {lastSavedAt && <span>Guardado a las {lastSavedAt.toLocaleTimeString()}</span>}
      {lastError && <span className="error">Error al guardar</span>}

      {/* lastResult = lo que devolvió tu onSave. Ej.: mostrar el HTML real del backend */}
      {lastResult?.html && <iframe srcDoc={lastResult.html} title="Vista del servidor" />}
    </>
  );
}
```

| Campo | Descripción |
|---|---|
| `isSaving` | Hay un guardado en vuelo. |
| `lastSavedAt` | Fecha del último guardado exitoso. |
| `lastError` | Error del último intento fallido (se limpia al guardar bien). |
| `lastResult` | Lo que devolvió tu `onSave` — ej. `{ json, html }` si tu backend renderiza y responde el HTML. |
| `saveNow()` | Guardado inmediato con los mismos guards: no hace nada si no hay cambios o ya hay uno en vuelo. |

¿Solo botón manual, sin autoguardado? `autosave={{ enabled: false, onSave }}` — `saveNow()` sigue funcionando.

---

## Editar una plantilla existente (cargar del backend)

¿Ya creaste una plantilla y quieres volver a editarla? El ciclo completo es: **fetch del JSON → `hydrate()` → el usuario edita → el autoguardado guarda sobre la misma plantilla**. Ejemplo de página completa:

```tsx
import { useEffect, useState } from "react";
import {
  EmailBuilder,
  EmailBuilderProvider,
  useEmailBuilderStoreInstance,
  type AutosavePayload,
} from "create-email-template";
import "create-email-template/style.css";

// 1. Página: trae la plantilla y no monta el editor hasta que llegue
export function EditorPage({ templateId }: { templateId: string }) {
  const [payload, setPayload] = useState<AutosavePayload | null>(null);

  useEffect(() => {
    fetch(`/api/templates/${templateId}`)
      .then((r) => r.json())
      .then((template) => setPayload(template.payload)); // { content, settings }
  }, [templateId]);

  if (!payload) return <p>Cargando plantilla…</p>;

  return (
    <EmailBuilderProvider
      config={miConfig}
      autosave={{
        // 4. El autoguardado ahora actualiza ESA MISMA plantilla
        onSave: (data) =>
          fetch(`/api/templates/${templateId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }),
      }}
    >
      {/* 2. Componente puente: inyecta el payload en el store */}
      <TemplateLoader payload={payload} />
      {/* 3. El editor arranca ya con los bloques de la plantilla */}
      <EmailBuilder />
    </EmailBuilderProvider>
  );
}

// Debe vivir DENTRO del provider (usa el store del builder). No renderiza nada.
function TemplateLoader({ payload }: { payload: AutosavePayload }) {
  const store = useEmailBuilderStoreInstance();

  useEffect(() => {
    store.getState().hydrate({
      blocks: payload.content,
      settings: payload.settings, // opcional
    });
  }, [payload, store]);

  return null;
}
```

Qué hace `hydrate({ blocks, settings? })`:

- **Normaliza el payload**: props faltantes se completan con los defaults actuales, tipos desconocidos se descartan — plantillas guardadas con versiones anteriores del esquema cargan sin romperse.
- **Reinicia el historial de deshacer**: el estado cargado es la base nueva (el undo anterior se descarta).
- Deja `dirty: false`: el autoguardado **no dispara** hasta que el usuario edite de verdad.
- Los `id` de los bloques se conservan, así que el guardado actualiza en lugar de duplicar.

> 💡 Cargar antes de montar el editor (el `if (!payload)` del ejemplo) no es obligatorio, pero evita que el usuario edite un canvas vacío y su trabajo se sobrescriba cuando llegue el fetch.

---

## Deshacer

Undo **lineal** (solo hacia atrás, nunca adelante), en memoria:

- Cada acción (añadir/eliminar/reordenar/duplicar bloques, editar propiedades y ajustes) registra un snapshot. Tope: `historyLimit` (50).
- Las escrituras continuas se **agrupan**: Ctrl+Z deshace la frase escrita, no tecla por tecla.
- **Ctrl/Cmd+Z ya funciona** dentro de `<EmailBuilder />`. En un campo de texto editable se respeta el undo nativo.
- Deshacer marca `dirty: true` → el autoguardado persiste el estado deshecho en el siguiente tick.
- Al `hydrate()` el historial se vacía (el estado cargado es la nueva base).

Para tu propia UI de undo:

```tsx
import { useEmailBuilderStore } from "create-email-template";

function UndoButton() {
  const canUndo = useEmailBuilderStore((s) => s.past.length > 0);
  const undo = useEmailBuilderStore((s) => s.undo);
  return <button onClick={() => undo()} disabled={!canUndo}>Deshacer</button>;
}
```

---

## `useRenderEmail()` — payload y render de preview

```tsx
import { useRenderEmail } from "create-email-template";

function Acciones() {
  const { getPayload, renderHtml, getHtml, resolve, html, isPending } = useRenderEmail();

  const guardar = () => fetch("/api/templates", { method: "POST", body: JSON.stringify(getPayload()) });
  const preview = () => renderHtml({ subject: "Hola {firstName}" }); // html se actualiza

  return <button onClick={preview} disabled={isPending}>Refrescar preview</button>;
}
```

| Miembro | Descripción |
|---|---|
| `getPayload()` | `{ content: EmailBlock[], settings }` — el JSON para persistir. |
| `renderHtml(opts?)` | Renderiza el preview con react-email (async). Opciones: `{ subject?, context? }`. |
| `getHtml(opts?)` | Igual que `renderHtml` pero cacheado: sin opciones devuelve el HTML ya generado. |
| `resolve(text, ctx?)` | Reemplaza `{etiquetas}` en un texto con el `sampleContext` (o el que pases). |
| `html` / `isPending` / `setHtml` | Estado reactivo del último render. |

---

## `useEmailBuilderStore(selector)` — estado y acciones

Suscripción selectiva (re-renderiza solo lo que cambia). Requiere el provider.

```tsx
import { useEmailBuilderStore } from "create-email-template";

const blocks = useEmailBuilderStore((s) => s.blocks);        // bloques actuales
const dirty = useEmailBuilderStore((s) => s.dirty);          // ¿hay cambios sin guardar?
const canUndo = useEmailBuilderStore((s) => s.past.length > 0);
const undo = useEmailBuilderStore((s) => s.undo);
const addBlock = useEmailBuilderStore((s) => s.addBlock);

addBlock("text");          // añade un bloque de texto al final (con tus blockDefaults)
addBlock("button", 0);     // …o en una posición específica
```

**Estado:** `blocks`, `selectedId`, `settings`, `dirty`, `propertiesOpen`, `past` (pila de undo).

**Acciones:** `addBlock(type, index?)` · `removeBlock(id)` · `duplicateBlock(id)` · `updateBlockProps(id, props)` · `reorder(activeIndex, overIndex)` · `setSettings(patch)` · `select(id)` · `setPropertiesOpen(open)` · `hydrate({ blocks, settings? })` · `undo()` · `markSaved()` · `getPayload()`.

¿Fuera de React? `createEmailBuilderStore(config)` crea el mismo store vanilla (`getState`/`setState`/`subscribe`) sin dependencias.

---

## Notas

- **Estilos**: importa `create-email-template/style.css` una vez. Todo va bajo la clase `.ter-theme` con clases `ter-*` — no colisiona con tu Tailwind/CSS.
- **Componentes sueltos**: también se exportan `BlockPalette`, `Canvas`, `PropertiesPanel`, `EditableBlockRenderer`, `InlineTextEditor`, `SelectionToolbar`, `VariablesInfoDialog` para armar un editor a medida.
- **Demo completa**: `apps/vite-test` del [monorepo](https://github.com/asmel2020/creator-email-templates) — editor con config de muestra, autoguardado, undo y dialog comparando el render de React vs. el HTML del backend.

## Licencia

MIT
