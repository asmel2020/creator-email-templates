import { createStore } from "zustand/vanilla"
import { v4 as uuidv4 } from "uuid"
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

export interface EmailBuilderState {
  blocks: EmailBlock[]
  selectedId: string | null
  propertiesOpen: boolean
  settings: EmailSettings
  dirty: boolean

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
}

export type EmailBuilderStore = ReturnType<typeof createEmailBuilderStore>

export const createEmailBuilderStore = (config: ResolvedEmailBuilderConfig) =>
  createStore<EmailBuilderState>((set, get) => ({
    blocks: [],
    selectedId: null,
    propertiesOpen: false,
    settings: { ...config.defaultSettings },
    dirty: false,

    hydrate: (data) =>
      set({
        blocks: data.blocks,
        settings: { ...get().settings, ...data.settings },
        selectedId: null,
        propertiesOpen: false,
        dirty: false,
      }),

    setSettings: (patch) =>
      set(() => ({ settings: { ...get().settings, ...patch }, dirty: true })),

    addBlock: (type, index) => {
      const block = createBlock(type, config.blockLibrary)
      const blocks = [...get().blocks]
      const at = index ?? blocks.length
      blocks.splice(at, 0, block)
      set({ blocks, selectedId: block.id, dirty: true })
    },

    reorder: (activeIndex, overIndex) => {
      if (activeIndex === overIndex) return
      const blocks = [...get().blocks]
      const [moved] = blocks.splice(activeIndex, 1)
      blocks.splice(overIndex, 0, moved)
      set({ blocks, dirty: true })
    },

    updateBlockProps: (id, props) => {
      const blocks = get().blocks.map((b) =>
        b.id === id ? { ...b, props } : b
      )
      set({ blocks, dirty: true })
    },

    removeBlock: (id) => {
      const blocks = get().blocks.filter((b) => b.id !== id)
      set({
        blocks,
        selectedId: get().selectedId === id ? null : get().selectedId,
        dirty: true,
      })
    },

    duplicateBlock: (id) => {
      const blocks = [...get().blocks]
      const index = blocks.findIndex((b) => b.id === id)
      if (index === -1) return
      const source = blocks[index]
      const copy: EmailBlock = {
        id: uuidv4(),
        type: source.type,
        props: JSON.parse(JSON.stringify(source.props)),
      }
      blocks.splice(index + 1, 0, copy)
      set({ blocks, selectedId: copy.id, dirty: true })
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
  }))
