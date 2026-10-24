import Link from "next/link"
import { cn } from "@/lib/utils"

/** Wordmark, sized as a quiet mark so the poster headline can own the frame. */
export function HeroWordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Legacy home"
      className={cn(
        "relative z-10 block h-11 w-[6.75rem] shrink-0 overflow-clip focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[#F2F1EF] lg:h-12 lg:w-[7.5rem]",
        className
      )}
    >
      <img
        src="/images/brand/legacy-wordmark.svg"
        alt=""
        aria-hidden
        width={168}
        height={69}
        className="size-full object-contain"
      />
    </Link>
  )
}
