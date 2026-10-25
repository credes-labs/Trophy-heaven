"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

/**
 * Registers the service worker (FR-PWA-2) and surfaces an install prompt
 * (FR-PWA-4). Registration is skipped in development to avoid caching churn.
 */
export function PWARegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return
    if (process.env.NODE_ENV !== "production") return
    navigator.serviceWorker.register("/sw.js").catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (!installEvent || dismissed) return null

  return (
    <div
      role="region"
      aria-label="Install the app"
      className="fixed inset-x-0 bottom-16 z-[60] border-y border-[#131111]/15 bg-[#F2F1EF] md:bottom-0"
    >
      <div className="mx-auto flex w-full max-w-[90em] items-center gap-4 px-[clamp(1.25rem,2.78vw,2.5rem)] py-3">
        <p className="m-0 min-w-0 flex-1 font-outfit text-sm leading-snug tracking-[-0.01em] text-[#131111] sm:text-base">
          Install Legacy Crafts for a faster, offline-ready experience.
        </p>
        <button
          type="button"
          onClick={async () => {
            await installEvent.prompt()
            await installEvent.userChoice
            setInstallEvent(null)
          }}
          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#131111] px-5 font-outfit text-sm tracking-wide text-[#F2F1EF] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
        >
          Install
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center font-outfit text-lg text-[#131111]/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
        >
          ×
        </button>
      </div>
    </div>
  )
}
