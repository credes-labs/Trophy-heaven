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
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
      <span className="text-sm">Install Legacy Crafts for a faster, offline-ready experience.</span>
      <button
        onClick={async () => {
          await installEvent.prompt()
          await installEvent.userChoice
          setInstallEvent(null)
        }}
        className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
      >
        Install
      </button>
      <button onClick={() => setDismissed(true)} className="text-sm text-muted-foreground" aria-label="Dismiss">
        ✕
      </button>
    </div>
  )
}
