/** Dummy `Authorization` headers must not unlock the authenticated rate limit. */
export function isJwtBearer(authorization?: string | string[]): boolean {
  const header = Array.isArray(authorization) ? authorization[0] : authorization
  if (!header) return false
  const match = header.match(/^Bearer\s+(\S+)/i)
  if (!match) return false
  return match[1].split(".").length === 3
}
