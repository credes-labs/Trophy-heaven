import type { Metadata } from "next"
import { SimplePageHero } from "@/components/layout/editorial/simple-page-hero"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { TrackOrderForm } from "@/components/features/orders/track-order-form"

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track a Legacy Crafts order with your order number and email.",
  alternates: { canonical: "/track" },
}

export default function TrackPage() {
  return (
    <EditorialShell>
      <SimplePageHero
        eyebrow="Orders"
        watermark="track"
        title="Track your order."
        body="Enter your order number and email to see where it is."
      />
      <EditorialFrame>
        <div className="mx-auto max-w-[32em]">
          <TrackOrderForm />
        </div>
      </EditorialFrame>
    </EditorialShell>
  )
}
