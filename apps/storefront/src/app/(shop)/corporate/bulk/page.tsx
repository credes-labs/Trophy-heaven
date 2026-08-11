import type { Metadata } from "next"
import Link from "next/link"
import { listProducts } from "@/lib/data/catalog"
import { BulkOrderWizard } from "@/components/features/corporate/bulk-wizard"

export const metadata: Metadata = {
  title: "Start a bulk order",
  description: "Upload a recipient list, preview every engraving, and generate designs in bulk.",
}

export default async function BulkOrderPage() {
  const { products } = await listProducts({ limit: 50 })
  const options = products.map((p) => ({
    id: p.id,
    title: p.title,
    variantId: p.variants?.[0]?.id,
  }))

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/corporate" className="text-sm text-accent hover:underline">
        ← Corporate
      </Link>
      <h1 className="mt-2 font-serif text-3xl">Bulk order</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload a name list, we validate it server-side, then generate a personalized design for
        every recipient.
      </p>
      <div className="mt-8">
        {options.length > 0 ? (
          <BulkOrderWizard products={options} />
        ) : (
          <p className="text-sm text-muted-foreground">No products are available for bulk ordering yet.</p>
        )}
      </div>
    </div>
  )
}
