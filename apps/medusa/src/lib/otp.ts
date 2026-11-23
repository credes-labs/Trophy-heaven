import crypto from "node:crypto"

/**
 * One-time-passcode sign-in helpers (email or Indian mobile number). Pure so they
 * can be unit tested; the routes in api/store/otp/* own storage and delivery.
 */
export const OTP_LENGTH = 6
export const OTP_TTL_SECONDS = 10 * 60
export const OTP_MAX_ATTEMPTS = 5
export const OTP_RESEND_SECONDS = 30

export type OtpIdentifier = { kind: "email"; value: string } | { kind: "phone"; value: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Whether the sign-in response may include the code. Locally: OTP_DEV_ECHO=true. On a
 * hosted client-test site: OTP_TEST_MODE=true, which anyone could use to enter any account,
 * so it is ignored as soon as live Razorpay keys are present.
 */
export function otpCodeVisible(env: Record<string, string | undefined> = process.env): boolean {
  if (env.NODE_ENV !== "production") return env.OTP_DEV_ECHO === "true"
  return env.OTP_TEST_MODE === "true" && !env.RAZORPAY_KEY_ID?.startsWith("rzp_live_")
}

/**
 * Accepts an email address or an Indian mobile number in any common shape
 * (`98765 43210`, `+91-98765-43210`, `09876543210`) and returns its canonical
 * form: lower-cased email, or `+91XXXXXXXXXX`.
 */
export function normalizeIdentifier(input: string): OtpIdentifier | null {
  const raw = input.trim()
  if (!raw) return null
  if (raw.includes("@")) {
    const email = raw.toLowerCase()
    return EMAIL_RE.test(email) && email.length <= 254 ? { kind: "email", value: email } : null
  }
  if (!/^[+\d\s\-().]+$/.test(raw)) return null
  let digits = raw.replace(/\D/g, "")
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2)
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1)
  if (!/^[6-9]\d{9}$/.test(digits)) return null
  return { kind: "phone", value: `+91${digits}` }
}

/** Phone formats an existing customer record may have been saved with. */
export function phoneVariants(e164: string): string[] {
  const local = e164.replace(/^\+91/, "")
  return [e164, local, `91${local}`, `0${local}`, `+91 ${local}`]
}

export function generateOtp(): string {
  return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0")
}

/** Codes are stored hashed and bound to the identifier, peppered with the JWT secret. */
export function hashOtp(code: string, identifier: string, pepper: string): string {
  return crypto.createHmac("sha256", pepper).update(`${identifier}:${code}`).digest("hex")
}

export function otpMatches(code: string, identifier: string, pepper: string, hash: string): boolean {
  if (!/^\d{6}$/.test(code)) return false
  const a = Buffer.from(hashOtp(code, identifier, pepper), "hex")
  const b = Buffer.from(hash, "hex")
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function otpCacheKey(identifier: string): string {
  return `otp:customer:${crypto.createHash("sha256").update(identifier).digest("hex")}`
}

/** `+91XXXXXXXXXX` → `+91 ••••• •3210` for "we sent a code to …" copy. */
export function maskIdentifier(id: OtpIdentifier): string {
  if (id.kind === "phone") return `+91 ••••• •${id.value.slice(-4)}`
  const [user, domain] = id.value.split("@")
  return `${user.slice(0, 2)}${"•".repeat(Math.min(4, Math.max(1, user.length - 2)))}@${domain}`
}
