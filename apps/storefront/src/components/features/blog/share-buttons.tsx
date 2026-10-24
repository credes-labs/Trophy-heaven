"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function ShareButtons({
  title,
  slug,
  path,
  className,
}: {
  title: string
  slug: string
  path?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const base = (typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "")
  const href = `${base}${path ?? `/blog/${slug}`}`
  const encodedUrl = encodeURIComponent(href)
  const encodedTitle = encodeURIComponent(title)
  const linkClass =
    "cursor-pointer border-0 bg-transparent p-0 font-outfit text-[1em] leading-[1.25em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em] transition-opacity hover:opacity-70"

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-[1.5em] gap-y-[0.75em]", className)}>
      <p className="m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C] uppercase">
        Share
      </p>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={linkClass}
      >
        X
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className={linkClass}
      >
        WhatsApp
      </a>
      <button type="button" onClick={() => void copyLink()} aria-label="Copy link" className={linkClass}>
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  )
}
