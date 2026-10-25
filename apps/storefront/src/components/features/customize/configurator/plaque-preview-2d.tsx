import { useId } from "react"
import {
  SAMPLE_LINES,
  engravingLines,
  getFont,
  getPlate,
  getWood,
  hasPlate,
  inkFor,
  monogram,
  type LineKey,
  type PlaqueConfig,
} from "@/lib/configurator/plaque"
import {
  emblem,
  faceDims,
  formOutline,
  insetOutline,
  outlinePath,
  plateOutline,
  plateRect,
  plateTextWidth,
} from "@/lib/configurator/shapes"

const BASELINE = 2.55
const ROWS: { key: LineKey; y: number; size: number; caps: boolean }[] = [
  { key: "title", y: 0.24, size: 0.05, caps: true },
  { key: "name", y: 0.5, size: 0.108, caps: false },
  { key: "detail", y: 0.8, size: 0.045, caps: false },
]

function starPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 ? r * 0.42 : r
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    return `${(cx + Math.cos(a) * radius).toFixed(3)},${(cy + Math.sin(a) * radius).toFixed(3)}`
  }).join(" ")
}

/**
 * Flat, server-renderable drawing of the current configuration. Shown while the
 * WebGL stage loads and as the permanent view when WebGL is unavailable.
 */
export function PlaquePreview2D({
  config,
  layoutImage = null,
  className,
}: {
  config: PlaqueConfig
  layoutImage?: string | null
  className?: string
}) {
  const uid = useId().replace(/:/g, "")
  const wood = getWood(config.wood)
  const plate = getPlate(config.plate)
  const font = getFont(config.font)
  const ink = inkFor(config)
  const lines = engravingLines(config)
  const { w, h } = faceDims(config.form)
  const rect = plateRect(config.form, w, h, config.pshape)
  const bare = !hasPlate(config)
  // The emblem roundel is always metal, so it keeps the plate's cut colour.
  const emblemInk = inkFor({ ...config, pshape: "rect" })
  const mark = emblem(config.form, w, h)
  const outline = formOutline(config.form, w, h)
  const face = outlinePath(outline, BASELINE)
  const plateCy = BASELINE - rect.cy
  const plateTop = plateCy - rect.height / 2
  const platePath = outlinePath(plateOutline(config.pshape, rect.width, rect.height), plateCy)
  const ratio = plateTextWidth(config.pshape)
  const maxText = rect.width * ratio
  const left = config.align === "left"
  const textX = left ? -maxText / 2 : 0
  const lift = config.mount === "wall" ? -0.18 : config.mount === "desk" ? 0 : -0.06
  const custom = config.face === "custom" ? layoutImage : null
  const borders = config.border === "none" ? [] : config.border === "double" ? [0.074, 0.097] : [0.079]
  const markY = BASELINE - mark.cy

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
        <clipPath id={`plate-${uid}`}>
          <path d={platePath} />
        </clipPath>
      </defs>

      <ellipse cx="0" cy={BASELINE + 0.24} rx="1.35" ry="0.16" fill={`url(#floor-${uid})`} />
      {config.mount === "desk" ? (
        <rect x={-(w + 0.34) / 2} y={BASELINE - 0.04} width={w + 0.34} height="0.22" rx="0.035" fill={`url(#wood-${uid})`} />
      ) : null}
      {config.mount === "box" ? (
        <>
          <rect x={-(w + 0.5) / 2} y={BASELINE - h * 0.86} width={w + 0.5} height={h * 0.86} rx="0.04" fill="#191d26" />
          <rect x={-(w + 0.38) / 2} y={BASELINE - h * 0.8} width={w + 0.38} height={h * 0.74} rx="0.02" fill="#e0d8c3" />
          <rect x={-(w + 0.5) / 2} y={BASELINE - 0.06} width={w + 0.5} height="0.26" rx="0.04" fill="#191d26" />
        </>
      ) : null}
      {config.mount === "easel" ? (
        <g stroke="#b8955a" strokeWidth="0.03" strokeLinecap="round">
          <line x1={-w * 0.32} y1={BASELINE + 0.2} x2={-w * 0.1} y2={BASELINE - h - 0.42} />
          <line x1={w * 0.32} y1={BASELINE + 0.2} x2={w * 0.1} y2={BASELINE - h - 0.42} />
          <line x1={-w * 0.45} y1={BASELINE - 0.02} x2={w * 0.45} y2={BASELINE - 0.02} strokeWidth="0.045" />
        </g>
      ) : null}

      <g transform={`translate(0 ${lift})`}>
        <path d={face} fill={`url(#wood-${uid})`} stroke={wood.grain[1]} strokeOpacity="0.4" strokeWidth="0.012" />
        {borders.map((margin) => (
          <path
            key={margin}
            d={outlinePath(insetOutline(outline, w, h, margin), BASELINE)}
            fill="none"
            stroke={plate.color}
            strokeWidth={margin > 0.09 ? 0.004 : 0.008}
          />
        ))}
        {config.emblem !== "none" ? (
          <g>
            <circle cx="0" cy={markY} r={mark.r} fill={`url(#metal-${uid})`} />
            {config.emblem === "star" ? <polygon points={starPoints(0, markY, mark.r * 0.62)} fill={emblemInk} /> : null}
            {config.emblem === "monogram" ? (
              <text
                x="0"
                y={markY}
                textAnchor="middle"
                dominantBaseline="central"
                fill={emblemInk}
                fontSize={mark.r * 0.8}
                style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
              >
                {monogram(config)}
              </text>
            ) : null}
            {config.emblem === "laurel" ? (
              <circle
                cx="0"
                cy={markY}
                r={mark.r * 0.62}
                fill="none"
                stroke={emblemInk}
                strokeWidth={mark.r * 0.14}
                strokeDasharray={`${mark.r * 0.2} ${mark.r * 0.08}`}
              />
            ) : null}
          </g>
        ) : null}
        {bare ? null : <path d={platePath} fill={`url(#metal-${uid})`} />}
        {custom ? (
          <image
            href={custom}
            x={-maxText / 2}
            y={plateTop + rect.height * 0.07}
            width={maxText}
            height={rect.height * 0.86}
            preserveAspectRatio="xMidYMid meet"
            clipPath={`url(#plate-${uid})`}
          />
        ) : (
          ROWS.map((row) => {
            const real = lines[row.key]
            const raw = real || SAMPLE_LINES[row.key]
            const text = row.caps || font.caps ? raw.toUpperCase() : raw
            const size = Math.min(row.size, maxText / Math.max(1, text.length * (row.caps ? 0.72 : 0.52)))
            return (
              <text
                key={row.key}
                x={textX}
                y={plateTop + rect.height * row.y}
                textAnchor={left ? "start" : "middle"}
                dominantBaseline="middle"
                fill={ink}
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
          })
        )}
      </g>
    </svg>
  )
}
