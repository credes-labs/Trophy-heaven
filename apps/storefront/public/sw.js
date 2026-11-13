/* Trophy Heaven service worker (FR-PWA-2). App-shell + static caching with a
 * network-first strategy for navigations so content stays fresh, falling back to
 * the cached shell offline. The cart lives in localStorage (see cart-store), so
 * it remains available offline without special handling here. */
const CACHE = "lc-shell-v1"
const SHELL = ["/", "/offline"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  // Network-first for navigations, cache fallback offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
          return res
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/offline")))
    )
    return
  }

  // Cache-first for same-origin static assets.
  if (new URL(request.url).origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
            return res
          })
      )
    )
  }
})

// Push notifications (FR-PWA-3), enabled behind the pwa_push flag.
self.addEventListener("push", (event) => {
  const data = (() => {
    try {
      return event.data ? event.data.json() : {}
    } catch {
      return {}
    }
  })()
  const title = data.title || "Trophy Heaven"
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icon-192.png",
      data: data.url ? { url: data.url } : {},
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data && event.notification.data.url
  if (url) event.waitUntil(self.clients.openWindow(url))
})
