import Link from "next/link"
import { BRAND } from "@/lib/brand-facts"
import { cn } from "@/lib/utils"

/** Wordmark, sized as a quiet mark so the poster headline can own the frame. */
export function HeroWordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${BRAND.name} home`}
      className={cn(
        "relative z-10 flex h-11 shrink-0 flex-col justify-center font-serif leading-[0.95] font-semibold tracking-tight text-[#F2F1EF] no-underline focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[#F2F1EF] lg:h-12",
        className
      )}
    >
      <span aria-hidden className="text-[1.15rem] lg:text-[1.3rem]">Trophy</span>
      <span aria-hidden className="text-[1.15rem] lg:text-[1.3rem]">Heaven</span>
    </Link>
  )
}
