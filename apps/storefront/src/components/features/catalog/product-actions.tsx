"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatMoney, isCustomizable } from "@/lib/format"
import { useCartStore } from "@/stores/cart-store"

/**
 * Client PDP actions: variant/option selection, live price, add-to-cart, and —
 * for customizable products — a "Customize" CTA that routes into the 2D/3D
 * engine (built in Phases 2–3).
 */
export function ProductActions({ product }: { product: HttpTypes.StoreProduct }) {
  const options = product.options ?? []
  const variants = product.variants ?? []
  const addItem = useCartStore((s) => s.addItem)
  const loading = useCartStore((s) => s.loading)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [added, setAdded] = useState(false)

  const activeVariant = useMemo(() => {
    if (!options.length) return variants[0]
    return variants.find((v) =>
      (v.options ?? []).every((o) => selected[o.option_id ?? ""] === o.value)
    )
  }, [options.length, variants, selected])

  const price = activeVariant?.calculated_price
  const level = (product.metadata?.customization_level as string) ?? "none"
  const customizable = isCustomizable(level)

  async function handleAdd() {
    if (!activeVariant) return
    await addItem(activeVariant.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-6">
      {options.map((option) => (
        <div key={option.id}>
          <p className="mb-2 text-sm font-medium">{option.title}</p>
          <div className="flex flex-wrap gap-2">
            {(option.values ?? []).map((val) => {
              const isActive = selected[option.id] === val.value
              return (
                <button
                  key={val.id}
                  data-touch-target
                  onClick={() => setSelected((s) => ({ ...s, [option.id]: val.value }))}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm transition-colors",
                    isActive ? "border-accent bg-accent/10 text-foreground" : "hover:bg-muted"
                  )}
                >
                  {val.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="text-2xl font-semibold">
        {price ? formatMoney(price.calculated_amount ?? 0, price.currency_code ?? "inr") : "Select options"}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {customizable && (
          <Link
            href={`/customize/${product.id}${level === "full_3d" ? "/3d" : "/2d"}`}
            className={cn("flex-1 rounded-md bg-accent px-5 py-3 text-center text-sm font-medium text-accent-foreground hover:opacity-90")}
          >
            Customize this design
          </Link>
        )}
        <Button
          onClick={handleAdd}
          disabled={!activeVariant || loading}
          variant={customizable ? "outline" : "default"}
          className="flex-1"
        >
          {added ? "Added ✓" : activeVariant ? "Add to cart" : "Select options"}
        </Button>
      </div>
    </div>
  )
}
