"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { X } from "lucide-react"
import type { HttpTypes } from "@medusajs/types"
import { QuantityStepper } from "@/components/ui/quantity-stepper"
import { CartThumb } from "@/components/features/cart/cart-thumb"
import { LineDesignControl } from "@/components/features/cart/line-design-control"
import { formatMoney } from "@/lib/format"
import { STICKER_DESIGN_KEY } from "@/lib/design-uploads"
import { fadeUp } from "@/lib/animations"

const stepperClass =
  "rounded-[0.125em] border-[#131111]/20 [&_button]:h-9 [&_button]:w-9 [&_button]:hover:bg-[#131111]/5 [&_span]:h-9 [&_span]:min-w-[2.25rem] [&_span]:border-[#131111]/20 [&_span]:font-outfit [&_span]:text-[0.875em]"

export function CartItem({
  item,
  currency,
  onUpdate,
  onRemove,
  busy = false,
}: {
  item: HttpTypes.StoreCartLineItem
  currency: string
  onUpdate: (lineId: string, quantity: number) => void
  onRemove: (lineId: string) => void
  busy?: boolean
}) {
  const thumb = item.thumbnail || (item.metadata?.preview_url as string | undefined)
  const unit = item.unit_price ?? 0
  const lineTotal = item.subtotal ?? unit * (item.quantity ?? 1)
  const handle = (item as { product_handle?: string }).product_handle
  const qty = item.quantity ?? 1
  const variantLine = [item.variant_title, `x${qty}`].filter(Boolean).join(" / ")
  const title = item.product_title ?? "Item"
  const sticker =
    typeof item.metadata?.[STICKER_DESIGN_KEY] === "string" ? String(item.metadata[STICKER_DESIGN_KEY]) : ""

  return (
    <motion.li
      layout
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, transition: { duration: 0.2 } }}
      className="cart-item-row overflow-hidden border-b border-[#131111]/12 py-[1.5em] first:pt-0"
    >
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${title} from cart`}
        className="flex h-8 w-8 items-center justify-center text-[#6B635C] transition-colors hover:text-[#131111]"
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
      </button>

      <CartThumb src={thumb} alt={title} className="h-[5.5em] w-[5.5em] sm:h-[6.25em] sm:w-[6.25em]" />

      <div className="min-w-0">
        {handle ? (
          <Link
            href={`/products/${handle}`}
            className="font-outfit text-[0.9375em] leading-[1.35] font-medium tracking-[-0.02em] text-[#131111] no-underline hover:opacity-70"
          >
            {title}
          </Link>
        ) : (
          <p className="m-0 font-outfit text-[0.9375em] leading-[1.35] font-medium tracking-[-0.02em] text-[#131111]">
            {title}
          </p>
        )}
        {variantLine ? (
          <p className="mt-[0.25em] m-0 font-outfit text-[0.8125em] tracking-[-0.02em] text-[#6B635C]">
            {variantLine}
          </p>
        ) : null}
        {item.metadata?.design_id ? (
          <p className="mt-[0.35em] m-0 font-outfit text-[0.75em] tracking-[-0.02em] text-[#6B635C]">
            Customized design attached
          </p>
        ) : null}
        {sticker ? (
          <p className="mt-[0.35em] m-0 line-clamp-2 font-outfit text-[0.75em] tracking-[-0.02em] text-[#6B635C]">
            Sticker: {sticker}
          </p>
        ) : null}
        <LineDesignControl item={item} disabled={busy} className="mt-[0.6em]" />
      </div>

      <div className="cart-item-qty">
        <QuantityStepper
          value={qty}
          onChange={(q) => onUpdate(item.id, q)}
          min={1}
          max={99}
          disabled={busy}
          className={stepperClass}
        />
      </div>

      <motion.div
        key={lineTotal}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="text-right sm:min-w-[6.5em]"
      >
        <p className="m-0 font-outfit text-[0.9375em] font-medium tracking-[-0.02em] text-[#131111] tabular-nums">
          {formatMoney(lineTotal, currency)}
        </p>
        <p className="mt-[0.15em] m-0 font-outfit text-[0.75em] tracking-[-0.02em] text-[#6B635C] tabular-nums">
          {formatMoney(unit, currency)}
        </p>
      </motion.div>
    </motion.li>
  )
}
