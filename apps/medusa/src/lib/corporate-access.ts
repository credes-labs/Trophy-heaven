import { isSameNonNullId } from "./design-ownership"

export function isActiveCorporateMember(
  members: Array<{ customer_id: string | null; status?: string }>,
  customerId: string | null
): boolean {
  if (!customerId) return false
  return members.some(
    (m) => isSameNonNullId(m.customer_id, customerId) && (m.status ?? "active") === "active"
  )
}

export function isCorporateOwner(
  profile: { customer_id: string | null },
  customerId: string | null
): boolean {
  return isSameNonNullId(profile.customer_id, customerId)
}

export function canAccessCorporateProfile(
  profile: { customer_id: string | null },
  members: Array<{ customer_id: string | null; status?: string }>,
  customerId: string | null
): boolean {
  return isCorporateOwner(profile, customerId) || isActiveCorporateMember(members, customerId)
}

export function corporateActorIds(
  profile: { customer_id: string | null },
  members: Array<{ customer_id: string | null }>
): string[] {
  const ids = [profile.customer_id, ...members.map((m) => m.customer_id)]
  return [...new Set(ids.filter((id): id is string => Boolean(id)))]
}

export function orderMatchesCorporateProfile(
  order: { metadata?: Record<string, unknown> | null },
  profileId: string
): boolean {
  return String(order.metadata?.corporate_profile_id ?? "") === profileId
}
