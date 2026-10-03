import { cn } from "@/lib/utils"

/** Lowercase `//topic` kicker used on Figma homepage sections. */
export function SectionEyebrow({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  const label = children.startsWith("//") ? children : `//${children}`
  return (
    <p
      className={cn(
        "m-0 font-outfit text-[0.875em] leading-[1.25em] font-normal tracking-[-0.02em] text-current/70 lowercase",
        className
      )}
    >
      {label}
    </p>
  )
}

/** Uppercase pill eyebrow with leading dot (About / hero style). */
export function PillEyebrow({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <p
      className={cn(
        "m-0 inline-flex items-center gap-[0.75em] font-outfit text-[1em] leading-[1.25em] font-normal tracking-[-0.02em] text-current uppercase",
        className
      )}
    >
      <span className="size-[0.5em] shrink-0 rounded-full bg-current" aria-hidden />
      {children}
    </p>
  )
}
