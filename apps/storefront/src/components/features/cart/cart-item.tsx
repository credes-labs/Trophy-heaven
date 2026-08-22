"use client"

import Link from "next/link"
import { motion } from "motion/react"
import type { HttpTypes } from "@medusajs/types"
import { QuantityStepper } from "@/components/ui/quantity-stepper"
import { formatMoney } from "@/lib/format"
import { fadeUp } from "@/lib/animations"

export function CartItem({
  item,
  currency,
  onUpdate,
  onRemove,
}: {
  item: HttpTypes.StoreCartLineItem
  currency: string
  onUpdate: (lineId: string, quantity: number) => void
  onRemove: (lineId: string) => void
}) {
  const thumb = item.thumbnail || (item.metadata?.preview_url as string | undefined)
  const lineTotal = (item.unit_price ?? 0) * (item.quantity ?? 1)
  const handle = (item as { product_handle?: string }).product_handle

  return (
    <motion.li
      layout
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, transition: { duration: 0.2 } }}
      className="flex gap-4 overflow-hidden py-5 first:pt-0 last:pb-0"
    >
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted sm:h-28 sm:w-28">
        {thumb ? (
          // Raw <img> used intentionally (dynamic backend URLs; Next/Image domain config not required here).
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-serif text-lg text-muted-foreground opacity-40">
            LC
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:justify-between sm:gap-4">
        <div className="min-w-0">
          {handle ? (
            <Link href={`/products/${handle}`} className="font-medium hover:underline">
              {item.product_title}
            </Link>
          ) : (
            <p className="font-medium">{item.product_title}</p>
          )}
          {item.variant_title && (
            <p className="mt-0.5 text-sm text-muted-foreground">{item.variant_title}</p>
          )}
          {item.metadata?.design_id ? (
            <p className="mt-1 text-xs text-accent">Customized design attached</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={item.quantity ?? 1}
              onChange={(q) => onUpdate(item.id, q)}
              min={1}
              max={99}
            />
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-sm text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
            >
              Remove
            </button>
          </div>
        </div>

        <motion.p
          key={lineTotal}
          initial={{ opacity: 0.4, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="mt-2 shrink-0 font-medium tabular-nums sm:mt-0 sm:text-right"
        >
          {formatMoney(lineTotal, currency)}
        </motion.p>
      </div>
    </motion.li>
  )
}
