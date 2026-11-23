/**
 * The visitor's IP for rate limiting. Render's edge is Cloudflare, which sets
 * `cf-connecting-ip`, while `req.ip` can be a shared proxy address there. The header is
 * only read on Render (which sets RENDER=true), because elsewhere a client could forge it.
 */
export function clientIp(
  req: { ip?: string; headers: Record<string, string | string[] | undefined> },
  env: Record<string, string | undefined> = process.env
): string {
  const edge = req.headers["cf-connecting-ip"]
  if (env.RENDER === "true" && typeof edge === "string" && edge) return edge
  return req.ip ?? "anon"
}

/** Dummy `Authorization` headers must not unlock the authenticated rate limit. */
export function isJwtBearer(authorization?: string | string[]): boolean {
  const header = Array.isArray(authorization) ? authorization[0] : authorization
  if (!header) return false
  const match = header.match(/^Bearer\s+(\S+)/i)
  if (!match) return false
  return match[1].split(".").length === 3
}
