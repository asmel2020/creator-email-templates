---
name: create-email-builder
description: Working on the create-email-renderer / create-email-template packages (blocks, docs, examples)
licence: MIT
metadata:
  author: asmel2020
  version: 1.0.0
---

# Skill: trabajar en este monorepo (email builder)

Este repo publica dos paquetes: `create-email-renderer` (core puro, sin React) y
`create-email-template` (editor React). **La documentación canónica para agentes vive dentro de
los paquetes** (viaja en el `npm install`):

| Documento | Contenido |
|---|---|
| [`AGENTS.md`](../../../AGENTS.md) | Fuente de verdad técnica del monorepo: arquitectura, API, convenciones, gotchas, comandos y publicación. **Léelo primero.** |
| [`packages/create-email-renderer/SKILL.md`](../../../packages/create-email-renderer/SKILL.md) | Orientación del paquete core: modelo mental, flujos, recetas y reglas de oro. |
| [`packages/create-email-renderer/docs/BLOCKS.md`](../../../packages/create-email-renderer/docs/BLOCKS.md) | Catálogo de los **25 bloques**: props con defaults, variantes, ejemplos y caveats. |
| [`packages/create-email-renderer/docs/MCP.md`](../../../packages/create-email-renderer/docs/MCP.md) | Cómo exponer el renderer como **MCP** (tools + código). |
| [`packages/create-email-template/SKILL.md`](../../../packages/create-email-template/SKILL.md) | Lado UI: provider, hooks, store, presets y CSS. |

Reglas rápidas del repo:

1. El renderer **nunca** depende de React; el core compartido vive ahí y la UI lo reexporta con
   shims de una línea.
2. Al tocar un bloque: definition en `default-blocks.ts` + `renderHtml` + Preview/Editable/fields.
3. Todo cambio de salida HTML se refleja en el **snapshot de paridad** (`test/`) y se revisa a mano.
4. Gates: `pnpm lint && pnpm check-types && pnpm build && pnpm --filter create-email-renderer test`.
5. Si añades un documento o bloque, actualiza `docs/BLOCKS.md` (hay un test de doc que lo exige).
