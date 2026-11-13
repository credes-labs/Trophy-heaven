import { MedusaError } from "@medusajs/framework/utils"
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"

/**
 * RBAC roles per FR-AUTH-3 / docs/kit/03 §3.7. Missing role is deny, not admin.
 * Medusa dashboard users (`actor_type: "user"`) without an explicit TH role
 * are treated as admin so the stock admin JWT keeps working.
 */
export type StaffRole = "admin" | "designer" | "production_manager"

export const CAPABILITY_MATRIX: Record<string, StaffRole[]> = {
  "designs:approve": ["designer", "admin"],
  "production:view": ["designer", "production_manager", "admin"],
  "production:update": ["production_manager", "admin"],
  "products:manage": ["admin"],
  "corporate:manage": ["admin"],
  "users:manage": ["admin"],
  "content:manage": ["admin"],
  "reviews:moderate": ["admin", "designer"],
  "search:manage": ["admin"],
}

export type AuthContextLike = {
  actor_id?: string
  actor_type?: string
  app_metadata?: Record<string, unknown>
}

export function roleFromAuthContext(ctx?: AuthContextLike | null): StaffRole | null {
  if (!ctx?.actor_id) return null
  const raw = ctx.app_metadata?.role
  if (raw === "admin" || raw === "designer" || raw === "production_manager") return raw
  if (ctx.actor_type === "user") return "admin"
  return null
}

export function roleFromRequest(req: MedusaRequest): StaffRole | null {
  const user = (req as unknown as { auth_context?: AuthContextLike }).auth_context
  return roleFromAuthContext(user)
}

export function requireCapability(capability: keyof typeof CAPABILITY_MATRIX) {
  return (req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) => {
    const allowed = CAPABILITY_MATRIX[capability] ?? []
    const role = roleFromRequest(req)
    if (!role || !allowed.includes(role)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Role "${role ?? "none"}" lacks capability "${capability}".`
      )
    }
    next()
  }
}
