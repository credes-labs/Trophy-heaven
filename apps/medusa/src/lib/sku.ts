/**
 * Auto-generated SKU per FR-CAT-2: `TH-{category}-{shape}-{material}-{size}`.
 * Each segment is uppercased, alphanumeric-only, and truncated for readability.
 */
export function generateSku(parts: {
  category: string
  shape: string
  material: string
  size: string
}): string {
  const seg = (v: string, len = 6) =>
    (v || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, len) || "NA"

  return ["TH", seg(parts.category, 4), seg(parts.shape), seg(parts.material), seg(parts.size, 4)].join(
    "-"
  )
}

/** Customization level drives the storefront filter (FR-CAT-5). */
export type CustomizationLevel = "none" | "text_only" | "text_and_logo" | "full_3d"
