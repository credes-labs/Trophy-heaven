import type { MedusaRequest } from "@medusajs/framework/http"

/**
 * Reads the authenticated actor id from a store request. Store routes accept
 * both authenticated customers and guest sessions, so `auth_context` is optional
 * on the base request type — this centralizes the access + null handling.
 */
export function getActorId(req: MedusaRequest): string | null {
  return (
    (req as unknown as { auth_context?: { actor_id?: string } }).auth_context?.actor_id ?? null
  )
}
