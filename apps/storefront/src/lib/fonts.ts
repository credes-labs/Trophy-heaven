/** Curated Google Fonts for engraving (FR-2D-2). Loaded on demand via WebFont. */
export const ENGRAVING_FONTS = [
  "Inter",
  "Playfair Display",
  "Merriweather",
  "Montserrat",
  "Cinzel",
  "Great Vibes",
  "Oswald",
  "Cormorant Garamond",
  "Bebas Neue",
  "Dancing Script",
] as const

export type EngravingFont = (typeof ENGRAVING_FONTS)[number]

/** Loads a Google Font at runtime, resolving once glyphs are ready for canvas. */
export async function loadGoogleFont(family: string): Promise<void> {
  if (typeof document === "undefined") return
  const id = `gf-${family.replace(/\s+/g, "-")}`
  if (!document.getElementById(id)) {
    const link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`
    document.head.appendChild(link)
  }
  try {
    await document.fonts.load(`16px "${family}"`)
    await document.fonts.ready
  } catch {
    // Font load best-effort; canvas falls back to a system font.
  }
}
