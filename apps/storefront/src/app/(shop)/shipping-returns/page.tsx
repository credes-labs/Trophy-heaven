import type { Metadata } from "next"
import { ShippingReturnsTabs } from "./shipping-returns-tabs"

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "Shipping tiers across India and our returns policy for Legacy Crafts orders.",
  alternates: { canonical: "/shipping-returns" },
}

export default function ShippingReturnsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">Policies</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-foreground sm:text-5xl">
          Shipping & returns
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Clear timelines for delivery across India, and a straightforward returns process for
          non-custom pieces.
        </p>
      </header>

      <ShippingReturnsTabs />
    </div>
  )
}
