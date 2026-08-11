/**
 * Returns/RMA policy (FR-RET-1): custom/personalized items (those referencing a
 * `design_id`) are non-returnable; standard items are returnable within 7 days of
 * delivery. Returns a per-line eligibility breakdown.
 */
const STANDARD_RETURN_WINDOW_DAYS = 7

export type ReturnLineInput = {
  line_item_id: string
  title: string
  is_custom: boolean
}

export type ReturnEligibility = {
  line_item_id: string
  title: string
  eligible: boolean
  reason: string
}

export function evaluateReturnEligibility(
  lines: ReturnLineInput[],
  deliveredAt: Date | null,
  now: Date = new Date()
): { window_open: boolean; days_remaining: number; lines: ReturnEligibility[] } {
  let daysSinceDelivery = Infinity
  if (deliveredAt) {
    daysSinceDelivery = Math.floor((now.getTime() - deliveredAt.getTime()) / (24 * 60 * 60 * 1000))
  }
  const windowOpen = daysSinceDelivery <= STANDARD_RETURN_WINDOW_DAYS
  const daysRemaining = Math.max(0, STANDARD_RETURN_WINDOW_DAYS - daysSinceDelivery)

  const evaluated = lines.map<ReturnEligibility>((l) => {
    if (l.is_custom) {
      return {
        line_item_id: l.line_item_id,
        title: l.title,
        eligible: false,
        reason: "Personalized items are non-returnable.",
      }
    }
    if (!deliveredAt) {
      return {
        line_item_id: l.line_item_id,
        title: l.title,
        eligible: false,
        reason: "Item has not been delivered yet.",
      }
    }
    if (!windowOpen) {
      return {
        line_item_id: l.line_item_id,
        title: l.title,
        eligible: false,
        reason: `Return window (${STANDARD_RETURN_WINDOW_DAYS} days) has closed.`,
      }
    }
    return {
      line_item_id: l.line_item_id,
      title: l.title,
      eligible: true,
      reason: `Eligible — ${daysRemaining} day(s) remaining.`,
    }
  })

  return { window_open: windowOpen, days_remaining: daysRemaining, lines: evaluated }
}

export { STANDARD_RETURN_WINDOW_DAYS }
