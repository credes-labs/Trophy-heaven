"use client"

import { ShoppingBag } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"

export function CartButton() {
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)
  const count = useCartStore((s) => s.itemCount())

  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
      className="relative flex h-11 w-11 items-center justify-center rounded-md hover:bg-muted"
    >
      <ShoppingBag className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-accent-foreground">
          {count}
        </span>
      )}
    </button>
  )
}
