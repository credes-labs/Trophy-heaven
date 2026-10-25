import type { FaceLayout } from "./plaque"

/**
 * Hand-off between the 2D layout editor and the 3D studio. The layout is too
 * large for the URL, so it lives in sessionStorage for the tab's session; the
 * URL only records `face=custom`.
 */
const KEY = "lc_plaque_layout:v1"

type Stored = FaceLayout & { productId: string }

export function readLayout(productId: string): FaceLayout | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as Partial<Stored>
    if (stored.productId !== productId || typeof stored.image !== "string" || !stored.image.startsWith("data:image/png")) {
      return null
    }
    return { image: stored.image, fabric: stored.fabric ?? null, area: stored.area }
  } catch {
    return null
  }
}

export function writeLayout(productId: string, layout: FaceLayout): boolean {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...layout, productId } satisfies Stored))
    return true
  } catch {
    // Quota exceeded or storage disabled.
    return false
  }
}

export function clearLayout() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Storage disabled.
  }
}
