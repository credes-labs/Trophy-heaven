import { useId } from "react"
import { getPlate, getWood, type PlaqueConfig } from "@/lib/configurator/plaque"
import { studioPiece, type AwardId } from "@/lib/configurator/studio-pieces"

/** Enlarged front proof of the exact plate applied to the 3D pedestal. */
export function AwardPlateArt({ award, config }: { award: AwardId; config: PlaqueConfig }) {
  const id = useId().replace(/:/g, "")
  const plate = getPlate(config.plate)
  const wood = getWood(config.wood)
  return (
    <svg
      data-award-plate-art
      aria-label={`${studioPiece(award).label}: base engraving detail`}
      role="img"
      viewBox="0 0 800 800"
      className="absolute inset-0 size-full"
    >
      <defs>
        <linearGradient id={`${id}-base`} x2="1" y2="0">
          <stop stopColor={award === "achievement" ? "#161916" : wood.grain[1]} />
          <stop offset=".45" stopColor={award === "achievement" ? "#3a3c36" : wood.grain[0]} />
          <stop offset="1" stopColor={award === "achievement" ? "#121412" : wood.grain[1]} />
        </linearGradient>
        <linearGradient id={`${id}-plate`} x2=".8" y2="1">
          <stop stopColor={plate.color} />
          <stop offset=".4" stopColor={plate.color} stopOpacity=".65" />
          <stop offset="1" stopColor={plate.color} />
        </linearGradient>
      </defs>
      <text data-proof-caption x="400" y="170" textAnchor="middle" fill="#6B635C" fontSize="18" letterSpacing="3">
        BASE ENGRAVING · FRONT
      </text>
      <path
        d="M60 240 80 220H720L740 240V560L720 580H80L60 560Z"
        fill={`url(#${id}-base)`}
        stroke="#331207"
        strokeWidth="2"
      />
      <path
        d="M60 240H740M80 220V580M720 220V580M60 560H740"
        fill="none"
        stroke="#FBFBF7"
        strokeOpacity=".16"
      />
      <rect
        x="100"
        y="280"
        width="600"
        height="240"
        rx="5"
        fill={`url(#${id}-plate)`}
        stroke={plate.color}
        strokeWidth="2"
      />
      <text data-proof-caption x="400" y="650" textAnchor="middle" fill="#6B635C" fontSize="17">
        {studioPiece(award).label}
      </text>
    </svg>
  )
}
