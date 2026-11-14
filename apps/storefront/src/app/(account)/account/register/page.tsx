"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthFrame } from "@/components/features/account/auth-frame"
import { OtpSignIn } from "@/components/features/account/otp-sign-in"
import { EditorialTextLink } from "@/components/layout/editorial/editorial-cta"
import { safeReturnPath } from "@/lib/safe-return-path"

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = safeReturnPath(params.get("next"))
  const loginHref = next ? `/account/login?next=${encodeURIComponent(next)}` : "/account/login"

  return (
    <>
      <OtpSignIn
        withNames
        submitLabel="Create account"
        onSignedIn={() => router.push(next ?? "/account")}
        terms={
          <label className="flex items-start gap-[0.75em] font-outfit text-[0.875em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
            <input
              type="checkbox"
              name="terms"
              required
              className="mt-[0.2em] size-[0.875em] shrink-0 accent-[#131111]"
            />
            <span>
              I agree to the{" "}
              <EditorialTextLink href="/terms" className="text-[0.875em] normal-case">
                Terms of Service
              </EditorialTextLink>{" "}
              and{" "}
              <EditorialTextLink href="/privacy" className="text-[0.875em] normal-case">
                Privacy Policy
              </EditorialTextLink>
              .
            </span>
          </label>
        }
      />
      <p className="mt-[2em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
        Already have an account?{" "}
        <EditorialTextLink href={loginHref} className="text-[1em]">
          Sign in
        </EditorialTextLink>
      </p>
    </>
  )
}

export default function RegisterPage() {
  return (
    <AuthFrame
      watermark="join"
      eyebrow="Account"
      title="Create account"
      lede="Verify your email or phone with a one-time code. Orders, saved designs and a wishlist follow you."
      illustration
    >
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </AuthFrame>
  )
}
