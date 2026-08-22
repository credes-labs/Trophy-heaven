import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border bg-transparent px-3 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border focus-visible:ring-primary",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-success focus-visible:ring-success",
      },
      inputSize: {
        sm: "h-9 text-xs",
        md: "h-11",
        lg: "h-13 text-base",
      },
    },
    defaultVariants: { variant: "default", inputSize: "md" },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  ref?: React.Ref<HTMLInputElement>
  label?: string
  error?: string
}

export function Input({
  className,
  variant,
  inputSize,
  label,
  error,
  id,
  ref,
  ...props
}: InputProps) {
  const inputId = id || React.useId()
  const resolvedVariant = error ? "error" : variant

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium leading-none">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        data-variant={resolvedVariant}
        aria-invalid={resolvedVariant === "error" || undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(inputVariants({ variant: resolvedVariant, inputSize, className }))}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export { inputVariants }
