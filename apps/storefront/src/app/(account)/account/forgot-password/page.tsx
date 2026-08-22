"use client"

import { useState } from "react"
import Link from "next/link"
import { medusa } from "@/lib/medusa"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    try {
      await medusa.auth.resetPassword("customer", "emailpass", {
        identifier: String(form.get("email")),
      })
      setSent(true)
    } catch {
      setError("Could not process the request. Please try again.")
    } finally {
      setLoading(false)
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
          <CardTitle className="mt-4 font-serif text-2xl">Reset your password</CardTitle>
          <CardDescription>
            We will email you a secure link to set a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
              If an account exists for that email, a reset link is on its way. The link
              expires shortly — check your inbox and spam folder.
            </p>
          ) : (
            <>
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
                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  className="w-full"
                  variant="accent"
                >
                  Send reset link
                </Button>
              </form>
            </>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link href="/account/login" className="font-medium text-accent hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
