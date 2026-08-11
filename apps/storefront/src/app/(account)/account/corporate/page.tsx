import type { Metadata } from "next"
import { CorporateDashboard } from "@/components/features/corporate/corporate-dashboard"

export const metadata: Metadata = {
  title: "Corporate dashboard",
  robots: { index: false },
}

export default function CorporateAccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-serif text-3xl">Corporate dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your company profile, team seats, payment terms, and bulk orders.
      </p>
      <div className="mt-8">
        <CorporateDashboard />
      </div>
    </div>
  )
}
