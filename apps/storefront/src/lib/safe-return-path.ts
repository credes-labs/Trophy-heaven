/**
 * Allow only same-origin relative paths after login/register.
 * Blocks protocol-relative and absolute URLs so `?next=` cannot open-redirect.
 */
export function safeReturnPath(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null
  if (trimmed.includes("://") || trimmed.includes("\\")) return null
  const pathOnly = trimmed.split("?")[0]?.split("#")[0] ?? ""
  if (pathOnly === "/account/login" || pathOnly.startsWith("/account/login/")) return null
  if (pathOnly === "/account/register" || pathOnly.startsWith("/account/register/")) return null
  return trimmed
}
