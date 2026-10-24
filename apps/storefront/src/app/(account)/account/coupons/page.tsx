"use client"

import { useEffect, useState } from "react"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"
import { Skeleton } from "@/components/ui/skeleton"
import {
  listActivePromotions,
  promotionExpiry,
  promotionLabel,
  type StorePromotion,
} from "@/lib/promotions"
import { useCartStore } from "@/stores/cart-store"

const textBtn =
  "cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"

export default function CouponsPage() {
  const [promotions, setPromotions] = useState<StorePromotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const init = useCartStore((s) => s.init)
  const applyPromoCode = useCartStore((s) => s.applyPromoCode)

  useEffect(() => {
    let cancelled = false
    listActivePromotions()
      .then((items) => {
        if (!cancelled) setPromotions(items)
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(code)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // ignore
    }
  }

  async function applyToCart(code: string) {
    try {
      await init()
      await applyPromoCode(code)
      setAppliedCode(code)
      setTimeout(() => setAppliedCode((current) => (current === code ? null : current)), 3000)
    } catch {
      // Invalid code for the current cart — the cart page surfaces details.
    }
  }

  return (
    <div>
      <header className="relative overflow-hidden">
        <EditorialWatermark>offers</EditorialWatermark>
        <EditorialEyebrow>Account</EditorialEyebrow>
        <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,4vw,3em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
          Coupons
        </h1>
        <p className="relative mt-[1em] m-0 max-w-[28em] font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
          Active offers you can apply to your cart.
        </p>
      </header>

      {loading ? (
        <ul className="mt-[2.5em] m-0 list-none space-y-[0.75em] p-0">
          {Array.from({ length: 2 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="h-28 w-full rounded-[0.125em] bg-[#D9D9D9]" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <p className="mt-[2.5em] m-0 max-w-[28em] font-outfit text-[1em] leading-[1.4] text-[#6B635C]" role="alert">
          Couldn’t load offers right now — please try again later.
        </p>
      ) : promotions.length === 0 ? (
        <p className="mt-[2.5em] m-0 max-w-[28em] font-outfit text-[1em] leading-[1.4] text-[#6B635C]">
          No active offers right now — check back soon.
        </p>
      ) : (
        <section className="mt-[2.5em]">
          <h2 className="m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-balance text-[#6B635C] uppercase">
            Active
          </h2>
          <ul className="mt-[0.5em] m-0 list-none p-0">
            {promotions.map((promotion) => {
              const expires = promotionExpiry(promotion)
              return (
                <li key={promotion.code} className="border-b border-[#CDCDCD] py-[1.25em]">
                  <p className="m-0 font-outfit text-[0.75em] tracking-[-0.02em] text-[#131111] uppercase">
                    {promotion.code}
                  </p>
                  <p className="mt-[0.4em] m-0 font-outfit text-[1.25em] leading-[1.3] font-light tracking-[-0.02em] text-[#131111]">
                    {promotionLabel(promotion)}
                  </p>
                  {promotion.description ? (
                    <p className="mt-[0.5em] m-0 max-w-[42em] font-outfit text-[1em] leading-[1.45] tracking-[-0.02em] text-[#6B635C]">
                      {promotion.description}
                    </p>
                  ) : null}
                  {expires ? (
                    <p className="mt-[0.35em] m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
                      Expires {expires}
                    </p>
                  ) : null}
                  <div className="mt-[0.85em] flex flex-wrap gap-x-[1.25em] gap-y-[0.5em]">
                    <button type="button" onClick={() => void copyCode(promotion.code)} className={textBtn}>
                      {copied === promotion.code ? "Copied" : "Copy code"}
                    </button>
                    <button type="button" onClick={() => void applyToCart(promotion.code)} className={textBtn}>
                      {appliedCode === promotion.code ? "Applied" : "Apply to cart"}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
