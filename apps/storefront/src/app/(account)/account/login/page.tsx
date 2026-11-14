"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthFrame } from "@/components/features/account/auth-frame"
import { OtpSignIn } from "@/components/features/account/otp-sign-in"
import { EditorialTextLink } from "@/components/layout/editorial/editorial-cta"
import { safeReturnPath } from "@/lib/safe-return-path"

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = safeReturnPath(params.get("next"))
  const registerHref = next ? `/account/register?next=${encodeURIComponent(next)}` : "/account/register"

  return (
    <>
      <OtpSignIn onSignedIn={() => router.push(next ?? "/account")} />
      <p className="mt-[2em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
        New here? Signing in with a code creates your account, or{" "}
        <EditorialTextLink href={registerHref} className="text-[1em]">
          add your name first
        </EditorialTextLink>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <AuthFrame
      watermark="account"
      eyebrow="Account"
      title="Welcome back"
      lede="Sign in with a one-time code sent to your email or phone."
      illustration
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthFrame>
  )
}
