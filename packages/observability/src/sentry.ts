/**
 * Sentry initialization contract (see docs/kit/03 §3.8). The concrete SDK
 * (`@sentry/nextjs` / `@sentry/node`) is wired per-app; this helper standardizes
 * config resolution and no-ops cleanly when SENTRY_DSN is absent (local/dev).
 */
export type SentryConfig = {
  dsn: string
  environment: string
  tracesSampleRate: number
  enabled: boolean
}

export function resolveSentryConfig(): SentryConfig {
  const dsn = process.env.SENTRY_DSN ?? ""
  return {
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    enabled: dsn.length > 0 && process.env.NODE_ENV === "production",
  }
}
