"use client"

import { useState } from "react"
import { Truck, Package, RotateCcw, ShieldCheck } from "lucide-react"
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const SHIPPING_TIERS = [
  {
    name: "Standard",
    time: "5–7 business days",
    price: "Free above ₹5,000",
    detail: "Available pan-India. Below ₹5,000, a flat courier fee applies at checkout.",
  },
  {
    name: "Express",
    time: "2–3 business days",
    price: "₹299",
    detail: "Priority handling for metro and tier-1 cities when stock is ready to ship.",
  },
  {
    name: "Same-day (Bangalore)",
    time: "Same day",
    price: "₹499",
    detail: "Orders placed before 12:00 IST for in-stock items within Bangalore city limits.",
  },
]

export function ShippingReturnsTabs() {
  const [tab, setTab] = useState("shipping")

  return (
    <TabsRoot value={tab} onValueChange={setTab} variant="pills" className="mt-12">
      <TabsList className="mx-auto w-full max-w-md justify-center">
        <TabsTrigger value="shipping" className="flex-1">
          Shipping
        </TabsTrigger>
        <TabsTrigger value="returns" className="flex-1">
          Returns & exchanges
        </TabsTrigger>
      </TabsList>

      <TabsContent value="shipping" className="mt-10 space-y-6">
        {SHIPPING_TIERS.map((tier) => (
          <div
            key={tier.name}
            className="flex gap-4 rounded-xl border border-border bg-card p-5 sm:p-6"
          >
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-serif text-xl font-semibold text-foreground">{tier.name}</h2>
                <span className="text-sm text-muted-foreground">{tier.time}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-accent">{tier.price}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tier.detail}</p>
            </div>
          </div>
        ))}
        <p className="flex gap-3 text-sm text-muted-foreground">
          <Package className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
          Custom and bulk orders ship after production QA. You will receive tracking once handed to
          the courier.
        </p>
      </TabsContent>

      <TabsContent value="returns" className="mt-10 space-y-6">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex gap-4">
            <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground">7-day return window</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Non-custom items may be returned within 7 days of delivery if unused and in original
                packaging. Initiate a return from your account or email hello@legacycrafts.com with
                your order number.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex gap-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground">Custom pieces</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Engraved, logoed, or made-to-order items are non-returnable. If there is a
                manufacturing defect, we will repair, replace, or refund at our discretion after
                inspection.
              </p>
            </div>
          </div>
        </div>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Request a return — we confirm eligibility and arrange pickup where available.</li>
          <li>We inspect the item on arrival (typically 2–3 business days).</li>
          <li>Approved refunds are issued within 5–7 business days to the original payment method.</li>
        </ol>
      </TabsContent>
    </TabsRoot>
  )
}
