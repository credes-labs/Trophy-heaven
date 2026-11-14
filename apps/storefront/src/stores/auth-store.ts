"use client"

import { create } from "zustand"
import { medusa } from "@/lib/medusa"
import { requestOtpCode, verifyOtpCode, type OtpRequestResult } from "@/lib/otp-client"
import type { HttpTypes } from "@medusajs/types"
import {
  httpStatusFromError,
  shouldClearSessionOnRetrieveFailure,
} from "@/lib/auth-session"
import { useCartStore } from "@/stores/cart-store"

type AuthState = {
  customer: HttpTypes.StoreCustomer | null
  loading: boolean
  loadCustomer: () => Promise<void>
  /** Sends a sign-in code to an email address or Indian mobile number. */
  requestOtp: (identifier: string) => Promise<OtpRequestResult>
  /** Checks the code and signs in, creating the account on first sign-in. */
  verifyOtp: (input: {
    identifier: string
    code: string
    first_name?: string
    last_name?: string
  }) => Promise<{ isNew: boolean }>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  customer: null,
  loading: false,

  loadCustomer: async () => {
    const existing = get().customer
    if (!existing) set({ loading: true })
    try {
      const { customer } = await medusa.store.customer.retrieve()
      set({ customer })
    } catch (err) {
      if (
        shouldClearSessionOnRetrieveFailure(Boolean(get().customer), httpStatusFromError(err))
      ) {
        set({ customer: null })
      }
    } finally {
      set({ loading: false })
    }
  },

  requestOtp: (identifier) => requestOtpCode(identifier),

  verifyOtp: async (input) => {
    set({ loading: true })
    try {
      const { token, is_new } = await verifyOtpCode(input)
      await medusa.client.setToken(token)
      const { customer } = await medusa.store.customer.retrieve()
      set({ customer })
      await useCartStore.getState().transferToCustomer()
      return { isNew: is_new }
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    await medusa.auth.logout()
    set({ customer: null })
  },
}))
