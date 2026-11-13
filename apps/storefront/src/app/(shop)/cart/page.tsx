"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "motion/react"
import { RefreshCw } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { CartItem } from "@/components/features/cart/cart-item"
import { OrderSummary } from "@/components/features/cart/order-summary"
import { PromoCode } from "@/components/features/cart/promo-code"
import { CartRecommendations } from "@/components/features/cart/cart-recommendations"
import "./cart.css"

export default function CartPage() {
  const router = useRouter()
  const cart = useCartStore((s) => s.cart)
  const loading = useCartStore((s) => s.loading)
  const init = useCartStore((s) => s.init)
  const refresh = useCartStore((s) => s.refresh)
  const updateItem = useCartStore((s) => s.updateItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const pendingLineIds = useCartStore((s) => s.pendingLineIds)
  const items = cart?.items ?? []
  const currency = cart?.currency_code ?? "inr"
  const total = cart?.total ?? cart?.item_subtotal ?? 0
  const empty = !loading && items.length === 0

  useEffect(() => {
    void init()
  }, [init])

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }
    router.push("/shop")
  }

  return (
    <div className="bg-white font-outfit text-[#131111] lg:[font-size:min(1rem,calc(100vw/90))]">
      <div className="mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(2rem,4vw,3.5em)] pb-[clamp(5rem,10vw,7em)]">
        <button
          type="button"
          onClick={goBack}
          className="font-outfit text-[0.8125em] tracking-[-0.02em] text-[#6B635C] transition-colors hover:text-[#131111]"
        >
          &lt; Back
        </button>
        <h1 className="mt-[0.85em] m-0 font-outfit text-[clamp(2rem,4.5vw,3.25em)] leading-[1.1] font-light tracking-[0.08em] text-balance text-[#131111] uppercase">
          Your cart
        </h1>

        {loading && items.length === 0 ? (
          <p className="mt-[2em] font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
            Loading cart…
          </p>
        ) : empty ? (
          <>
            <p className="mt-[1.75em] max-w-[28em] font-outfit text-[0.9375em] leading-[1.55] font-light tracking-[-0.02em] text-pretty text-[#6B635C]">
              Your cart is empty. Explore trophies and awards to find something worth presenting.
            </p>
            <Link
              href="/shop"
              className="mt-[1.5em] inline-block font-outfit text-[0.75em] tracking-[0.14em] text-[#131111] uppercase no-underline hover:opacity-70"
            >
              &lt; Continue shopping
            </Link>
            <CartRecommendations items={[]} regionId={cart?.region_id} variant="popular" />
          </>
        ) : (
          <>
            <div className="cart-layout mt-[2.25em]">
              <div>
                <ul className="m-0 list-none border-t border-[#131111]/12 p-0">
                  <AnimatePresence initial={false} mode="popLayout">
                    {items.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        currency={currency}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                        busy={loading || pendingLineIds.includes(item.id)}
                      />
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="cart-coupon mt-[1.75em] border-t border-[#131111]/12 pt-[1.5em]">
                  <div className="cart-coupon-row">
                    <PromoCode />
                    <button
                      type="button"
                      onClick={() => void refresh()}
                      disabled={loading}
                      className="flex items-center gap-2 self-end font-outfit text-[0.75em] tracking-[0.14em] text-[#131111] uppercase transition-opacity hover:opacity-70 disabled:opacity-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                      Update cart
                    </button>
                  </div>
                </div>
              </div>

              <OrderSummary
                subtotal={cart?.item_subtotal ?? 0}
                shipping={cart?.shipping_total ?? 0}
                tax={cart?.tax_total ?? 0}
                discount={cart?.discount_total ?? 0}
                total={total}
                currency={currency}
              />
            </div>

            <CartRecommendations items={items} regionId={cart?.region_id} variant="cross-sell" />
          </>
        )}
      </div>
    </div>
  )
}
