"use client"

import Link from "next/link"
import { formatMoney } from "@/lib/format"

export function OrderSummary({
  subtotal,
  shipping,
  tax,
  discount,
  total,
  currency,
  checkoutHref = "/checkout",
  shippingLabel,
  onResolveDesigns,
}: {
  subtotal: number
  shipping: number
  tax?: number
  discount?: number
  total: number
  currency: string
  itemCount?: number
  checkoutHref?: string
  showPromo?: boolean
  /** Overrides the shipping cell (see lib/shipping `cartShippingLabel`). */
  shippingLabel?: string
  /** Set while designs block checkout: the button opens the matching dialog instead. */
  onResolveDesigns?: () => void
}) {
  const shippingValue = shippingLabel ?? (shipping <= 0 ? "Free" : formatMoney(shipping, currency))

  return (
    <aside className="cart-totals">
      <h2 className="m-0 border-b border-[#131111]/15 pb-[0.65em] font-outfit text-[1.125em] font-normal tracking-[0.14em] text-balance text-[#131111] uppercase">
        Cart totals
      </h2>

      <dl className="mt-[1.35em] space-y-[0.85em] font-outfit text-[0.875em] tracking-[-0.02em]">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-[#6B635C]">Shipping (3–5 business days)</dt>
          <dd className="m-0 shrink-0 tabular-nums text-[#131111]">{shippingValue}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-[#6B635C]">TAX (estimated)</dt>
          <dd className="m-0 shrink-0 tabular-nums text-[#131111]">
            {formatMoney(tax ?? 0, currency)}
          </dd>
        </div>
        {discount != null && discount > 0 ? (
          <div className="flex items-start justify-between gap-4">
            <dt className="text-[#6B635C]">Discount</dt>
            <dd className="m-0 shrink-0 tabular-nums text-[#131111]">
              −{formatMoney(discount, currency)}
            </dd>
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-4">
          <dt className="text-[#6B635C]">Subtotal</dt>
          <dd className="m-0 shrink-0 tabular-nums text-[#131111]">
            {formatMoney(subtotal, currency)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-[#131111]/20 pt-[1em]">
          <dt className="text-[1em] text-[#131111]">Total</dt>
          <dd className="m-0 text-[1.25em] font-medium tabular-nums text-[#131111]">
            {formatMoney(total, currency)}
          </dd>
        </div>
      </dl>

      {onResolveDesigns ? (
        <button
          type="button"
          onClick={onResolveDesigns}
          className="mt-[1.75em] flex h-[3.15em] w-full items-center justify-center rounded-[0.125em] bg-[#131111] font-outfit text-[0.8125em] tracking-[0.16em] text-[#F2F1EF] uppercase transition-opacity hover:opacity-85"
        >
          Match designs to continue
        </button>
      ) : (
        <Link
          href={checkoutHref}
          className="mt-[1.75em] flex h-[3.15em] w-full items-center justify-center rounded-[0.125em] bg-[#131111] font-outfit text-[0.8125em] tracking-[0.16em] text-[#F2F1EF] uppercase no-underline transition-opacity hover:opacity-85"
        >
          Proceed to checkout
        </Link>
      )}
      <Link
        href="/shop"
        className="mt-[1em] block text-center font-outfit text-[0.75em] tracking-[0.14em] text-[#6B635C] uppercase no-underline transition-colors hover:text-[#131111]"
      >
        &lt; Continue shopping
      </Link>
    </aside>
  )
}
