"use client"

import type { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export function DeliveryOptions({
  options,
  selectedId,
  onSelect,
  currency,
  busy,
  onBack,
  onContinue,
}: {
  options: HttpTypes.StoreCartShippingOption[]
  selectedId: string
  onSelect: (id: string) => void
  currency: string
  busy?: boolean
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <div className="mt-6 space-y-4">
      <h2 className="font-medium">Select delivery method</h2>

      {options.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
          No shipping options configured for this region yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {options.map((o) => {
            const active = selectedId === o.id
            return (
              <li key={o.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-colors",
                    active ? "border-trophy bg-trophy/5" : "border-border hover:bg-muted/40"
                  )}
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={o.id}
                      checked={active}
                      onChange={() => onSelect(o.id)}
                      className="mt-1 accent-[var(--color-trophy)]"
                    />
                    <span>
                      <span className="block font-medium">{o.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Arrives in estimated transit time for your region
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {(o.amount ?? 0) <= 0 ? "Free" : formatMoney(o.amount ?? 0, currency)}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
          Back
        </Button>
        <Button
          type="button"
          variant="trophy"
          onClick={onContinue}
          disabled={busy || !selectedId}
          loading={busy}
        >
          Continue to payment
        </Button>
      </div>
    </div>
  )
}
