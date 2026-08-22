"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { PromoCode } from "@/components/features/cart/promo-code"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export function OrderSummary({
  subtotal,
  shipping,
  tax,
  discount,
  total,
  currency,
  itemCount,
  checkoutHref = "/checkout",
  showPromo = true,
}: {
  subtotal: number
  shipping: number
  tax?: number
  discount?: number
  total: number
  currency: string
  itemCount: number
  checkoutHref?: string
  showPromo?: boolean
}) {
  const shippingLabel =
    shipping <= 0 ? (itemCount > 0 ? "Calculated at checkout" : "—") : formatMoney(shipping, currency)

  return (
    <aside className="h-fit rounded-lg border border-border bg-card p-5">
      <h2 className="font-serif text-lg font-semibold">Order summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatMoney(subtotal, currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="tabular-nums text-right">{shippingLabel}</dd>
        </div>
        {discount != null && discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="tabular-nums text-success">−{formatMoney(discount, currency)}</dd>
          </div>
        )}
        {tax != null && tax > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="tabular-nums">{formatMoney(tax, currency)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatMoney(total, currency)}</dd>
        </div>
      </dl>

      {showPromo && (
        <div className="mt-5 border-t border-border pt-5">
          <PromoCode />
        </div>
      )}

      <Link
        href={checkoutHref}
        className={cn(buttonVariants({ variant: "trophy", className: "mt-5 w-full" }))}
      >
        Checkout
      </Link>
      <p className="mt-3 text-center text-xs text-muted-foreground">Secure checkout · UPI, cards & more</p>
    </aside>
  )
}
