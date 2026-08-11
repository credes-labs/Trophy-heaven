"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const router = useRouter()
  const register = useAuthStore((s) => s.register)
  const loading = useAuthStore((s) => s.loading)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(form: FormData) {
    setError(null)
    try {
      await register({
        email: String(form.get("email")),
        password: String(form.get("password")),
        first_name: String(form.get("first_name")),
        last_name: String(form.get("last_name")),
      })
      router.push("/account")
    } catch (e) {
      setError((e as Error).message || "Could not create account")
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-serif text-2xl font-semibold">Create account</h1>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <form action={onSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input name="first_name" placeholder="First name" className="h-11 rounded-md border px-3" />
          <input name="last_name" placeholder="Last name" className="h-11 rounded-md border px-3" />
        </div>
        <input name="email" type="email" required placeholder="Email" className="h-11 w-full rounded-md border px-3" />
        <input name="password" type="password" required minLength={8} placeholder="Password (min 8 chars)" className="h-11 w-full rounded-md border px-3" />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/account/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
