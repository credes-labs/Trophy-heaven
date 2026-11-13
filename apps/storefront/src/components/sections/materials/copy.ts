export type MaterialKind = "crystal" | "brass" | "walnut" | "marble" | "acrylic" | "gilt"

export const MATERIALS: { kind: MaterialKind; name: string; body: string }[] = [
  {
    kind: "crystal",
    name: "Optical crystal",
    body: "Lead-free K9, cut and polished by hand. Engraving sits inside the light, not on top of it.",
  },
  {
    kind: "brass",
    name: "Cast brass",
    body: "Sand-cast and hand-buffed. It darkens with handling, which is the point.",
  },
  {
    kind: "walnut",
    name: "Solid walnut",
    body: "Quarter-sawn plinths, oiled by hand. Heavy enough that the award never tips.",
  },
  {
    kind: "marble",
    name: "Honed marble",
    body: "Cut from the slab for statuette bases. No two veins run the same way.",
  },
  {
    kind: "acrylic",
    name: "Cast acrylic",
    body: "Ten-millimetre cast sheet, laser-cut and flame-polished for clear, bright edges.",
  },
  {
    kind: "gilt",
    name: "Gold leaf",
    body: "Hand-laid on cast figures and stars, then sealed so it survives the ceremony and the decade after.",
  },
]
