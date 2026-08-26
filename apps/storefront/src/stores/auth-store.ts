"use client"

import { create } from "zustand"
import { medusa } from "@/lib/medusa"
import type { HttpTypes } from "@medusajs/types"
import { useCartStore } from "@/stores/cart-store"

type AuthState = {
  customer: HttpTypes.StoreCustomer | null
  loading: boolean
  loadCustomer: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    first_name?: string
    last_name?: string
    phone?: string
  }) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  customer: null,
  loading: false,

  loadCustomer: async () => {
    set({ loading: true })
    try {
      const { customer } = await medusa.store.customer.retrieve()
      set({ customer })
    } catch {
      set({ customer: null })
    } finally {
      set({ loading: false })
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      await medusa.auth.login("customer", "emailpass", { email, password })
      const { customer } = await medusa.store.customer.retrieve()
      set({ customer })
      await useCartStore.getState().transferToCustomer()
    } finally {
      set({ loading: false })
    }
  },

  register: async ({ email, password, first_name, last_name, phone }) => {
    set({ loading: true })
    try {
      // 1. Obtain a registration token, 2. create the customer, 3. log in.
      await medusa.auth.register("customer", "emailpass", { email, password })
      await medusa.store.customer.create({ email, first_name, last_name, phone })
      await medusa.auth.login("customer", "emailpass", { email, password })
      const { customer } = await medusa.store.customer.retrieve()
      set({ customer })
      await useCartStore.getState().transferToCustomer()
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    await medusa.auth.logout()
    set({ customer: null })
  },
}))
