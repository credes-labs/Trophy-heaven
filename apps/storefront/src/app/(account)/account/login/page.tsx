"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(form: FormData) {
    setError(null)
    try {
      await login(String(form.get("email")), String(form.get("password")))
      router.push("/account")
    } catch (e) {
      setError((e as Error).message || "Invalid credentials")
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-serif text-2xl font-semibold">Sign in</h1>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <form action={onSubmit} className="mt-6 space-y-4">
        <input name="email" type="email" required placeholder="Email" className="h-11 w-full rounded-md border px-3" />
        <input name="password" type="password" required placeholder="Password" className="h-11 w-full rounded-md border px-3" />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/account/register" className="text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
