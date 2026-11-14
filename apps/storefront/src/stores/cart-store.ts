"use client"

import { create } from "zustand"
import { medusa } from "@/lib/medusa"
import { getRegion } from "@/lib/regions"
import type { HttpTypes } from "@medusajs/types"

const CART_ID_KEY = "lc_cart_id"

type CartState = {
  cart: HttpTypes.StoreCart | null
  loading: boolean
  pendingLineIds: string[]
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  init: (regionId?: string) => Promise<void>
  refresh: () => Promise<void>
  adoptCart: (cartId: string, mergeFrom?: HttpTypes.StoreCart | null) => Promise<void>
  transferToCustomer: () => Promise<void>
  addItem: (variantId: string, quantity?: number, metadata?: Record<string, unknown>) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  /** Merges keys into a line's metadata (`null` clears a key), keeping its quantity. */
  updateItemMetadata: (lineId: string, patch: Record<string, unknown>) => Promise<void>
  /** Merges keys into the cart's metadata (`null` clears a key). Copied to the order. */
  updateCartMetadata: (patch: Record<string, unknown>) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  applyPromoCode: (code: string) => Promise<void>
  removePromoCode: (code: string) => Promise<void>
  itemCount: () => number
}

function mergeMetadata(
  current: Record<string, unknown> | null | undefined,
  patch: Record<string, unknown>
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...(current ?? {}) }
  for (const [key, value] of Object.entries(patch)) {
    // Medusa merges metadata and deletes keys sent as "", so "" clears a key
    // whether the backend merges or replaces; readers treat "" as absent.
    next[key] = value === null || value === undefined ? "" : value
  }
  return next
}

function appliedPromoCodes(cart: HttpTypes.StoreCart | null): string[] {
  return (cart?.promotions ?? [])
    .map((p) => p.code)
    .filter((code): code is string => Boolean(code))
}

let ensureCartInflight: Promise<HttpTypes.StoreCart> | null = null

async function resolveRegionId(explicit?: string): Promise<string | undefined> {
  if (explicit) return explicit
  try {
    const region = await getRegion()
    return region?.id
  } catch {
    return undefined
  }
}

async function ensureCart(regionId?: string): Promise<HttpTypes.StoreCart> {
  if (!ensureCartInflight) {
    ensureCartInflight = (async () => {
      const resolvedRegion = await resolveRegionId(regionId)
      const existingId = typeof window !== "undefined" ? localStorage.getItem(CART_ID_KEY) : null
      if (existingId) {
        try {
          const { cart } = await medusa.store.cart.retrieve(existingId)
          if (cart && !cart.completed_at) {
            if (resolvedRegion && cart.region_id && cart.region_id !== resolvedRegion) {
              const { cart: updated } = await medusa.store.cart.update(cart.id, {
                region_id: resolvedRegion,
              })
              return updated
            }
            return cart
          }
        } catch {
          // fall through to create a fresh cart
        }
      }
      const { cart } = await medusa.store.cart.create(
        resolvedRegion ? { region_id: resolvedRegion } : {}
      )
      localStorage.setItem(CART_ID_KEY, cart.id)
      return cart
    })()
  }
  const pending = ensureCartInflight
  try {
    return await pending
  } finally {
    if (ensureCartInflight === pending) ensureCartInflight = null
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  pendingLineIds: [],
  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),

  init: async (regionId) => {
    if (get().cart) return
    set({ loading: true })
    try {
      const cart = await ensureCart(regionId)
      set({ cart })
    } catch {
      // Medusa down / network error — leave cart empty so the storefront still paints.
    } finally {
      set({ loading: false })
    }
  },

  refresh: async () => {
    const current = get().cart
    const id =
      current?.id ??
      (typeof window !== "undefined" ? localStorage.getItem(CART_ID_KEY) : null)
    if (!id) return
    set({ loading: true })
    try {
      const { cart } = await medusa.store.cart.retrieve(id)
      set({ cart })
    } catch {
      // Keep the last known cart if retrieve fails.
    } finally {
      set({ loading: false })
    }
  },

  adoptCart: async (cartId, mergeFrom) => {
    set({ loading: true })
    try {
      localStorage.setItem(CART_ID_KEY, cartId)
      ensureCartInflight = null
      let { cart } = await medusa.store.cart.retrieve(cartId)
      if (mergeFrom?.id && mergeFrom.id !== cartId) {
        for (const item of mergeFrom.items ?? []) {
          if (!item.variant_id) continue
          const { cart: next } = await medusa.store.cart.createLineItem(cartId, {
            variant_id: item.variant_id,
            quantity: item.quantity ?? 1,
            metadata: (item.metadata as Record<string, unknown> | undefined) ?? undefined,
          })
          cart = next
        }
      }
      set({ cart })
    } finally {
      set({ loading: false })
    }
  },

  transferToCustomer: async () => {
    const id =
      get().cart?.id ??
      (typeof window !== "undefined" ? localStorage.getItem(CART_ID_KEY) : null)
    if (!id) return
    try {
      const { cart } = await medusa.store.cart.transferCart(id)
      set({ cart })
      localStorage.setItem(CART_ID_KEY, cart.id)
    } catch {
      // Cart already belongs to this customer, or the guest cart is gone.
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
    set((s) => ({
      loading: true,
      pendingLineIds: s.pendingLineIds.includes(lineId)
        ? s.pendingLineIds
        : [...s.pendingLineIds, lineId],
    }))
    try {
      const { cart } = await medusa.store.cart.updateLineItem(current.id, lineId, { quantity })
      set({ cart })
    } finally {
      set((s) => ({
        loading: false,
        pendingLineIds: s.pendingLineIds.filter((id) => id !== lineId),
      }))
    }
  },

  updateItemMetadata: async (lineId, patch) => {
    const current = get().cart
    const line = current?.items?.find((i) => i.id === lineId)
    if (!current || !line) return
    set((s) => ({ loading: true, pendingLineIds: [...s.pendingLineIds, lineId] }))
    try {
      const { cart } = await medusa.store.cart.updateLineItem(current.id, lineId, {
        quantity: line.quantity ?? 1,
        metadata: mergeMetadata(line.metadata as Record<string, unknown> | null, patch),
      })
      set({ cart })
    } finally {
      set((s) => ({
        loading: false,
        pendingLineIds: s.pendingLineIds.filter((id) => id !== lineId),
      }))
    }
  },

  updateCartMetadata: async (patch) => {
    const current = get().cart ?? (await ensureCart())
    set({ loading: true })
    try {
      const { cart } = await medusa.store.cart.update(current.id, {
        metadata: mergeMetadata(current.metadata as Record<string, unknown> | null, patch),
      })
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
