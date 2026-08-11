import type { Metadata } from "next"
import Link from "next/link"
import { BulkCalculator } from "@/components/features/corporate/bulk-calculator"

export const metadata: Metadata = {
  title: "Corporate & Bulk Orders",
  description:
    "Bulk award orders with per-recipient engraving, PO support, and net terms for verified corporate accounts.",
}

/** Corporate landing (FR-CORP-1) with bulk pricing calculator and flow entry. */
export default function CorporatePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-serif text-4xl font-semibold">Corporate & bulk orders</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
        Order awards in bulk with per-recipient engraving, purchase orders, and net terms for
        verified accounts. Upload a name list and preview every design before you confirm.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          "Bulk pricing with quantity breakpoints",
          "Excel/CSV name-list upload with validation",
          "Per-recipient design preview grid",
          "PO support and Net-30 / Net-60 terms",
          "Dedicated account manager",
          "Consolidated invoices with GST breakdown",
        ].map((f) => (
          <li key={f} className="rounded-lg border p-4 text-sm">
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <BulkCalculator />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/corporate/bulk"
          className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Start a bulk order
        </Link>
        <Link
          href="/account/corporate"
          className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
        >
          Corporate dashboard
        </Link>
      </div>
    </div>
  )
}
