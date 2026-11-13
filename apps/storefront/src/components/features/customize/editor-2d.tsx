"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cart-store"
import { useEditorStore } from "@/stores/editor-store"
import type { DesignRecord } from "@/lib/design-client"
import { track } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import { cheapestInStockVariant } from "@/lib/product-filters"
import {
  LayoutComposePanel,
  LayoutEditorProvider,
  LayoutLibraryPanel,
  LayoutStage,
  type LayoutController,
} from "./layout/layout-editor"
import { StudioTopBar } from "./configurator/studio-top-bar"

const TABS = [
  { id: "compose", label: "Compose" },
  { id: "library", label: "Library" },
] as const
type TabId = (typeof TABS)[number]["id"]

const panelX = "px-[clamp(1.25rem,2.5vw,2.25em)]"
const ringFocus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"

/** Fullscreen 2D editor for products without a 3D studio (the plaque's 2D layout lives in its studio). */
export function Editor2D({
  product,
  initialDesign,
  preferredVariantId,
}: {
  product: HttpTypes.StoreProduct
  initialDesign?: DesignRecord | null
  preferredVariantId?: string
}) {
  const addItem = useCartStore((s) => s.addItem)
  const saving = useEditorStore((s) => s.saving)
  const [tab, setTab] = useState<TabId>("compose")
  const [message, setMessage] = useState<string | null>(null)
  const controllerRef = useRef<LayoutController | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tabsId = useId()

  const variantId =
    product.variants?.find((v) => v.id === preferredVariantId)?.id ?? cheapestInStockVariant(product)?.id
  const variant = product.variants?.find((v) => v.id === variantId)
  const price =
    variant?.calculated_price?.calculated_amount != null
      ? formatMoney(variant.calculated_price.calculated_amount, variant.calculated_price.currency_code ?? "inr")
      : null

  function flash(text: string) {
    if (timer.current) clearTimeout(timer.current)
    setMessage(text)
    timer.current = setTimeout(() => setMessage(null), 2500)
  }
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  async function handleSave() {
    const record = await controllerRef.current?.save()
    if (record) flash("Saved to your gallery")
    return record ?? null
  }

  async function handleAddToCart() {
    const record = await handleSave()
    if (!record || !variantId) return
    await addItem(variantId, 1, {
      design_id: record.id,
      design_name: record.name,
      preview_url: record.preview_url,
      customization_mode: "2d",
    })
    track("design_added_to_cart", { design_id: record.id, mode: "2d", product_id: product.id })
    flash("Added to cart with your design")
  }

  return (
    <LayoutEditorProvider
      product={{ id: product.id, thumbnail: product.thumbnail }}
      variantId={variantId}
      initialDesign={initialDesign}
      controllerRef={controllerRef}
    >
      <section
        aria-labelledby="editor-2d-heading"
        className="grid h-full grid-rows-[40dvh_minmax(0,1fr)] text-[clamp(12px,1.75dvh,16px)] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,27em)] lg:grid-rows-1"
      >
        <div className="relative min-h-0 w-full overflow-hidden">
          <LayoutStage />
          <StudioTopBar mode="2d" />
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden border-t border-[#131111]/10 bg-white lg:border-t-0 lg:border-l">
          <div className={cn("shrink-0 pt-[0.8em] lg:pt-[1.5em]", panelX)}>
            <p className="m-0 hidden font-outfit text-[0.6875em] tracking-[0.14em] text-[#6B635C] uppercase lg:block">
              Design studio · 2D layout
            </p>
            <h1
              id="editor-2d-heading"
              className="m-0 font-outfit text-[1.375em] leading-[1.05] font-normal tracking-[-0.04em] text-balance text-[#131111] lg:mt-[0.3em] lg:text-[1.875em]"
            >
              Design your {product.title}
            </h1>
            <div role="tablist" aria-label="Layout tools" className="mt-[0.7em] flex border-b border-[#131111]/10 lg:mt-[1em]">
              {TABS.map((t) => {
                const selected = t.id === tab
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    id={`${tabsId}-tab-${t.id}`}
                    aria-selected={selected}
                    aria-controls={`${tabsId}-panel`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setTab(t.id)}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
                      e.preventDefault()
                      setTab(tab === "compose" ? "library" : "compose")
                    }}
                    className={cn(
                      "-mb-px min-w-0 flex-1 border-b-[1.5px] px-[0.3em] pt-[0.3em] pb-[0.65em] font-outfit text-[0.6875em] font-medium tracking-[0.12em] uppercase transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#131111]",
                      selected ? "border-[#131111] text-[#131111]" : "border-transparent text-[#6B635C] hover:text-[#131111]"
                    )}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div
            role="tabpanel"
            id={`${tabsId}-panel`}
            aria-labelledby={`${tabsId}-tab-${tab}`}
            className={cn("relative min-h-0 flex-1 overflow-hidden pt-[1em]", panelX)}
          >
            {tab === "compose" ? <LayoutComposePanel /> : <LayoutLibraryPanel />}
          </div>

          <div className={cn("relative shrink-0 border-t border-[#131111]/10 bg-white pt-[0.8em] pb-[max(0.6em,env(safe-area-inset-bottom))] lg:py-[1em]", panelX)}>
            <p
              role="status"
              className={cn(
                "pointer-events-none absolute bottom-[calc(100%+0.6em)] left-1/2 m-0 w-max max-w-[calc(100%-2.5em)] -translate-x-1/2 rounded-[0.5em] bg-[#131111] px-[0.9em] py-[0.5em] font-outfit text-[0.75em] leading-[1.35] text-[#F2F1EF] transition-opacity duration-200",
                message ? "opacity-100" : "opacity-0"
              )}
            >
              {message ?? ""}
            </p>
            <div className="flex items-baseline justify-between gap-3">
              <p className="m-0 min-w-0 truncate font-outfit text-[0.8125em] tracking-[-0.01em] text-[#6B635C]">
                <Link href={`/products/${product.handle}`} className="text-[#6B635C] underline underline-offset-[0.2em] hover:text-[#131111]">
                  {product.title}
                </Link>
              </p>
              <p className="m-0 font-outfit text-[1.375em] tracking-[-0.03em] text-[#131111] tabular-nums" aria-live="polite">
                {price ?? "—"}
              </p>
            </div>
            <div className="mt-[0.75em] flex items-center gap-2">
              <Button
                onClick={handleAddToCart}
                disabled={saving || !variantId}
                className={cn("h-[3em] min-w-0 flex-1 rounded-full font-outfit text-[0.8125em] tracking-[0.08em] uppercase", ringFocus)}
                style={{ backgroundColor: "#131111", color: "#F2F1EF" }}
              >
                Add to cart
              </Button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  "flex h-[3em] items-center justify-center rounded-full border border-[#131111]/25 px-[1.2em] font-outfit text-[0.75em] tracking-[0.08em] text-[#131111] uppercase transition-colors hover:bg-[#131111]/5 disabled:opacity-50",
                  ringFocus
                )}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </LayoutEditorProvider>
  )
}
