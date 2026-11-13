import Link from "next/link"
import { cn } from "@/lib/utils"

const lightOnDark =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-full bg-white px-6 py-3 font-outfit text-[16px] leading-5 font-normal tracking-wide text-[#131111] uppercase transition-opacity hover:opacity-90 sm:h-[52px] sm:pr-[26px] sm:pl-6"

const darkOnCream =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-full bg-[#131111] px-6 py-3 font-outfit text-[16px] leading-5 font-normal tracking-wide text-[#F2F1EF] uppercase transition-opacity hover:opacity-90 sm:h-[52px]"

/** Homepage pill CTA — 44px min tap target on mobile. */
export function PillCta({
  href,
  children,
  variant = "light",
  className,
}: {
  href: string
  children: string
  variant?: "light" | "dark"
  className?: string
}) {
  const isLight = variant === "light"
  return (
    <Link href={href} className={cn(isLight ? lightOnDark : darkOnCream, "w-full sm:w-auto", className)}>
      <span
        className={cn("size-2 shrink-0 rounded-full", isLight ? "bg-[#131111]" : "bg-white")}
        aria-hidden
      />
      {children}
    </Link>
  )
}

export function TextCta({
  href,
  children,
  className,
}: {
  href: string
  children: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-outfit text-[1.125em] leading-[1.25em] font-normal tracking-[-0.02em] text-current underline underline-offset-[0.15em] transition-opacity hover:opacity-70",
        className
      )}
    >
      {children}
    </Link>
  )
}
