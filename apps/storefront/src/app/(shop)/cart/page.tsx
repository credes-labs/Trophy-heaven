"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AnimatePresence } from "motion/react"
import { ShoppingBag } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { CartItem } from "@/components/features/cart/cart-item"
import { OrderSummary } from "@/components/features/cart/order-summary"
import { CartRecommendations } from "@/components/features/cart/cart-recommendations"
import { buttonVariants } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const { cart, init, updateItem, removeItem, itemCount } = useCartStore()
  const items = cart?.items ?? []
  const currency = cart?.currency_code ?? "inr"
  const count = itemCount()
  const total = cart?.total ?? cart?.item_subtotal ?? 0

  useEffect(() => {
    void init()
  }, [init])

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-10 md:pb-10">
      <h1 className="font-serif text-3xl font-semibold">
        Your cart{count > 0 ? ` (${count})` : ""}
      </h1>

      {items.length === 0 ? (
        <>
          <div className="mt-10 flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50" aria-hidden />
            <p className="mt-4 font-serif text-xl font-semibold">Your cart is empty</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Explore trophies, furniture, and artwork to find something you love.
            </p>
            <Link href="/shop" className={cn(buttonVariants({ variant: "trophy", className: "mt-6" }))}>
              Continue shopping
            </Link>
          </div>
          <CartRecommendations items={[]} regionId={cart?.region_id} variant="popular" />
        </>
      ) : (
        <>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <ul className="divide-y divide-border rounded-lg border border-border px-4 sm:px-5">
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    currency={currency}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </AnimatePresence>
            </ul>

            <OrderSummary
              subtotal={cart?.item_subtotal ?? 0}
              shipping={cart?.shipping_total ?? 0}
              tax={cart?.tax_total ?? 0}
              discount={cart?.discount_total ?? 0}
              total={total}
              currency={currency}
              itemCount={count}
            />
          </div>

          <CartRecommendations items={items} regionId={cart?.region_id} variant="cross-sell" />

          {/* Sticky mobile summary — sits above the h-16 bottom nav (z-50) */}
          <div
            className="fixed inset-x-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md md:hidden"
            style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                  Total{count > 0 ? ` (${count} item${count === 1 ? "" : "s"})` : ""}
                </p>
                <p className="truncate text-sm font-semibold tabular-nums">
                  {formatMoney(total, currency)}
                </p>
              </div>
              <Link
                href="/checkout"
                className={cn(buttonVariants({ variant: "trophy", size: "sm" }), "shrink-0")}
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
