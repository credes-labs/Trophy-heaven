import { BACKEND_URL, PUBLISHABLE_KEY } from "./medusa"

/**
 * Client helpers for the public contact/newsletter store endpoints, following
 * the same base-url + publishable-key convention as lib/blog.ts.
 */

async function postForm(path: string, payload: Record<string, string>): Promise<void> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: { message?: string }
    }
    throw new Error(body?.error?.message || `Request failed: ${res.status}`)
  }
}

export function subscribeNewsletter(email: string): Promise<void> {
  return postForm("/store/newsletter", { email })
}

export function sendContactMessage(input: {
  name: string
  email: string
  message: string
  /** Which form sent it (contact, corporate quote, return request). */
  topic?: "contact" | "quote" | "return"
}): Promise<void> {
  return postForm("/store/contact", input)
}
