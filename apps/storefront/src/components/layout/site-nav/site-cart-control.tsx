"use client"

import { ShoppingBag } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"

export function SiteCartControl({
  className,
  icon = false,
  onOpen,
}: {
  className?: string
  icon?: boolean
  onOpen?: () => void
}) {
  const count = useCartStore((s) => s.itemCount())
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)
  return (
    <button
      type="button"
      onClick={() => {
        onOpen?.()
        setDrawerOpen(true)
      }}
      aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
      className={className}
      suppressHydrationWarning
    >
      {icon ? (
        <span className="relative">
          <ShoppingBag className="size-5" strokeWidth={1.5} aria-hidden />
          {count > 0 ? (
            <span
              className="absolute -top-2 -right-2 rounded-full bg-[#8A2D25] px-1 font-outfit text-[10px] leading-4 text-white"
              aria-hidden
            >
              {count > 99 ? "99+" : count}
            </span>
          ) : null}
        </span>
      ) : (
        `CART (${count})`
      )}
    </button>
  )
}
