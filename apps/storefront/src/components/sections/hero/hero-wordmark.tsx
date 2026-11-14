import { BrandLockup } from "@/components/brand/emblem"
import { cn } from "@/lib/utils"

/** Header logo: the Trophy Heaven emblem + TROPHY / HEAVEN lockup (colour from `currentColor`). */
export function HeroWordmark({ className }: { className?: string }) {
  return (
    <BrandLockup
      className={cn(
        "relative z-10 h-11 shrink-0 text-[1.05rem] text-[#F2F1EF] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[#F2F1EF] lg:h-12 lg:text-[1.15rem]",
        className
      )}
    />
  )
}
