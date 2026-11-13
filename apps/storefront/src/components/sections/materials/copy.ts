export type MaterialKind = "walnut" | "brass" | "linen" | "teak" | "leather" | "jute"

export const MATERIALS: { kind: MaterialKind; name: string; body: string }[] = [
  {
    kind: "walnut",
    name: "Solid walnut",
    body: "Quarter-sawn for stability. Grain matched across a single piece, never veneered.",
  },
  {
    kind: "brass",
    name: "Cast brass",
    body: "Sand-cast and hand-buffed. It darkens with handling, which is the point.",
  },
  {
    kind: "linen",
    name: "Belgian linen",
    body: "Washed flax, tightly woven. It softens with sitting and is rated to 50,000 rubs.",
  },
  {
    kind: "teak",
    name: "Kiln-dried teak",
    body: "Dried to ten percent moisture, so a Bengaluru monsoon does not move it.",
  },
  {
    kind: "leather",
    name: "Full-grain leather",
    body: "Vegetable-tanned. It creases where you sit and nowhere else.",
  },
  {
    kind: "jute",
    name: "Hand-loomed jute",
    body: "Long-fibre jute, loomed by hand. Coarse at first, softer after the second monsoon.",
  },
]
