"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { medusa } from "@/lib/medusa"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token") ?? ""
  const email = params.get("email") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!token || !email) {
    return (
      <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
        This reset link is invalid or incomplete. Please request a new one from the{" "}
        <Link href="/account/forgot-password" className="font-medium text-accent hover:underline">
          forgot password
        </Link>{" "}
        page.
      </p>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    try {
      await medusa.auth.updateProvider("customer", "emailpass", { email, password }, token)
      router.push("/account/login?reset=1")
    } catch {
      setError("This reset link has expired or is invalid. Please request a new one.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <Input
          type="password"
          required
          minLength={8}
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          type="password"
          required
          label="Confirm new password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button
          type="submit"
          disabled={loading}
          loading={loading}
          className="w-full"
          variant="accent"
        >
          Set new password
        </Button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.10_80_/_0.12),_transparent_55%)]"
        aria-hidden
      />
      <Card className="relative w-full max-w-md border-gold/20 shadow-lg" variant="elevated">
        <CardHeader className="items-center text-center">
          <Logo />
          <CardTitle className="mt-4 font-serif text-2xl">Choose a new password</CardTitle>
          <CardDescription>At least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
