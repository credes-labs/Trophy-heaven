import type { MetadataRoute } from "next"

/** PWA manifest (FR-PWA-1) — installable storefront with offline support. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Legacy Crafts",
    short_name: "Legacy Crafts",
    description: "Custom trophies, awards, furniture, and home decor with 2D/3D customization.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfbf7",
    theme_color: "#b8860b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
