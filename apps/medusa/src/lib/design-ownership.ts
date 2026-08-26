/**
 * Ownership checks that treat `null === null` as NOT a match. Guest designs
 * prove ownership with an owner_token issued at create time; authenticated
 * designs match customer_id to the JWT actor.
 */
export function isSameNonNullId(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  return Boolean(a && b && a === b)
}

export function isDesignOwner(input: {
  customerId: string | null | undefined
  actorId: string | null | undefined
  ownerToken?: string | null
  presentedOwnerToken?: string | null
}): boolean {
  if (isSameNonNullId(input.customerId, input.actorId)) return true
  if (input.customerId) return false
  return Boolean(
    input.ownerToken &&
      input.presentedOwnerToken &&
      input.ownerToken === input.presentedOwnerToken
  )
}

export function canCloneDesign(input: {
  fromPreset: boolean
  isTemplate: boolean
  customerId: string | null | undefined
  actorId: string | null | undefined
  ownerToken?: string | null
  presentedOwnerToken?: string | null
}): boolean {
  if (input.fromPreset || input.isTemplate) return true
  return isDesignOwner(input)
}

export function ownerTokenFromRequest(req: {
  headers?: Record<string, unknown>
  query?: Record<string, unknown>
}): string | null {
  const header = req.headers?.["x-design-owner-token"]
  if (typeof header === "string" && header) return header
  const query = req.query?.owner_token
  if (typeof query === "string" && query) return query
  return null
}
