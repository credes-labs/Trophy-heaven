"use client"

/**
 * Analytics funnel events (docs/kit/11-success-metrics.md). Dispatches to GA4
 * (gtag) and Mixpanel when their keys are configured; no-ops otherwise. Event
 * names follow the GA4 ecommerce vocabulary plus custom design-funnel events.
 */
type AnalyticsPayload = Record<string, unknown>

type Gtag = (command: string, event: string, params?: AnalyticsPayload) => void
type Mixpanel = { track: (event: string, props?: AnalyticsPayload) => void }

declare global {
  interface Window {
    gtag?: Gtag
    dataLayer?: unknown[]
    mixpanel?: Mixpanel
  }
}

export const FUNNEL_EVENTS = [
  "view_item",
  "select_item",
  "add_to_cart",
  "begin_checkout",
  "purchase",
  "search",
  "design_started",
  "design_saved",
  "design_added_to_cart",
] as const

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number]

export function track(event: FunnelEvent | string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return
  try {
    window.gtag?.("event", event, payload)
    window.mixpanel?.track(event, payload)
    // Always push to the dataLayer so GTM-style consumers can pick it up.
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push({ event, ...payload })
  } catch {
    // analytics must never break the app
  }
}
