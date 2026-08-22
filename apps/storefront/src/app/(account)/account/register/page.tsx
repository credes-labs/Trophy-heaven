"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const router = useRouter()
  const register = useAuthStore((s) => s.register)
  const loading = useAuthStore((s) => s.loading)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const password = String(form.get("password"))
    const confirm = String(form.get("confirm_password"))
    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    if (!form.get("terms")) {
      setError("Please accept the Terms of Service and Privacy Policy.")
      return
    }
    try {
      await register({
        email: String(form.get("email")),
        password,
        first_name: String(form.get("first_name")),
        last_name: String(form.get("last_name")),
        phone: String(form.get("phone") || "") || undefined,
      })
      router.push("/account")
    } catch (err) {
      setError((err as Error).message || "Could not create account")
    }
  }

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.10_80_/_0.12),_transparent_55%)]"
        aria-hidden
      />
      <Card className="relative w-full max-w-md border-gold/20 shadow-lg" variant="elevated">
        <CardHeader className="items-center text-center">
          <Logo />
          <CardTitle className="mt-4 font-serif text-2xl">Create account</CardTitle>
          <CardDescription>Join Legacy Crafts for orders, designs, and wishlist.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input name="first_name" label="First name" autoComplete="given-name" />
              <Input name="last_name" label="Last name" autoComplete="family-name" />
            </div>
            <Input
              name="email"
              type="email"
              required
              label="Email"
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Input
              name="password"
              type="password"
              required
              minLength={8}
              label="Password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
            <Input
              name="confirm_password"
              type="password"
              required
              minLength={8}
              label="Confirm password"
              autoComplete="new-password"
            />
            <Input
              name="phone"
              type="tel"
              label="Phone (optional)"
              autoComplete="tel"
              placeholder="+91 98765 43210"
            />
            <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <input
                type="checkbox"
                name="terms"
                className="mt-0.5 h-4 w-4 accent-gold"
                required
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-accent hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-accent hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            <Button type="submit" disabled={loading} loading={loading} className="w-full" variant="accent">
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/account/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
