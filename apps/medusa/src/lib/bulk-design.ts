import type { Design2DState } from "@legacy-crafts/schemas"
import crypto from "node:crypto"

/**
 * Builds a minimal, schema-valid Design2DState for a bulk-order recipient row.
 * The recipient name is centred in the engraving safe area; designation/award
 * category are stacked below. Corporate buyers can refine individual designs
 * later in the 2D editor.
 */
export function buildBulkLineDesignState(line: {
  name: string
  designation?: string | null
  award_category?: string | null
}): Design2DState {
  const safe = { x: 120, y: 300, width: 560, height: 220 }
  const centerX = safe.x + safe.width / 2

  const objects: Design2DState["objects"] = [
    {
      type: "text",
      id: crypto.randomUUID(),
      text: line.name,
      fontFamily: "Cinzel",
      fontSize: 44,
      fill: "#1a1a1a",
      fontWeight: "bold",
      fontStyle: "normal",
      underline: false,
      textAlign: "center",
      charSpacing: 0,
      lineHeight: 1.16,
      left: centerX,
      top: safe.y + 40,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      locked: false,
      visible: true,
    },
  ]

  const subtitle = [line.designation, line.award_category].filter(Boolean).join(" · ")
  if (subtitle) {
    objects.push({
      type: "text",
      id: crypto.randomUUID(),
      text: subtitle,
      fontFamily: "Inter",
      fontSize: 26,
      fill: "#4a4a4a",
      fontWeight: "normal",
      fontStyle: "normal",
      underline: false,
      textAlign: "center",
      charSpacing: 0,
      lineHeight: 1.16,
      left: centerX,
      top: safe.y + 130,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      locked: false,
      visible: true,
    })
  }

  return {
    version: 1,
    canvas: { width: 800, height: 800, background: "#ffffff" },
    baseImageUrl: null,
    materialOverlay: "gold",
    engravingSafeArea: safe,
    objects,
  }
}
