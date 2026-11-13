"use client"

import { create } from "zustand"
import type { Material2D } from "@trophy-heaven/schemas"

const MAX_HISTORY = 50

type EditorState = {
  designId: string | null
  name: string
  productId: string | null
  material: Material2D | null
  selectedObjectId: string | null
  dirty: boolean
  saving: boolean
  validationErrors: string[]

  // Undo/redo history of serialized canvas snapshots (capped at 50 — FR-2D-6).
  history: string[]
  historyIndex: number

  setMeta: (meta: Partial<Pick<EditorState, "designId" | "name" | "productId" | "material">>) => void
  setSelected: (id: string | null) => void
  setSaving: (saving: boolean) => void
  setValidationErrors: (errors: string[]) => void
  pushSnapshot: (snapshot: string) => void
  undo: () => string | null
  redo: () => string | null
  canUndo: () => boolean
  canRedo: () => boolean
  reset: () => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  designId: null,
  name: "Untitled design",
  productId: null,
  material: null,
  selectedObjectId: null,
  dirty: false,
  saving: false,
  validationErrors: [],
  history: [],
  historyIndex: -1,

  setMeta: (meta) => set((s) => ({ ...s, ...meta })),
  setSelected: (id) => set({ selectedObjectId: id }),
  setSaving: (saving) => set({ saving }),
  setValidationErrors: (errors) => set({ validationErrors: errors }),

  pushSnapshot: (snapshot) =>
    set((s) => {
      // Drop any redo branch, append, and cap length.
      const base = s.history.slice(0, s.historyIndex + 1)
      const next = [...base, snapshot]
      const trimmed = next.slice(-MAX_HISTORY)
      return { history: trimmed, historyIndex: trimmed.length - 1, dirty: true }
    }),

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return null
    const idx = historyIndex - 1
    set({ historyIndex: idx, dirty: true })
    return history[idx] ?? null
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return null
    const idx = historyIndex + 1
    set({ historyIndex: idx, dirty: true })
    return history[idx] ?? null
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  reset: () =>
    set({
      designId: null,
      name: "Untitled design",
      productId: null,
      material: null,
      selectedObjectId: null,
      dirty: false,
      saving: false,
      validationErrors: [],
      history: [],
      historyIndex: -1,
    }),
}))

export { MAX_HISTORY }
