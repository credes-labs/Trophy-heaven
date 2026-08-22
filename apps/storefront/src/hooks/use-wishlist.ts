"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { wishlistApi } from "@/lib/wishlist"

/**
 * Wires a wishlist heart to the backend wishlist API (`/store/wishlist`).
 * Loads the saved state on mount, toggles optimistically, and redirects
 * unauthenticated users to login on 401 (mirrors account-shell behaviour).
 */
export function useWishlist(productId: string) {
  const router = useRouter()
  const [wishlisted, setWishlisted] = useState(false)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    wishlistApi
      .list()
      .then(({ items }) => {
        if (!cancelled) {
          setWishlisted(items.some((item) => item.product_id === productId))
        }
      })
      .catch(() => {
        // Unauthenticated or backend unavailable — heart stays unsaved.
      })
    return () => {
      cancelled = true
    }
  }, [productId])

  const toggle = useCallback(async () => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    const optimistic = !wishlisted
    setWishlisted(optimistic)
    try {
      const result = await wishlistApi.add({ product_id: productId, toggle: true })
      if (result.action) setWishlisted(result.action === "added")
    } catch (e) {
      setWishlisted(!optimistic) // roll back optimistic state
      if ((e as { status?: number }).status === 401) {
        router.push("/account/login")
      }
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }, [productId, wishlisted, router])

  return { wishlisted, toggle, busy }
}
