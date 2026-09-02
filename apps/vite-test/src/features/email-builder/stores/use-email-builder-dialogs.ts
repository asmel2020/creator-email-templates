import { create } from "zustand"

// 1. Define los tipos de dialog del feature (identificadores)
type EmailBuilderDialogType = "preview"

interface EmailBuilderDialogsState {
  open: EmailBuilderDialogType | null
  setOpen: (open: EmailBuilderDialogType | null) => void
}

export const useEmailBuilderDialogsStore =
  create<EmailBuilderDialogsState>()((set) => ({
    open: null,
    setOpen: (open) =>
      set((state) => ({ open: state.open === open ? null : open })),
  }))
