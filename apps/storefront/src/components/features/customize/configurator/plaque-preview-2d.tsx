import { useId } from "react"
import {
  SAMPLE_LINES,
  engravingLines,
  getFont,
  getPlate,
  getWood,
  type LineKey,
  type PlaqueConfig,
} from "@/lib/configurator/plaque"
import { PLAQUE_W, emblem, formOutline, outlinePath, plateRect } from "@/lib/configurator/shapes"

const BASELINE = 2.55
const ROWS: { key: LineKey; y: number; size: number; caps: boolean }[] = [
  { key: "title", y: 0.24, size: 0.05, caps: true },
  { key: "name", y: 0.5, size: 0.108, caps: false },
  { key: "detail", y: 0.8, size: 0.045, caps: false },
]

/**
 * Flat, server-renderable drawing of the current configuration. Shown while the
 * WebGL stage loads and as the permanent view when WebGL is unavailable.
 */
export function PlaquePreview2D({ config, className }: { config: PlaqueConfig; className?: string }) {
  const uid = useId().replace(/:/g, "")
  const wood = getWood(config.wood)
  const plate = getPlate(config.plate)
  const font = getFont(config.font)
  const lines = engravingLines(config)
  const rect = plateRect()
  const mark = emblem(config.form)
  const face = outlinePath(formOutline(config.form), BASELINE)
  const plateTop = BASELINE - rect.cy - rect.height / 2
  const desk = config.mount === "desk"
  const lift = desk ? 0 : -0.18
  const maxText = rect.width * 0.86

  return (
    <svg viewBox="-1.5 0.2 3 2.9" className={className} role="img" aria-label="Flat preview of your plaque">
      <defs>
        <linearGradient id={`wood-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={wood.grain[2]} />
          <stop offset="0.45" stopColor={wood.grain[0]} />
          <stop offset="1" stopColor={wood.grain[1]} />
        </linearGradient>
        <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={plate.color} stopOpacity="0.85" />
          <stop offset="0.5" stopColor={plate.color} />
          <stop offset="1" stopColor={plate.ink} stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={`floor-${uid}`}>
          <stop offset="0" stopColor="#2b1d10" stopOpacity="0.22" />
          <stop offset="1" stopColor="#2b1d10" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="0" cy={BASELINE + 0.24} rx="1.35" ry="0.16" fill={`url(#floor-${uid})`} />
      {desk ? (
        <rect
          x={-(PLAQUE_W + 0.34) / 2}
          y={BASELINE - 0.04}
          width={PLAQUE_W + 0.34}
          height="0.22"
          rx="0.035"
          fill={`url(#wood-${uid})`}
        />
      ) : null}

      <g transform={`translate(0 ${lift})`}>
        <path d={face} fill={`url(#wood-${uid})`} stroke={wood.grain[1]} strokeOpacity="0.4" strokeWidth="0.012" />
        <circle cx="0" cy={BASELINE - mark.cy} r={mark.r} fill={`url(#metal-${uid})`} />
        <circle cx="0" cy={BASELINE - mark.cy} r={mark.r * 0.74} fill="none" stroke={plate.ink} strokeWidth="0.012" />
        <rect
          x={-rect.width / 2}
          y={plateTop}
          width={rect.width}
          height={rect.height}
          rx="0.012"
          fill={`url(#metal-${uid})`}
        />
        {ROWS.map((row) => {
          const real = lines[row.key]
          const raw = real || SAMPLE_LINES[row.key]
          const text = row.caps || font.caps ? raw.toUpperCase() : raw
          const size = Math.min(row.size, maxText / Math.max(1, text.length * (row.caps ? 0.72 : 0.52)))
          return (
            <text
              key={row.key}
              x="0"
              y={plateTop + rect.height * row.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={plate.ink}
              fillOpacity={real ? 1 : 0.28}
              fontSize={size}
              letterSpacing={row.caps ? size * 0.18 : 0}
              style={{
                fontFamily: `var(${font.cssVar})`,
                fontStyle: font.style,
                fontWeight: row.key === "name" ? font.weight : 400,
              }}
            >
              {text}
            </text>
          )
        })}
      </g>
    </svg>
  )
}
