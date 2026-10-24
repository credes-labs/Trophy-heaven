import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "border border-border bg-muted text-muted-foreground",
        outline: "border border-border bg-transparent text-foreground",
        gold: "bg-gold/15 text-walnut",
        trophy: "bg-trophy text-trophy-foreground",
        furniture: "bg-furniture text-white",
        artwork: "bg-artwork text-white",
        sale: "bg-destructive text-destructive-foreground",
        success: "bg-success/15 text-ink",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { badgeVariants }
