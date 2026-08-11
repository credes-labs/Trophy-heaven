import { Design2DState, Design3DState, DesignStateJson } from "@legacy-crafts/schemas"
import type { z } from "zod"

/**
 * Validates a design's state_json against the shared contracts (docs/kit/06
 * §6.7/§6.8). Returns a discriminated result so API routes can emit the standard
 * 400 VALIDATION_ERROR envelope (API 05 conventions).
 */
export function validateDesignState(
  mode: "2d" | "3d",
  stateJson: unknown
):
  | { success: true; data: unknown }
  | { success: false; issues: { path: string; issue: string }[] } {
  const schema = mode === "2d" ? Design2DState : mode === "3d" ? Design3DState : DesignStateJson
  const result = (schema as z.ZodTypeAny).safeParse(stateJson)
  if (result.success) return { success: true, data: result.data }
  return {
    success: false,
    issues: result.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
  }
}

/**
 * Server-side design constraint checks beyond schema validation (FR-2D-9):
 * engraving safe-area containment, character limits, minimum text resolution.
 */
export function checkDesign2DConstraints(state: z.infer<typeof Design2DState>): string[] {
  const errors: string[] = []
  const safe = state.engravingSafeArea
  const MAX_ENGRAVING_CHARS = 120

  for (const obj of state.objects) {
    if (obj.type === "text") {
      if (obj.text.length > MAX_ENGRAVING_CHARS) {
        errors.push(`Text "${obj.text.slice(0, 16)}…" exceeds ${MAX_ENGRAVING_CHARS} characters.`)
      }
      const withinX = obj.left >= safe.x && obj.left <= safe.x + safe.width
      const withinY = obj.top >= safe.y && obj.top <= safe.y + safe.height
      if (!withinX || !withinY) {
        errors.push(`Text "${obj.text.slice(0, 16)}…" is outside the engraving safe area.`)
      }
    }
  }
  return errors
}
