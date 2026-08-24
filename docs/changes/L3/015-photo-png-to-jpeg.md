# 015 — Photo PNGs recoded to high-quality JPEG

- Date: 2026-08-24 · Branch: current · Status: shipped
- Layer-2 anchor: WP-16

## Context / why

WP-15 lossless oxipng left photographic PNGs at ~0.8–2.4 MB. The user asked to
actually optimize them. Those 18 files had no alpha; PNG is the wrong container.

## Decisions made (and alternatives rejected)

- **JPEG q=90, 4:4:4 (`subsampling=0`), progressive.** Pillow encode, then
  jpegoptim Huffman. Three files with PSNR < 40 dB (blog-design, blog-materials,
  art-wall-textile) re-encoded at **q=95**. Min PSNR vs the lossless PNG:
  **41.8 dB**.
- **Keep** `hero-legacy-chair.png`, `hero-legacy-sideboard.png` (real alpha),
  and PWA `icon-192/512.png`.
- **Rejected** pngquant / q=75 WebP — visible quality loss vs the q=90/95 4:4:4
  JPEGs.

## Changes (file → what)

| File | What |
|------|------|
| 18 RGB photos under `apps/storefront/public/images/{hero,categories,products,blog}/` | PNG deleted; `.jpg` added |
| `apps/storefront/src/{app/layout,lib/category-config,components/layout/mega-menu,components/sections/craftsmanship-story}.tsx` | `.png` → `.jpg` |
| `apps/storefront/public/images/manifest.json` | keys updated |
| `apps/medusa/src/scripts/seed.ts`, `seed-content.ts` | product/blog URLs → `.jpg` |

## Gotchas for future work

- Catalog rows already in Postgres still point at `.png` until a re-seed.
- Do not convert the two hero PNGs that use transparency.

## Verification (commands + evidence)

```text
18 photo PNGs: 25.60 MB → 4.41 MB JPEG (PSNR ≥ 41.8 dB)
public raster+svg: 29.54 MB → 8.89 MB
remaining PNGs: icon-192, icon-512, hero-legacy-chair, hero-legacy-sideboard
```
