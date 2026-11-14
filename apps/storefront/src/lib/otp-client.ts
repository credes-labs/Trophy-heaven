import { BACKEND_URL, PUBLISHABLE_KEY } from "./medusa"

/** Client for the Medusa OTP sign-in routes (apps/medusa/src/api/store/otp). */
export type OtpRequestResult = {
  channel: "email" | "phone"
  destination: string
  expires_in: number
  resend_in: number
  /** Only returned by a dev backend with OTP_DEV_ECHO=true. */
  dev_code?: string
}

export class OtpError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly retryAfter?: number
  ) {
    super(message)
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-publishable-api-key": PUBLISHABLE_KEY },
      body: JSON.stringify(body),
    })
  } catch {
    throw new OtpError("We could not reach the server. Check your connection.", "NETWORK")
  }
  const json = (await res.json().catch(() => ({}))) as T & {
    error?: { code?: string; message?: string }
    retry_after?: number
  }
  if (!res.ok) {
    throw new OtpError(
      json.error?.message ?? "Something went wrong. Please try again.",
      json.error?.code ?? `HTTP_${res.status}`,
      json.retry_after
    )
  }
  return json
}

/** Client-side check mirroring the backend: email, or a 10-digit Indian mobile number. */
export function looksLikeIdentifier(value: string): boolean {
  const v = value.trim()
  if (v.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
  if (!/^[+\d\s\-().]+$/.test(v)) return false
  let digits = v.replace(/\D/g, "")
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2)
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1)
  return /^[6-9]\d{9}$/.test(digits)
}

export function requestOtpCode(identifier: string) {
  return post<OtpRequestResult>("/store/otp/request", { identifier: identifier.trim() })
}

export function verifyOtpCode(input: {
  identifier: string
  code: string
  first_name?: string
  last_name?: string
}) {
  return post<{ token: string; is_new: boolean }>("/store/otp/verify", {
    ...input,
    identifier: input.identifier.trim(),
  })
}
