"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { PasswordRevealToggle } from "@/components/ui/password-field"

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
  /** Show a toggle to reveal a password field. */
  reveal?: boolean
}

export function Input({
  className,
  variant,
  inputSize,
  label,
  error,
  id,
  ref,
  reveal,
  type,
  ...props
}: InputProps) {
  const inputId = id || React.useId()
  const resolvedVariant = error ? "error" : variant
  const [visible, setVisible] = React.useState(false)
  const resolvedType = reveal ? (visible ? "text" : "password") : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium leading-none">
          {label}
        </label>
      )}
      <div className={reveal ? "relative" : undefined}>
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          data-variant={resolvedVariant}
          aria-invalid={resolvedVariant === "error" || undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            inputVariants({ variant: resolvedVariant, inputSize, className }),
            reveal && "pr-10"
          )}
          {...props}
        />
        {reveal ? (
          <PasswordRevealToggle
            visible={visible}
            onToggle={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 w-10 text-muted-foreground hover:text-foreground"
          />
        ) : null}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export { inputVariants }
