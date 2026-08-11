import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Corporate & Bulk Orders",
  description:
    "Bulk award orders with per-recipient engraving, PO support, and net terms for verified corporate accounts.",
}

/**
 * Corporate landing shell (FR-BULK-1). The bulk pricing calculator, name-list
 * upload, and corporate dashboard are built in Phase 4.
 */
export default function CorporatePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-serif text-4xl font-semibold">Corporate & bulk orders</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Order awards in bulk with per-recipient engraving, purchase orders, and net terms for
        verified accounts. Upload a name list and preview every design before you confirm.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
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
      <div className="mt-8 flex gap-3">
        <Link
          href="/account/register"
          className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Create a corporate account
        </Link>
        <Link href="/help/contact" className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted">
          Talk to sales
        </Link>
      </div>
    </div>
  )
}
