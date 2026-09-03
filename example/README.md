# examples

Proyectos **independientes** que consumen los paquetes publicados en npm (no
`workspace:*`) — simulan a un consumidor real de la librería:

| Carpeta | Stack | Qué demuestra |
|---|---|---|
| `vite-app/` | Vite 8 + React 19 + TS | `<EmailBuilderProvider>` + `<EmailBuilder>` con autosave simulado |
| `nextjs-app/` | Next.js 16 (App Router) | Builder en cliente (`ssr: false`) + render server-side con `create-email-renderer` |

Están **fuera del workspace pnpm** (solo `apps/*` y `packages/*` están en
`pnpm-workspace.yaml`), así que cada proyecto tiene su propio lockfile e
instalación desde el registry.

## Ejecutar

```sh
# Vite — builder completo en http://localhost:5173
cd vite-app && pnpm install && pnpm dev

# Next.js — builder en http://localhost:3000, render server-side en /rendered
cd nextjs-app && pnpm install && pnpm dev
```

## Qué mira cada ejemplo

### `vite-app/src/App.tsx`
- `EmailBuilderProvider` con `config` (blockDefaults, sampleContext),
  `uploadImage` y `autosave` opt-in.
- El `onSave` del autosave es del consumidor: la librería nunca hace network.
  Aquí simula el backend; el contrato real es `PUT /templates/:id → { json, html }`.
- El CSS del builder se importa explícitamente: `import "create-email-template/style.css"`.

### `nextjs-app/`
- `src/app/page.tsx` — carga el builder con `next/dynamic` + `ssr: false`
  (dnd-kit, blob URLs y contenteditable requieren navegador).
- `src/app/layout.tsx` — importa `create-email-template/style.css` globalmente.
- `src/components/email-builder-app.tsx` — provider + builder; el autosave
  llama a **esta misma app** (`POST /api/render`), que responde
  `{ json, html }` como el endpoint real.
- `src/app/api/render/route.ts` — endpoint server-side con
  `renderTemplateEmail` + `parseTemplatePayload` (normaliza el payload).
  Errores → 400 (payload sin bloques, JSON inválido).
- `src/app/rendered/page.tsx` — Server Component async que renderiza un
  payload de ejemplo en el servidor y lo muestra en un `<iframe srcDoc>`.

## Actualizar a una versión nueva de los paquetes

```sh
cd vite-app && pnpm up create-email-template create-email-renderer --latest
cd ../nextjs-app && pnpm up create-email-template create-email-renderer --latest
```

## Troubleshooting

### Modo oscuro del SO pinta el builder con colores rotos

El CSS del builder es autocontenido y light-theme por defecto (dark solo si el
host añade la clase `.dark` sobre `.ter-theme` o un ancestro). Si el host activa
`prefers-color-scheme: dark` en `body`, el texto heredado se vuelve claro y los
títulos de la paleta quedan invisibles sobre tarjetas blancas.

- **En el ejemplo Next** está resuelto: `globals.css` fuerza el tema claro del
  host (`color-scheme: light` y colores literales en `body`, sin media queries
  de `prefers-color-scheme`). Con `create-email-template@0.1.1` de npm esto ya
  se ve correcto; a partir de la versión que incluya el anclaje de `.ter-theme`
  (color/background/color-scheme propios y sin reglas globales en `html`/`body`)
  el builder es robusto ante cualquier host, también en dark.
- **Si quieres el builder en oscuro** en tu app: añade la clase `dark` al
  contenedor (`.dark .ter-theme` activa la paleta oscura del builder).

