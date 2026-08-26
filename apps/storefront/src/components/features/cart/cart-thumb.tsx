"use client"

import Image from "next/image"
import { localizeImageUrl } from "@/lib/images"
import { cn } from "@/lib/utils"

export function CartThumb({
  src,
  alt,
  className,
}: {
  src?: string | null
  alt: string
  className?: string
}) {
  const url = src ? localizeImageUrl(src) : null

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[0.125em] bg-[#D9D9D9]",
        className
      )}
    >
      {url ? (
        <Image src={url} alt={alt} fill sizes="96px" className="object-cover" />
      ) : null}
    </div>
  )
}
