# 056 - WebP imagery and image performance

- Date: 2026-10-30
- Layer-2 anchor: WP-85

## Context / why
The user asked to convert all images to WebP with a library for faster loads, clean up duplicates and work on performance. public/images was 91 MB; seventeen sculpture photographs were 3158x3948 JPEGs of 3-4 MB each.

## Changes (file → what)
- `apps/storefront/scripts/images-to-webp.mjs` + `images:webp` script, `sharp` dev dependency → dry run by default, `--write` converts and deletes originals. Skips `campaign/` (finished ad units, not mounted, per L3/049) and `brand/` (SVG).
- Deleted, unused anywhere (code, seeds, every image column in the DB): `catalog/plaque-walnut-blank`, `categories/cat-artwork`, `categories/cat-furniture`, `footer/orbit-pierced-disc`, `hero/hero-legacy-studio` (.jpg and .png copies), `hero/hero-living`, `products/art-ceramic-vase`.
- Deleted duplicates: `explore/{sierra-fabric,oslo-leather,aria-minimal,nova-oak,vertex-glass}` matched `catalog/{seating-armchair,seating-lounge,storage-shelf,tables-coffee,tables-side}` (dHash distance 2-5, visually identical; catalog copies are higher resolution). Only retired sample products used them.
- `src/lib/images.ts` → remaps `/images/{products,catalog,explore,blog,about,footer,hero}/*.jpg|png` to `.webp`, then applies the duplicate alias map. `images.test.ts` covers it.
- `next.config.ts` → 308 redirects for the same legacy paths and duplicates; `Cache-Control: public, max-age=86400, stale-while-revalidate=2592000` on `/images/*`; `images.minimumCacheTTL` 30 days. WebP stays the optimizer format (Next 16 docs recommend it; AVIF encodes ~50% slower on cold requests).
- `apps/medusa/src/scripts/images-to-webp.ts` → idempotent URL rewrite across image, product, product_variant, inventory_item, cart/order line items and blog_post.
- `layout.tsx` OG image → `og/og-default.jpg` (JPEG; some link-preview crawlers reject WebP).
- Order pages: line-item thumbnails go through `localizeImageUrl`, `loading="lazy"`.
- `priority` → `preload` (deprecated in Next 16) on about, blog post, corporate, shop hero, PDP gallery, blog card.
- Category grid: first four product cards `loading="eager"`.

## Gotchas for future work
- Add imagery as JPEG/PNG, run `images:webp --write`, reference `.webp`, register in manifest.json.
- Existing databases need `npx medusa exec ./src/scripts/images-to-webp.ts` then a search reindex, or rely on the render-time remap.
- The local DB still holds the retired sample furniture products (seed soft-deletes them on re-run); their remaining explore images were kept.
- Finding, not changed: on GPU-less headless Chrome the category 3D hero's scene setup (~1 s native WebGL task) delays the product grid fade-in, so /furniture LCP is ~2.3 s versus ~1.0 s with the 3D chunk blocked; /artwork and /trophies LCP is the heading at ~0.3-0.4 s. Deferring canvas start to requestIdleCallback after load did not help (the browser is idle almost immediately) and was reverted. A fixed ~1 s delay would fix the metric but shows the empty hero longer; left for a product decision.

## Verification (commands + evidence)
- Quality: 600px 100% crop of sculpture-disc-pierced-1 original vs WebP inspected side by side, no visible difference.
- Optimizer cold encode (sharp, best of 3): sculpture 265 → 73 ms, hero tables 223 → 160 ms, plaque 110 → 52 ms; delivered bytes 10-20% smaller.
- Every DB image URL resolves to an existing file; reindex returned 27 products.
- Redirects: `.jpg`/`.png` → `.webp` 308, explore duplicate → catalog 308, campaign and og JPEGs 200; `/images` Cache-Control header present.
- Production (`next start`, 1440px, scrolled): /, /artwork, /furniture, /trophies, /blog, /about, PDP, /customize all with zero 4xx or broken images. Homepage LCP ~0.2 s.
- `pnpm lint` (7 existing warnings, 0 errors), `pnpm typecheck`, storefront 113 + schemas 18 + Medusa 44 tests (Windows TEST_TYPE workaround), root `pnpm build` passed.
