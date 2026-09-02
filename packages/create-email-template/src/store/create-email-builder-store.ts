import { createStore } from "./vanilla-store"
import { newId } from "../core/id"
import { normalizeBlocks } from "../core/normalize"
import {
  createBlock,
  type EmailBlock,
  type EmailBlockProps,
  type EmailBlockType,
  type EmailSettings,
} from "../core/types"
import { type ResolvedEmailBuilderConfig } from "../config/types"

export interface EmailBuilderPayload {
  content: EmailBlock[]
  settings: EmailSettings
}

/** Snapshot del estado previo a un cambio (para undo lineal, sin redo). */
export interface EmailHistoryEntry {
  blocks: EmailBlock[]
  settings: EmailSettings
  /** Clave de agrupación (ej. "blockId:propKey") para coalescer ediciones continuas. */
  coalesceKey: string | null
  at: number
}

export interface EmailBuilderState {
  blocks: EmailBlock[]
  selectedId: string | null
  propertiesOpen: boolean
  settings: EmailSettings
  dirty: boolean
  /** Pila de snapshots para deshacer. Se vacía en `hydrate` (nueva base). */
  past: EmailHistoryEntry[]

  hydrate: (data: {
    blocks: EmailBlock[]
    settings?: Partial<EmailSettings>
  }) => void
  setSettings: (patch: Partial<EmailSettings>) => void
  addBlock: (type: EmailBlockType, index?: number) => void
  reorder: (activeIndex: number, overIndex: number) => void
  updateBlockProps: (id: string, props: EmailBlockProps) => void
  removeBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  select: (id: string | null) => void
  setPropertiesOpen: (open: boolean) => void
  markSaved: () => void
  getPayload: () => EmailBuilderPayload
  /** Deshace el último cambio. Lineal: no hay redo. */
  undo: () => void
}

export type EmailBuilderStore = ReturnType<typeof createEmailBuilderStore>

/** Ventana (ms) para agrupar ediciones continuas del mismo campo en un solo undo. */
const COALESCE_MS = 600

export const createEmailBuilderStore = (
  config: ResolvedEmailBuilderConfig,
) => {
  const historyLimit = config.historyLimit ?? 50

  return createStore<EmailBuilderState>((set, get) => {
    /**
     * Devuelve la pila `past` resultante tras registrar el estado actual.
     * Con `coalesceKey`, las ediciones continuas del mismo campo dentro de
     * COALESCE_MS no generan un snapshot nuevo (Ctrl+Z deshace el trazo entero).
     */
    const snapshot = (
      state: EmailBuilderState,
      coalesceKey: string | null = null,
    ): EmailHistoryEntry[] => {
      const past = [...state.past]
      const last = past[past.length - 1]
      const now = Date.now()
      if (
        coalesceKey &&
        last &&
        last.coalesceKey === coalesceKey &&
        now - last.at < COALESCE_MS
      ) {
        past[past.length - 1] = { ...last, at: now }
        return past
      }
      past.push({
        blocks: structuredClone(state.blocks),
        settings: { ...state.settings },
        coalesceKey,
        at: now,
      })
      while (past.length > historyLimit) past.shift()
      return past
    }

    return {
      blocks: [],
      selectedId: null,
      propertiesOpen: false,
      settings: { ...config.defaultSettings },
      dirty: false,
      past: [],

      hydrate: (data) =>
        set({
          // Normaliza el payload externo (BD/import) contra la blockLibrary
          // resuelta: completa props faltantes y descarta tipos desconocidos.
          blocks: normalizeBlocks(data.blocks, config.blockLibrary),
          settings: { ...get().settings, ...data.settings },
          selectedId: null,
          propertiesOpen: false,
          dirty: false,
          // Cargar una plantilla (del backend) inicia una nueva base:
          // el historial anterior se descarta.
          past: [],
        }),

      setSettings: (patch) => {
        const s = get()
        const changedKey =
          Object.keys(patch).find(
            (k) =>
              !Object.is(
                s.settings[k as keyof EmailSettings],
                patch[k as keyof EmailSettings],
              ),
          ) ?? ""
        const past = snapshot(s, `settings:${changedKey}`)
        set(() => ({
          past,
          settings: { ...s.settings, ...patch },
          dirty: true,
        }))
      },

      addBlock: (type, index) => {
        const s = get()
        const past = snapshot(s)
        const block = createBlock(type, config.blockLibrary)
        const blocks = [...s.blocks]
        const at = index ?? blocks.length
        blocks.splice(at, 0, block)
        set({ past, blocks, selectedId: block.id, dirty: true })
      },

      reorder: (activeIndex, overIndex) => {
        if (activeIndex === overIndex) return
        const s = get()
        const past = snapshot(s)
        const blocks = [...s.blocks]
        const [moved] = blocks.splice(activeIndex, 1)
        blocks.splice(overIndex, 0, moved)
        set({ past, blocks, dirty: true })
      },

      updateBlockProps: (id, props) => {
        const s = get()
        const prev = s.blocks.find((b) => b.id === id)
        let coalesceKey: string | null = id
        if (prev) {
          const changedKey = Object.keys(props).find(
            (k) =>
              !Object.is(
                (prev.props as Record<string, unknown>)[k],
                (props as Record<string, unknown>)[k],
              ),
          )
          coalesceKey = changedKey ? `${id}:${changedKey}` : id
        }
        const past = snapshot(s, coalesceKey)
        const blocks = s.blocks.map((b) => (b.id === id ? { ...b, props } : b))
        set({ past, blocks, dirty: true })
      },

      removeBlock: (id) => {
        const s = get()
        const past = snapshot(s)
        const blocks = s.blocks.filter((b) => b.id !== id)
        set({
          past,
          blocks,
          selectedId: s.selectedId === id ? null : s.selectedId,
          dirty: true,
        })
      },

      duplicateBlock: (id) => {
        const s = get()
        const past = snapshot(s)
        const blocks = [...s.blocks]
        const index = blocks.findIndex((b) => b.id === id)
        if (index === -1) return
        const source = blocks[index]
        const copy: EmailBlock = {
          id: newId(),
          type: source.type,
          props: JSON.parse(JSON.stringify(source.props)),
        }
        blocks.splice(index + 1, 0, copy)
        set({ past, blocks, selectedId: copy.id, dirty: true })
      },

      select: (id) =>
        set((s) => ({
          selectedId: id,
          propertiesOpen: id ? true : s.propertiesOpen,
        })),

      setPropertiesOpen: (open) => set({ propertiesOpen: open }),

      markSaved: () => set({ dirty: false }),

      getPayload: () => {
        const s = get()
        return {
          content: s.blocks,
          settings: { ...s.settings },
        }
      },

      undo: () => {
        const s = get()
        const past = [...s.past]
        const last = past.pop()
        if (!last) return
        set({
          past,
          blocks: structuredClone(last.blocks),
          settings: { ...last.settings },
          selectedId: null,
          dirty: true,
        })
      },
    }
  })
}
