"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { ArrowLeft } from "lucide-react"
import { medusa } from "@/lib/medusa"
import { formatMoney } from "@/lib/format"
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

const TIMELINE_STEPS = ["Placed", "Processing", "Shipped", "Delivered"] as const

function timelineIndex(order: HttpTypes.StoreOrder): number {
  switch (order.fulfillment_status) {
    case "fulfilled":
      return 3
    case "shipped":
    case "partially_shipped":
      return 2
    case "not_fulfilled":
    case "partially_fulfilled":
      return 1
    default:
      return 0
  }
}

function StatusTimeline({ order }: { order: HttpTypes.StoreOrder }) {
  const current = timelineIndex(order)
  const estimatedDelivery = new Date(order.created_at)
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7)
  return (
    <Card>
      <CardContent className="py-6">
        <ol className="flex items-center">
          {TIMELINE_STEPS.map((label, i) => {
            const reached = i <= current
            return (
              <li key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                      reached
                        ? "border-gold bg-gold text-walnut"
                        : "border-muted bg-muted text-muted-foreground"
                    )}
                    aria-current={i === current ? "step" : undefined}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-xs whitespace-nowrap",
                      reached ? "font-medium text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <span
                    className={cn(
                      "mx-2 mb-5 h-px flex-1",
                      i < current ? "bg-gold" : "bg-muted"
                    )}
                    aria-hidden
                  />
                )}
              </li>
            )
          })}
        </ol>
        {current < 3 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Estimated delivery by {formatDate(estimatedDelivery)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const [order, setOrder] = useState<HttpTypes.StoreOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const { order: data } = await medusa.store.order.retrieve(params.id, {
          fields:
            "*items,*items.variant,*items.thumbnail,*shipping_address,*billing_address,*shipping_methods,*summary",
        })
        if (!cancelled) setOrder(data)
      } catch (e) {
        if (!cancelled) {
          setOrder(null)
          setError((e as Error).message || "Order not found")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!order || error) {
    return (
      <div className="space-y-4">
        <Link
          href="/account/orders"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
        <Card>
          <CardContent className="py-10 text-muted-foreground">
            {error || "This order could not be loaded."}
          </CardContent>
        </Card>
      </div>
    )
  }

  const ship = order.shipping_address

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/account/orders"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 mb-2 gap-1.5")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Order {orderLabel(order)}
          </h1>
          <Badge variant="gold">{order.fulfillment_status || order.status}</Badge>
        </div>
        <p className="mt-1 text-muted-foreground">Placed {formatDate(order.created_at)}</p>
      </div>

      <StatusTimeline order={order} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
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
              <p className="font-medium">
                {formatMoney(item.total ?? item.unit_price ?? 0, order.currency_code)}
              </p>
            </div>
          ))}
          {(order.items ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No line items on this order.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {ship ? (
              <>
                <p className="text-foreground">
                  {[ship.first_name, ship.last_name].filter(Boolean).join(" ")}
                </p>
                <p>{ship.address_1}</p>
                {ship.address_2 ? <p>{ship.address_2}</p> : null}
                <p>
                  {[ship.city, ship.province, ship.postal_code].filter(Boolean).join(", ")}
                </p>
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
            <CardTitle className="text-base">Payment summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(order.item_subtotal ?? 0, order.currency_code)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatMoney(order.shipping_total ?? 0, order.currency_code)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatMoney(order.tax_total ?? 0, order.currency_code)}</span>
            </div>
            {(order.discount_total ?? 0) > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>-{formatMoney(order.discount_total ?? 0, order.currency_code)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatMoney(order.total ?? 0, order.currency_code)}</span>
            </div>
            <p className="pt-2 text-xs text-muted-foreground">
              Payment: {order.payment_status}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
