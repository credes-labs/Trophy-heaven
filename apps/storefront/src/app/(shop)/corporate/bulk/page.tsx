import type { Metadata } from "next"
import { listProducts } from "@/lib/data/catalog"
import { BulkOrderWizard } from "@/components/features/corporate/bulk-wizard"
import { cheapestInStockVariant } from "@/lib/product-filters"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialTextLink } from "@/components/layout/editorial/editorial-cta"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"

export const metadata: Metadata = {
  title: "Start a bulk order",
  description: "Upload a recipient list, preview every engraving, and generate designs in bulk.",
  alternates: { canonical: "/corporate/bulk" },
}

export default async function BulkOrderPage() {
  const { products } = await listProducts({ limit: 50 })
  const options = products.map((p) => ({
    id: p.id,
    title: p.title,
    variantId: cheapestInStockVariant(p)?.id ?? p.variants?.[0]?.id,
  }))

  return (
    <EditorialShell>
      <EditorialFrame>
        <EditorialTextLink href="/corporate">← Corporate</EditorialTextLink>
        <div className="relative mt-[1.5em] max-w-[36em]">
          <EditorialWatermark>list</EditorialWatermark>
          <EditorialEyebrow>Bulk order</EditorialEyebrow>
          <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-[#131111]">
            Upload a name list
          </h1>
          <p className="mt-[1.25em] m-0 font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
            We validate it server-side, then generate a personalized design for every recipient.
          </p>
        </div>
        <div className="mt-[clamp(2em,4vw,3.5em)]">
          {options.length > 0 ? (
            <BulkOrderWizard products={options} />
          ) : (
            <p className="m-0 font-outfit text-[1em] text-[#131111]/70">
              No products are available for bulk ordering yet.
            </p>
          )}
        </div>
      </EditorialFrame>
    </EditorialShell>
  )
}
