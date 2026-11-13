import type { Design2DState } from "@trophy-heaven/schemas"

export type Complexity = "simple" | "medium" | "complex"
export type ProductionJobStatus =
  | "pending_design_approval"
  | "design_approved"
  | "queued"
  | "in_production"
  | "quality_check"
  | "packed"
  | "completed"
  | "on_hold"
  | "cancelled"

/** Allowed forward/side transitions for a production job (API 05.3 §PUT status). */
export const STATUS_TRANSITIONS: Record<ProductionJobStatus, ProductionJobStatus[]> = {
  pending_design_approval: ["design_approved", "on_hold", "cancelled"],
  design_approved: ["queued", "on_hold", "cancelled"],
  queued: ["in_production", "on_hold", "cancelled"],
  in_production: ["quality_check", "on_hold", "cancelled"],
  quality_check: ["packed", "in_production", "on_hold", "cancelled"],
  packed: ["completed", "on_hold"],
  completed: [],
  // Resume from hold cannot jump into production (that skipped design approval).
  on_hold: ["pending_design_approval", "design_approved", "queued", "cancelled"],
  cancelled: [],
}

export function canTransition(from: ProductionJobStatus, to: ProductionJobStatus): boolean {
  if (from === to) return true
  return (STATUS_TRANSITIONS[from] ?? []).includes(to)
}

/** Infer job complexity from a design's state (object count, logos, mode). */
export function inferComplexity(mode: string, stateJson: unknown): Complexity {
  if (mode === "3d") return "complex"
  const state = stateJson as Partial<Design2DState>
  const objects = Array.isArray(state?.objects) ? state.objects : []
  const hasLogo = objects.some((o) => o?.type === "image")
  const textCount = objects.filter((o) => o?.type === "text").length
  if (hasLogo || textCount > 2) return "medium"
  if (textCount <= 1) return "simple"
  return "medium"
}

/**
 * Route a job to a workshop based on complexity + material (docs/kit/03 §3.3).
 * Crystal/acrylic go to the specialty workshop; metals to the metal shop; the
 * complex bucket routes to the master workshop regardless of material.
 */
export function routeWorkshop(complexity: Complexity, material: string): string {
  if (complexity === "complex") return "workshop-master"
  const m = material.toLowerCase()
  if (m.includes("crystal") || m.includes("acrylic") || m.includes("glass")) {
    return "workshop-specialty"
  }
  if (m.includes("gold") || m.includes("silver") || m.includes("bronze") || m.includes("metal")) {
    return "workshop-metal"
  }
  return "workshop-general"
}

/** SLA estimate in days by complexity (used to set estimated_completion). */
export function slaDays(complexity: Complexity): number {
  return complexity === "complex" ? 10 : complexity === "medium" ? 6 : 3
}
