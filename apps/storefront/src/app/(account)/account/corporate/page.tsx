import type { Metadata } from "next"
import { CorporateDashboard } from "@/components/features/corporate/corporate-dashboard"

export const metadata: Metadata = {
  title: "Corporate dashboard",
  robots: { index: false },
}

export default function CorporateAccountPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Corporate</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your company profile, team seats, payment terms, and bulk orders.
        </p>
      </header>
      <CorporateDashboard />
    </div>
  )
}
