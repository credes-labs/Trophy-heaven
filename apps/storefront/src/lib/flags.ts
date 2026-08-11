/**
 * Lightweight feature flags + A/B assignment (docs/kit/11). Flags are read from
 * NEXT_PUBLIC_FLAGS (comma-separated) at build/runtime; A/B buckets are a stable
 * hash of a visitor id so a user always sees the same variant.
 */
export type FlagName = "visual_search" | "three_d_ar" | "new_checkout" | "pwa_push"

const DEFAULTS: Record<FlagName, boolean> = {
  visual_search: false,
  three_d_ar: true,
  new_checkout: false,
  pwa_push: false,
}

function enabledFlags(): Set<string> {
  const raw = process.env.NEXT_PUBLIC_FLAGS ?? ""
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  )
}

export function isEnabled(flag: FlagName): boolean {
  const set = enabledFlags()
  if (set.has(`!${flag}`)) return false
  if (set.has(flag)) return true
  return DEFAULTS[flag]
}

/** Deterministic A/B bucket in [0, buckets) from a visitor id + experiment key. */
export function bucket(visitorId: string, experiment: string, buckets = 2): number {
  const input = `${visitorId}:${experiment}`
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash) % buckets
}

export function variant(visitorId: string, experiment: string, variants: string[]): string {
  return variants[bucket(visitorId, experiment, variants.length)]
}
