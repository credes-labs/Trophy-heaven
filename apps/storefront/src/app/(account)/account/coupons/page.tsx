"use client"

import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  listActivePromotions,
  promotionExpiry,
  promotionLabel,
  type StorePromotion,
} from "@/lib/promotions"
import { useCartStore } from "@/stores/cart-store"

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
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Coupons</h1>
        <p className="mt-1 text-muted-foreground">
          Active offers you can apply to your cart.
        </p>
      </header>

      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="h-36 w-full" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-sm text-muted-foreground" role="alert">
            Couldn’t load offers right now — please try again later.
          </CardContent>
        </Card>
      ) : promotions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-sm text-muted-foreground">
            No active offers right now — check back soon.
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Active
          </h2>
          <ul className="space-y-3">
            {promotions.map((promotion) => {
              const expires = promotionExpiry(promotion)
              return (
                <li key={promotion.code}>
                  <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                      <div>
                        <Badge variant="gold" className="mb-2 font-mono">
                          {promotion.code}
                        </Badge>
                        <CardTitle className="text-lg">{promotionLabel(promotion)}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {promotion.description && (
                        <p className="text-sm text-muted-foreground">{promotion.description}</p>
                      )}
                      {expires && (
                        <p className="text-xs text-muted-foreground">Expires {expires}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void copyCode(promotion.code)}
                        >
                          {copied === promotion.code ? (
                            <>
                              <Check className="h-3.5 w-3.5" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" /> Copy code
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void applyToCart(promotion.code)}
                        >
                          {appliedCode === promotion.code ? "Applied ✓" : "Apply to cart"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
