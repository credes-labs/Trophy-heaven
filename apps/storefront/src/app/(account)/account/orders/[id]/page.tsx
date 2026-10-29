"use client"

import { useEffect, useState } from "react"
import { localizeImageUrl } from "@/lib/images"
import Link from "next/link"
import { useParams } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { medusa } from "@/lib/medusa"
import { formatMoney } from "@/lib/format"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const textLink =
  "font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"

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
    <div className="border-y border-[#CDCDCD] py-[1.5em]">
      <ol className="m-0 flex list-none items-center p-0">
        {TIMELINE_STEPS.map((label, i) => {
          const reached = i <= current
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-[0.4em]">
                <span
                  className={cn(
                    "flex size-[1.75em] items-center justify-center rounded-full font-outfit text-[0.75em] tabular-nums",
                    reached ? "bg-[#131111] text-[#F2F1EF]" : "bg-[#E4DDD2] text-[#6B635C]"
                  )}
                  aria-current={i === current ? "step" : undefined}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    "font-outfit text-[0.75em] tracking-[-0.02em] whitespace-nowrap uppercase",
                    reached ? "text-[#131111]" : "text-[#6B635C]"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < TIMELINE_STEPS.length - 1 ? (
                <span
                  className={cn("mx-[0.5em] mb-[1.25em] h-px flex-1", i < current ? "bg-[#131111]" : "bg-[#CDCDCD]")}
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>
      {current < 3 ? (
        <p className="mt-[1.25em] m-0 text-center font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
          Estimated delivery by {formatDate(estimatedDelivery)}
        </p>
      ) : null}
    </div>
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
      <div className="space-y-[1em]">
        <Skeleton className="h-8 w-48 rounded-[0.125em] bg-[#D9D9D9]" />
        <Skeleton className="h-40 w-full rounded-[0.125em] bg-[#D9D9D9]" />
        <Skeleton className="h-64 w-full rounded-[0.125em] bg-[#D9D9D9]" />
      </div>
    )
  }

  if (!order || error) {
    return (
      <div>
        <Link href="/account/orders" className={textLink}>
          Back to orders
        </Link>
        <p className="mt-[1.5em] m-0 max-w-[28em] font-outfit text-[1em] leading-[1.4] text-[#6B635C]">
          {error || "This order could not be loaded."}
        </p>
      </div>
    )
  }

  const ship = order.shipping_address
  const money = (amount: number) => formatMoney(amount, order.currency_code)

  return (
    <div>
      <header className="relative overflow-hidden">
        <EditorialWatermark>order</EditorialWatermark>
        <Link href="/account/orders" className={textLink}>
          Back to orders
        </Link>
        <div className="mt-[1.5em]">
          <EditorialEyebrow>Account</EditorialEyebrow>
        </div>
        <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,4vw,3em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
          Order {orderLabel(order)}
        </h1>
        <p className="relative mt-[0.75em] m-0 font-outfit text-[1em] tracking-[-0.02em] text-[#6B635C]">
          Placed {formatDate(order.created_at)} · {order.fulfillment_status || order.status}
        </p>
      </header>

      <div className="mt-[2em]">
        <StatusTimeline order={order} />
      </div>

      <section className="mt-[2.5em]">
        <h2 className="m-0 font-outfit text-[1.25em] leading-[1.25] font-light tracking-[-0.02em] text-balance text-[#131111] uppercase">
          Items
        </h2>
        <ul className="mt-[0.5em] m-0 list-none p-0">
          {(order.items ?? []).map((item) => (
            <li key={item.id} className="flex gap-[1em] border-b border-[#CDCDCD] py-[1em]">
              <div className="size-[4em] shrink-0 overflow-hidden rounded-[0.125em] bg-[#D9D9D9]">
                {item.thumbnail ? (
                  // Raw <img> used intentionally (dynamic backend URLs; Next/Image domain config not required here).
                  <img src={localizeImageUrl(item.thumbnail)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="m-0 font-outfit text-[1em] tracking-[-0.02em] text-[#131111]">{item.title}</p>
                <p className="mt-[0.2em] m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
                  Qty {item.quantity}
                  {item.variant?.title ? ` · ${item.variant.title}` : ""}
                </p>
              </div>
              <p className="m-0 font-outfit text-[1em] tracking-[-0.02em] text-[#131111] tabular-nums">
                {money(item.total ?? item.unit_price ?? 0)}
              </p>
            </li>
          ))}
        </ul>
        {(order.items ?? []).length === 0 ? (
          <p className="mt-[1em] m-0 font-outfit text-[0.875em] text-[#6B635C]">No line items on this order.</p>
        ) : null}
      </section>

      <div className="mt-[2.5em] grid gap-[2.5em] md:grid-cols-2">
        <section>
          <h2 className="m-0 font-outfit text-[1.25em] leading-[1.25] font-light tracking-[-0.02em] text-balance text-[#131111] uppercase">
            Shipping
          </h2>
          <div className="mt-[0.85em] font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-[#6B635C]">
            {ship ? (
              <>
                <p className="m-0 text-[#131111]">
                  {[ship.first_name, ship.last_name].filter(Boolean).join(" ")}
                </p>
                <p className="m-0">{ship.address_1}</p>
                {ship.address_2 ? <p className="m-0">{ship.address_2}</p> : null}
                <p className="m-0">{[ship.city, ship.province, ship.postal_code].filter(Boolean).join(", ")}</p>
                <p className="m-0">{ship.country_code?.toUpperCase()}</p>
                {ship.phone ? <p className="mt-[0.5em] m-0">Phone: {ship.phone}</p> : null}
              </>
            ) : (
              <p className="m-0">No shipping address on file.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="m-0 font-outfit text-[1.25em] leading-[1.25] font-light tracking-[-0.02em] text-balance text-[#131111] uppercase">
            Payment summary
          </h2>
          <dl className="mt-[0.85em] font-outfit text-[1em] tracking-[-0.02em]">
            <div className="flex justify-between border-b border-[#CDCDCD] py-[0.65em]">
              <dt className="text-[#6B635C]">Subtotal</dt>
              <dd className="m-0 tabular-nums">{money(order.item_subtotal ?? 0)}</dd>
            </div>
            <div className="flex justify-between border-b border-[#CDCDCD] py-[0.65em]">
              <dt className="text-[#6B635C]">Shipping</dt>
              <dd className="m-0 tabular-nums">{money(order.shipping_total ?? 0)}</dd>
            </div>
            <div className="flex justify-between border-b border-[#CDCDCD] py-[0.65em]">
              <dt className="text-[#6B635C]">Tax</dt>
              <dd className="m-0 tabular-nums">{money(order.tax_total ?? 0)}</dd>
            </div>
            {(order.discount_total ?? 0) > 0 ? (
              <div className="flex justify-between border-b border-[#CDCDCD] py-[0.65em]">
                <dt>Discount</dt>
                <dd className="m-0 tabular-nums">-{money(order.discount_total ?? 0)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between py-[0.85em]">
              <dt>Total</dt>
              <dd className="m-0 tabular-nums">{money(order.total ?? 0)}</dd>
            </div>
          </dl>
          <p className="m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
            Payment: {order.payment_status}
          </p>
        </section>
      </div>
    </div>
  )
}
