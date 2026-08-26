"use client"

import { useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, Link2 } from "lucide-react"

export function ShareButtons({
  title,
  slug,
  path,
  className,
}: {
  title: string
  slug: string
  /** Absolute site path to share (defaults to the blog post URL). */
  path?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  // Deterministic URL (server === client) — reading window.location during
  // render causes a hydration mismatch.
  const base = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "")
  const href = `${base}${path ?? `/blog/${slug}`}`
  const encodedUrl = encodeURIComponent(href)
  const encodedTitle = encodeURIComponent(title)

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
    <div className={cn("flex flex-wrap items-center gap-2 font-outfit", className)}>
      <span className="text-[0.75em] font-normal tracking-[0.08em] text-[rgba(19,17,17,0.5)] uppercase">
        Share
      </span>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        X / Twitter
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        WhatsApp
      </a>
      <Button variant="outline" size="sm" onClick={copyLink} type="button">
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  )
}
