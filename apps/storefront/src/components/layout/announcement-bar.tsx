"use client"

import { useEffect, useState, useCallback } from "react"
import { X } from "lucide-react"

const MESSAGES = [
  "Free shipping on orders above ₹5,000",
  "Handcrafted with love in India",
  "Custom trophies in 7 days",
]

const STORAGE_KEY = "lc_announcement_dismissed"
const ROTATE_INTERVAL = 4000

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(STORAGE_KEY) === "1"
    setDismissed(wasDismissed)
  }, [])

  useEffect(() => {
    if (dismissed) return
    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % MESSAGES.length)
        setIsTransitioning(false)
      }, 300)
    }, ROTATE_INTERVAL)
    return () => clearInterval(timer)
  }, [dismissed])

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, "1")
    setDismissed(true)
  }, [])

  if (dismissed) return null

  return (
    <div className="relative z-50 flex h-9 items-center justify-center bg-trophy px-4">
      <p
        className={`text-xs font-medium uppercase tracking-widest text-trophy-foreground transition-opacity duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {MESSAGES[activeIndex]}
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-trophy-foreground/70 transition-colors hover:text-trophy-foreground"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  )
}
