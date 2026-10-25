import { cn } from "@/lib/utils"

export function CheckoutSubmit({
  children,
  className,
  type = "submit",
  disabled,
  onClick,
}: {
  children: string
  className?: string
  type?: "button" | "submit"
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn("checkout-continue", className)}
    >
      {children}
    </button>
  )
}

export function CheckoutBack({
  children,
  disabled,
  onClick,
}: {
  children: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button type="button" className="checkout-back" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
