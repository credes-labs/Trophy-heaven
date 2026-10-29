/** Photo references and handles are shared by routing, saving, and the studio. */
export const STUDIO_PIECES = [
  {
    id: "achievement",
    label: "Achievement Statuette",
    shortLabel: "Achievement",
    handle: "achievement-statuette",
    image: "/images/catalog/trophy-achievement-statuette.jpg",
    cutout: "/images/footer/orbit-statuette.png",
    detail: "Gilded figure · marble plinth",
  },
  {
    id: "ascent",
    label: "Ascent Figure Award",
    shortLabel: "Ascent",
    handle: "ascent-figure-award",
    image: "/images/catalog/trophy-figure-award.jpg",
    cutout: "/images/footer/orbit-figure-award.png",
    detail: "Open-ring figure · walnut base",
  },
  {
    id: "plaque",
    label: "Engraved Wooden Plaque",
    shortLabel: "Plaque",
    handle: "engraved-wooden-plaque",
    image: "/images/catalog/plaque-studio.png",
    cutout: "/images/catalog/plaque-studio.png",
    detail: "Walnut · engraved brass",
  },
] as const

export type StudioPieceId = (typeof STUDIO_PIECES)[number]["id"]
export type AwardId = Exclude<StudioPieceId, "plaque">
export const AWARD_SAFE_AREA = { x: 120, y: 300, width: 560, height: 200 }

export function studioPiece(id: string | undefined) {
  return STUDIO_PIECES.find((p) => p.id === id) ?? STUDIO_PIECES[0]
}

export function studioPieceForHandle(handle: string | null | undefined) {
  return STUDIO_PIECES.find((p) => p.handle === handle)
}

/** Old plaque links continue to resolve; the empty studio starts with the new award. */
export function initialStudioPiece(params: Record<string, unknown>): StudioPieceId {
  if (typeof params.piece === "string") return studioPiece(params.piece).id
  return Object.keys(params).some((key) => key !== "mode") ? "plaque" : "achievement"
}
