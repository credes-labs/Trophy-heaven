import { formatMoney } from "@/lib/format"
import { ADVANCE_PERCENT, splitAdvance } from "@/lib/payment-plan"
import { cn } from "@/lib/utils"

/**
 * "Pay now / pay on delivery" table for the 10% advance + COD plan. Shown in the
 * payment step, the review step and the order summary so the split is never a surprise.
 */
export function PaymentBreakdown({
  total,
  currency,
  className,
  compact = false,
}: {
  total: number
  currency: string
  className?: string
  compact?: boolean
}) {
  const { advance, balance } = splitAdvance(total, currency)
  return (
    <dl className={cn("checkout-breakdown", compact && "is-compact", className)}>
      <div className="checkout-breakdown-row is-now">
        <dt>
          Pay now online
          <span>{ADVANCE_PERCENT}% advance</span>
        </dt>
        <dd>{formatMoney(advance, currency)}</dd>
      </div>
      <div className="checkout-breakdown-row">
        <dt>
          Pay on delivery
          <span>{100 - ADVANCE_PERCENT}% cash on delivery</span>
        </dt>
        <dd>{formatMoney(balance, currency)}</dd>
      </div>
      <div className="checkout-breakdown-row is-total">
        <dt>Order total</dt>
        <dd>{formatMoney(total, currency)}</dd>
      </div>
    </dl>
  )
}
