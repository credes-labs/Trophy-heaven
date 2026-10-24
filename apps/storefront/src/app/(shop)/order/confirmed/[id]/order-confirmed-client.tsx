"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { CheckCircle2, Truck } from "lucide-react"
import { medusa } from "@/lib/medusa"
import { formatMoney } from "@/lib/format"
import { ShareButtons } from "@/components/features/blog/share-buttons"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function orderLabel(order: HttpTypes.StoreOrder) {
  return order.display_id != null ? `#LC-${order.display_id}` : order.id.slice(0, 12)
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

/** Fallback delivery estimate: order date + 7 days (no fulfillment data at this stage). */
function estimatedDelivery(order: HttpTypes.StoreOrder) {
  const date = new Date(order.created_at)
  date.setDate(date.getDate() + 7)
  return formatDate(date)
}

export function OrderConfirmedClient({ id }: { id: string }) {
  const [order, setOrder] = useState<HttpTypes.StoreOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { order: data } = await medusa.store.order.retrieve(id, {
          fields:
            "*items,*items.variant,*items.thumbnail,*shipping_address,*shipping_methods,*summary",
        })
        if (!cancelled) setOrder(data)
      } catch {
        // Guest checkout or expired session — the static confirmation below
        // still confirms placement; details live in the email + account.
        if (!cancelled) setOrder(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-16">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto h-8 w-72" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="h-9 w-9 text-success" aria-hidden />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-trophy">
          Order confirmed
        </p>
        <h1 className="mt-2 text-balance font-serif text-3xl font-semibold">Thank you for your order</h1>
        <p className="mx-auto mt-3 max-w-[68ch] text-pretty text-muted-foreground">
          Your order has been placed and a confirmation email is on its way. Sign in to view full
          order details and tracking.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/account/orders" className={cn(buttonVariants({ variant: "trophy" }))}>
            Track Order
          </Link>
          <Link href="/shop" className={cn(buttonVariants({ variant: "outline" }))}>
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  const label = orderLabel(order)
  const ship = order.shipping_address

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="h-9 w-9 text-success" aria-hidden />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-trophy">
          Order confirmed
        </p>
        <h1 className="mt-2 text-balance font-serif text-3xl font-semibold">Thank you for your order</h1>
        <p className="mx-auto mt-3 max-w-[68ch] text-pretty text-muted-foreground">
          Order <span className="font-medium text-foreground">{label}</span> · Placed{" "}
          {formatDate(order.created_at)} · A confirmation email is on its way.
        </p>
      </div>

      <Card className="mt-10 border-gold/40 bg-gold/5">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/20">
            <Truck className="h-5 w-5 text-walnut" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium">Estimated delivery</p>
            <p className="max-w-[68ch] text-pretty text-sm text-muted-foreground">
              Arriving by <span className="font-medium text-foreground">{estimatedDelivery(order)}</span>
              . Custom pieces may take 7–14 days — we&apos;ll email updates as it moves.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-balance text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(order.items ?? []).map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.thumbnail ? (
                  // Raw <img> used intentionally (dynamic backend URLs; Next/Image domain config not required here).
                  <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  Qty {item.quantity}
                  {item.variant?.title ? ` · ${item.variant.title}` : ""}
                </p>
              </div>
              <p className="font-medium tabular-nums">
                {formatMoney(item.total ?? item.unit_price ?? 0, order.currency_code)}
              </p>
            </div>
          ))}
          {(order.items ?? []).length === 0 && (
            <p className="max-w-[68ch] text-pretty text-sm text-muted-foreground">No line items on this order.</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-balance text-base">Shipping address</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {ship ? (
              <>
                <p className="text-foreground">
                  {[ship.first_name, ship.last_name].filter(Boolean).join(" ")}
                </p>
                <p>{ship.address_1}</p>
                {ship.address_2 ? <p>{ship.address_2}</p> : null}
                <p>{[ship.city, ship.province, ship.postal_code].filter(Boolean).join(", ")}</p>
                <p>{ship.country_code?.toUpperCase()}</p>
                {ship.phone ? <p className="mt-2">Phone: {ship.phone}</p> : null}
              </>
            ) : (
              <p>No shipping address on file.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-balance text-base">Payment summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatMoney(order.item_subtotal ?? 0, order.currency_code)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="tabular-nums">{formatMoney(order.shipping_total ?? 0, order.currency_code)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (GST)</span>
              <span className="tabular-nums">{formatMoney(order.tax_total ?? 0, order.currency_code)}</span>
            </div>
            {(order.discount_total ?? 0) > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span className="tabular-nums">-{formatMoney(order.discount_total ?? 0, order.currency_code)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span className="tabular-nums">{formatMoney(order.total ?? 0, order.currency_code)}</span>
            </div>
            <p className="max-w-[68ch] pt-2 text-pretty text-xs text-muted-foreground">
              Payment: <Badge variant="gold">{order.payment_status}</Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-center border-t border-border pt-6">
        <ShareButtons
          title={`My Legacy Crafts order ${label}`}
          slug=""
          path={`/order/confirmed/${order.id}`}
        />
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/account/orders" className={cn(buttonVariants({ variant: "trophy" }))}>
          Track Order
        </Link>
        <Link href="/shop" className={cn(buttonVariants({ variant: "outline" }))}>
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
