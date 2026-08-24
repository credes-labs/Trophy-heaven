# 014 — Lossless storefront image optimization

- Date: 2026-08-24 · Branch: current · Status: shipped
- Layer-2 anchor: WP-15

## Context / why

Shipped PNGs under `apps/storefront/public` were 1–2.8 MB each (photos saved as
PNG). Need smaller files without changing pixels.

## Decisions made (and alternatives rejected)

- **oxipng 10.2** for PNG. Independent 2025 comparison (op111.net) found oxipng
  faster and smaller than optipng, within ~0.05–0.3 pp of FileOptimizer’s
  multi-tool “best”. ImageOptim and Squoosh ship it. Flags: `-o 4 --strip safe
  -i 0`. **No `--alpha`** — oxipng’s own README calls that a lossy rewrite of
  fully transparent pixels.
- **jpegoptim 1.5.6 (mozjpeg build, no `-m`)** for JPEG. Huffman + progressive
  only; decoded pixels unchanged. `--strip-all` was safe here: none of the 24
  JPEGs had EXIF orientation or an ICC profile.
- **Rejected pngquant.** Official site and Simon Willison’s write-up both treat
  it as lossy palette reduction (“images are visually different”).
- **Rejected pingo.** Encode.su / css-ig describe it as experimental
  lossless *or* lossy; default path is not a hard lossless guarantee.
- **Rejected ECT as the runner.** Well regarded on HN/encode.su, but Windows
  install is a cmake/nasm build. oxipng + jpegoptim cover the same lossless
  PNG/JPEG job with official binaries.
- **Rejected format conversion** (lossy WebP/AVIF, PNG→JPEG). Would change
  pixels or every `src` path.

## Changes (file → what)

| File | What |
|------|------|
| `apps/storefront/public/**/*.png` | oxipng in place (22 files) |
| `apps/storefront/public/**/*.jpg` | jpegoptim lossless in place (24 files) |
| `scripts/optimize-images.ps1` | Repeatable lossless pass (downloads the two CLIs) |

## Gotchas for future work

- Photographic PNGs stay large even after a lossless pass. Converting them to
  JPEG/WebP would shrink more **and** lose the “no quality drop” constraint.
- Do not add `--alpha`, pngquant, or jpegoptim `-mNN`.
- If a future JPEG has an ICC profile or orientation tag, drop `--strip-all`
  and strip only comments/XMP.

## Verification (commands + evidence)

```text
oxipng 10.2.0  →  30.7 MiB → 25.8 MiB  (−16.04%, 22 PNGs)
jpegoptim 1.5.6 lossless  →  24 JPEGs, 0.8–6.6% each
Pillow RGBA compare vs pre-opt copies: 46/46 pixel buffers identical
combined: 34.59 MB → 29.54 MB  (−5.05 MB, −14.6%)
```
