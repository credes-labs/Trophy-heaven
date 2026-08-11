"use client"

import { create } from "zustand"
import { medusa } from "@/lib/medusa"
import type { HttpTypes } from "@medusajs/types"

const CART_ID_KEY = "lc_cart_id"

type CartState = {
  cart: HttpTypes.StoreCart | null
  loading: boolean
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  init: (regionId?: string) => Promise<void>
  addItem: (variantId: string, quantity?: number, metadata?: Record<string, unknown>) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  itemCount: () => number
}

async function ensureCart(regionId?: string): Promise<HttpTypes.StoreCart> {
  const existingId = typeof window !== "undefined" ? localStorage.getItem(CART_ID_KEY) : null
  if (existingId) {
    try {
      const { cart } = await medusa.store.cart.retrieve(existingId)
      if (cart && !cart.completed_at) return cart
    } catch {
      // fall through to create a fresh cart
    }
  }
  const { cart } = await medusa.store.cart.create(regionId ? { region_id: regionId } : {})
  localStorage.setItem(CART_ID_KEY, cart.id)
  return cart
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),

  init: async (regionId) => {
    if (get().cart) return
    set({ loading: true })
    try {
      const cart = await ensureCart(regionId)
      set({ cart })
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (variantId, quantity = 1, metadata) => {
    set({ loading: true })
    try {
      const current = get().cart ?? (await ensureCart())
      const { cart } = await medusa.store.cart.createLineItem(current.id, {
        variant_id: variantId,
        quantity,
        metadata,
      })
      set({ cart, drawerOpen: true })
    } finally {
      set({ loading: false })
    }
  },

  updateItem: async (lineId, quantity) => {
    const current = get().cart
    if (!current) return
    set({ loading: true })
    try {
      const { cart } = await medusa.store.cart.updateLineItem(current.id, lineId, { quantity })
      set({ cart })
    } finally {
      set({ loading: false })
    }
  },

  removeItem: async (lineId) => {
    const current = get().cart
    if (!current) return
    set({ loading: true })
    try {
      await medusa.store.cart.deleteLineItem(current.id, lineId)
      const { cart } = await medusa.store.cart.retrieve(current.id)
      set({ cart })
    } finally {
      set({ loading: false })
    }
  },

  itemCount: () => {
    const cart = get().cart
    return cart?.items?.reduce((sum, i) => sum + (i.quantity ?? 0), 0) ?? 0
  },
}))

export { CART_ID_KEY }
