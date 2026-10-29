import Image from "next/image"
import Link from "next/link"
import { STUDIO_PIECES, type StudioPieceId } from "@/lib/configurator/studio-pieces"

export function StudioPiecePicker({ value }: { value: StudioPieceId }) {
  return (
    <nav aria-label="Trophy designs" className="mb-5 grid grid-cols-3 gap-2">
      {STUDIO_PIECES.map((piece) => (
        <Link
          key={piece.id}
          href={`/customize?piece=${piece.id}`}
          aria-current={piece.id === value ? "page" : undefined}
          className={`group min-w-0 rounded-sm border p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#331207] ${piece.id === value ? "border-[#331207] bg-[#E0D8C3]/20" : "border-[#331207]/15 hover:border-[#331207]/50"}`}
        >
          <div className="relative mb-2 h-14 overflow-hidden rounded-sm lg:h-20">
            <Image
              src={piece.image}
              alt={piece.label}
              fill
              sizes="120px"
              className="object-cover"
            />
          </div>
          <span className="block truncate text-center font-outfit text-[11px] text-[#331207]">
            {piece.shortLabel}
          </span>
        </Link>
      ))}
    </nav>
  )
}
