"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"

const dashboardCards = [
  { title: "Orders", desc: "Track orders and reorder", href: "/account/orders" },
  { title: "My designs", desc: "Saved 2D/3D designs", href: "/account/designs" },
  { title: "Addresses", desc: "Shipping & billing", href: "/account/addresses" },
  { title: "Wishlist", desc: "Saved for later", href: "/account/wishlist" },
]

export default function AccountPage() {
  const router = useRouter()
  const { customer, loading, loadCustomer, logout } = useAuthStore()

  useEffect(() => {
    void loadCustomer()
  }, [loadCustomer])

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">Loading…</div>
  }

  if (!customer) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold">Your account</h1>
        <p className="mt-2 text-muted-foreground">Sign in to view your dashboard.</p>
        <Button onClick={() => router.push("/account/login")} className="mt-6">
          Sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">
            Welcome{customer.first_name ? `, ${customer.first_name}` : ""}
          </h1>
          <p className="text-muted-foreground">{customer.email}</p>
        </div>
        <Button variant="outline" onClick={() => logout()}>
          Sign out
        </Button>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {dashboardCards.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-lg border p-5 hover:bg-muted">
            <p className="font-medium">{c.title}</p>
            <p className="text-sm text-muted-foreground">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
