import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Trophy Heaven — Custom Trophies & Awards"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#131111",
          color: "#F2F1EF",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", opacity: 0.7 }}>
          Trophy Heaven
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, lineHeight: 1.1, maxWidth: 900 }}>
            Crafted with intention. Built to last.
          </div>
          <div style={{ fontSize: 28, opacity: 0.7 }}>
            Trophies · Awards · Plaques — Bengaluru
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
