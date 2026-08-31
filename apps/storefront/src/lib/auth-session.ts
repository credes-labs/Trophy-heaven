/** How `loadCustomer` should treat a failed `customer.retrieve()`. */

export function httpStatusFromError(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined
  const o = err as Record<string, unknown>
  if (typeof o.status === "number") return o.status
  if (typeof o.statusCode === "number") return o.statusCode
  return undefined
}

/**
 * A refresh that 429s or drops the network must not wipe a logged-in customer.
 * Only 401/403 (or no customer yet) should clear the session.
 */
export function shouldClearSessionOnRetrieveFailure(
  hasExistingCustomer: boolean,
  status?: number
): boolean {
  if (status === 401 || status === 403) return true
  return !hasExistingCustomer
}
