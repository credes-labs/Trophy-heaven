"use client"

import { useMemo, useState } from "react"
import { BULK_TIERS, computeBulkQuote } from "@/lib/pricing"
import { formatMoney } from "@/lib/format"

/** Interactive bulk pricing calculator (FR-CORP-2). */
export function BulkCalculator({ basePrice = 1499 }: { basePrice?: number }) {
  const [qty, setQty] = useState(50)
  const quote = useMemo(() => computeBulkQuote(qty, basePrice), [qty, basePrice])

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-serif text-2xl">Estimate your bulk price</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Volume discounts apply automatically. Final pricing is confirmed at checkout.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Quantity</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
          <input
            type="range"
            min={1}
            max={300}
            value={Math.min(qty, 300)}
            onChange={(e) => setQty(Number(e.target.value))}
            className="mt-3 w-full"
          />
          <div className="mt-4 space-y-1 text-xs text-muted-foreground">
            {BULK_TIERS.map((t) => (
              <div
                key={t.label}
                className={
                  quote.tierLabel === t.label ? "font-semibold text-accent" : undefined
                }
              >
                {t.label} units · {(t.discount * 100).toFixed(0)}% off
              </div>
            ))}
          </div>
        </div>

        <dl className="space-y-2 self-start rounded-lg bg-muted p-4 text-sm">
          <div className="flex justify-between">
            <dt>Base unit price</dt>
            <dd>{formatMoney(quote.unitPrice, "inr")}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Volume discount</dt>
            <dd>{(quote.discount * 100).toFixed(0)}%</dd>
          </div>
          <div className="flex justify-between">
            <dt>Discounted unit</dt>
            <dd>{formatMoney(quote.discountedUnit, "inr")}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Subtotal ({quote.quantity})</dt>
            <dd>{formatMoney(quote.subtotal, "inr")}</dd>
          </div>
          <div className="flex justify-between text-success">
            <dt>You save</dt>
            <dd>{formatMoney(quote.savings, "inr")}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
