import type { RefObject } from "react"
import { MATERIALS, type MaterialKind } from "./copy"

/** Reserved slot above each name. The shared canvas draws into these rects. */
export const MATERIAL_SLOT_CLASS = "h-48 min-h-48 w-full"

export function MaterialsList({
  slots,
  onHoverKind,
}: {
  slots: RefObject<HTMLDivElement | null>[]
  onHoverKind: (kind: MaterialKind | null) => void
}) {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-x-[1em] gap-y-[1.75em] p-0 lg:grid-cols-3 lg:gap-[2em]">
      {MATERIALS.map((item, index) => (
        <li
          key={item.kind}
          onPointerEnter={() => onHoverKind(item.kind)}
          onPointerLeave={() => onHoverKind(null)}
        >
          <div ref={slots[index]} className={MATERIAL_SLOT_CLASS} aria-hidden="true" />
          <h3 className="m-0 font-outfit text-[1.125em] font-normal tracking-[-0.02em] text-balance text-[#131111]">
            {item.name}
          </h3>
          <p className="mt-[0.5em] m-0 font-outfit text-[0.9375em] leading-[1.45] text-pretty text-[#6B635C]">
            {item.body}
          </p>
        </li>
      ))}
    </ul>
  )
}
