import { MedusaError } from "@medusajs/framework/utils"
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"

/**
 * RBAC roles per FR-AUTH-3 / docs/kit/03 §3.7. Beyond Medusa's built-in admin
 * user, Legacy Crafts distinguishes staff roles via a `role` field stored in the
 * user's metadata. Permissions are re-checked per request (no trust in stale
 * tokens after a role change).
 */
export type StaffRole = "admin" | "designer" | "production_manager"

export const CAPABILITY_MATRIX: Record<string, StaffRole[]> = {
  "designs:approve": ["designer", "admin"],
  "production:view": ["designer", "production_manager", "admin"],
  "production:update": ["production_manager", "admin"],
  "products:manage": ["admin"],
  "corporate:manage": ["admin"],
  "users:manage": ["admin"],
}

export function roleFromRequest(req: MedusaRequest): StaffRole {
  const user = (req as unknown as { auth_context?: { app_metadata?: Record<string, unknown> } })
    .auth_context
  const role = (user?.app_metadata?.role as StaffRole) || "admin"
  return role
}

/**
 * Express-style guard: `requireCapability("production:update")`. Attach to admin
 * routes that need a capability beyond generic authentication.
 */
export function requireCapability(capability: keyof typeof CAPABILITY_MATRIX) {
  return (req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) => {
    const allowed = CAPABILITY_MATRIX[capability] ?? []
    const role = roleFromRequest(req)
    if (!allowed.includes(role)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Role "${role}" lacks capability "${capability}".`
      )
    }
    next()
  }
}
