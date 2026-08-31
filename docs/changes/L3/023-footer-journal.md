# L3-023: Footer destinations + journal editorial

- Date: 2026-08-29 · Status: shipped
- Layer-2 anchor: WP-25

## Context

Footer and collection flyout pointed several labels at the wrong shop URL (`sort=created_at` is not a shop sort key; Gift Cards / Best Sellers had no pages). Company links all dumped on `/about` with no hash. The journal still used gold pills, serif cards, and the walnut newsletter block.

## Changes

- Footer Shop: Collection, New Arrivals (`/shop?sort=newest`), Trophies, Furniture, Artwork.
- Footer Company: About, Our Story (`/about#story`), Sustainability (`/about#sustainability`), Journal, Corporate.
- Footer Support: Contact, FAQs, Shipping & Returns, Privacy, Terms.
- Header collection flyout: drop fake gift/best-seller rows; Careers → `/contact`; add Terms under Contact.
- About: `#story` on the hero; new materials section `#sustainability`.
- Homepage `#products` gets `scroll-mt` so `/#products` clears the header.
- Journal index/article/cards/share/subscribe restyled to shop editorial (Outfit, watermark, underline filters, hairline prose). Footer nav columns `z-10` so the wordmark cannot steal clicks. Wordmark is `inline-block` (not a full-width home hit target). Polaroid scatter is `pointer-events-none`. Posts without a CMS cover use workshop JPEGs (`journalCoverSrc`).

## Verification

- Playwright: footer Terms → `/terms`, New Arrivals → `sort=newest`, Sustainability hash on about; journal index + a post screenshot.
- `pnpm --filter @legacy-crafts/storefront typecheck` and unit tests.
