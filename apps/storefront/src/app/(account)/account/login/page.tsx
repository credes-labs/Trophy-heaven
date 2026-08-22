"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function ResetBanner() {
  const params = useSearchParams()
  if (params.get("reset") !== "1") return null
  return (
    <p className="mb-4 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
      Password updated. Sign in with your new password.
    </p>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      await login(String(form.get("email")), String(form.get("password")))
      router.push("/account")
    } catch (err) {
      setError((err as Error).message || "Invalid credentials")
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
          <CardTitle className="mt-4 font-serif text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Legacy Crafts account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <ResetBanner />
          </Suspense>
          {error && (
            <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            <Input
              name="email"
              type="email"
              required
              label="Email"
              autoComplete="email"
              placeholder="you@example.com"
            />
            <div>
              <Input
                name="password"
                type="password"
                required
                label="Password"
                autoComplete="current-password"
              />
              <div className="mt-1.5 text-right">
                <Link
                  href="/account/forgot-password"
                  className="text-xs text-muted-foreground hover:text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button type="submit" disabled={loading} loading={loading} className="w-full" variant="accent">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/account/register" className="font-medium text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
