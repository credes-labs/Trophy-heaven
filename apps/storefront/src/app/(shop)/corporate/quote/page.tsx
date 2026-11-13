import type { Metadata } from "next"
import { SimplePageHero } from "@/components/layout/editorial/simple-page-hero"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { QuoteRequestForm } from "@/components/features/corporate/quote-request-form"

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Request a corporate quote from Trophy Heaven — bulk trophies, GST invoicing, and split dispatch across India.",
  alternates: { canonical: "/corporate/quote" },
}

export default function CorporateQuotePage() {
  return (
    <EditorialShell>
      <SimplePageHero
        eyebrow="Organisations"
        watermark="quote"
        title="Tell us the brief."
        body="Quantity, occasion, delivery cities — we reply with a single proof and quote."
      />
      <EditorialFrame>
        <div className="mx-auto max-w-[40em]">
          <QuoteRequestForm />
        </div>
      </EditorialFrame>
    </EditorialShell>
  )
}
