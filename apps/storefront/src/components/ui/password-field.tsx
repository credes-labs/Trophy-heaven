"use client"

import { useState, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

function EyeGlyph({ crossed }: { crossed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.125em"
      height="1.125em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {crossed ? <path d="M4 4l16 16" /> : null}
    </svg>
  )
}

export function PasswordRevealToggle({
  visible,
  onToggle,
  className,
}: {
  visible: boolean
  onToggle: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={visible ? "Hide password" : "Show password"}
      aria-pressed={visible}
      onClick={onToggle}
      className={cn(
        "flex cursor-pointer items-center justify-center border-0 bg-transparent p-0",
        className
      )}
    >
      <EyeGlyph crossed={visible} />
    </button>
  )
}

export function PasswordField({
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(className, "pr-10")}
      />
      <PasswordRevealToggle
        visible={visible}
        onToggle={() => setVisible((v) => !v)}
        className="absolute right-0 bottom-0 h-12 w-10 text-[#131111]/55 hover:text-[#131111]"
      />
    </div>
  )
}
