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
  applyPromoCode: (code: string) => Promise<void>
  removePromoCode: (code: string) => Promise<void>
  itemCount: () => number
}

function appliedPromoCodes(cart: HttpTypes.StoreCart | null): string[] {
  return (cart?.promotions ?? [])
    .map((p) => p.code)
    .filter((code): code is string => Boolean(code))
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

  applyPromoCode: async (code) => {
    const current = get().cart
    if (!current) throw new Error("Your cart is still loading — try again in a moment.")
    const normalized = code.trim()
    const existing = appliedPromoCodes(current)
    if (existing.includes(normalized)) return
    set({ loading: true })
    try {
      // Medusa v2 applies promotions by replacing the cart's promo_codes set.
      const { cart } = await medusa.store.cart.update(current.id, {
        promo_codes: [...existing, normalized],
      })
      set({ cart })
      // Invalid/expired codes are silently ignored by the store API — detect
      // that by checking the code landed on the cart's promotions.
      if (!appliedPromoCodes(cart).includes(normalized)) {
        throw new Error(`“${normalized}” is not a valid promo code.`)
      }
    } finally {
      set({ loading: false })
    }
  },

  removePromoCode: async (code) => {
    const current = get().cart
    if (!current) return
    const remaining = appliedPromoCodes(current).filter((c) => c !== code)
    set({ loading: true })
    try {
      const { cart } = await medusa.store.cart.update(current.id, {
        promo_codes: remaining,
      })
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
