import Link from "next/link"
import { cn } from "@/lib/utils"

const pillClass =
  "inline-flex h-[3.875em] w-[19.5em] max-w-full shrink-0 items-center justify-center gap-[1.25em] rounded-full bg-[#131111] py-[0.625em] pr-[0.625em] pl-[0.5em] font-outfit text-[1em] leading-[1.25em] font-light tracking-[-0.02em] text-[#F2F1EF] uppercase transition-opacity hover:opacity-90 disabled:opacity-50"

export function EditorialCtaLink({
  href,
  children,
  className,
}: {
  href: string
  children: string
  className?: string
}) {
  return (
    <Link href={href} className={cn(pillClass, className)}>
      <span className="size-[0.5em] shrink-0 rounded-full bg-white" aria-hidden />
      {children}
    </Link>
  )
}

export function EditorialCtaButton({
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
      className={cn(pillClass, "cursor-pointer border-0", className)}
    >
      <span className="size-[0.5em] shrink-0 rounded-full bg-white" aria-hidden />
      {children}
    </button>
  )
}

export function EditorialTextLink({
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
        "font-outfit text-[1.25em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em] transition-opacity hover:opacity-70",
        className
      )}
    >
      {children}
    </Link>
  )
}

export const editorialFieldClass =
  "mt-[0.5em] h-12 w-full rounded-none border-0 border-b border-[#131111]/20 bg-transparent px-0 font-outfit text-[1em] leading-[1.4] font-normal tracking-[-0.02em] text-[#131111] placeholder:text-[#6B635C] focus:border-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[#131111]"

export const editorialLabelClass =
  "block font-outfit text-[0.875em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase"
