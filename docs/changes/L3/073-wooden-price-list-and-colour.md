# 073 — Wooden price list and a warmer palette

- Date: 2026-11-25 · Branch: client-preview (main to follow) · Status: committed locally; GitHub was down, so not yet pushed
- Layer-2 anchors: WP-118, WP-119

## Context / why

The owner sent `WOODEN ITEM LIST.xlsx` with sizes, dimensions and prices for his wooden range. He asked for it in the CMS, and said the site "looks a lot plain".

## Decisions made (and alternatives rejected)

- **Sheet 1 is the selling price.** Every sheet 1 price is exactly 2.5× the sheet 2 price, so sheet 2 is read as cost. Cost is not stored anywhere: product metadata is public through the store API.
- **One variant per size.** The option is called `Size` and its label carries the sheet's dimensions (`A · 34 × 40 cm`, `B · 29 cm`). Variant `width`/`height` hold the numbers (cm, per the sheet 2 header), so the owner can edit them in the admin. Rejected putting dimensions only in metadata: the admin has no form for that.
- **Made to order.** `manage_inventory: false`, so no stock levels are needed and nothing shows as out of stock.
- **Applied as a one-off catalogue update** (`catalog-updates.ts`, recorded in `store.metadata.catalog_updates`), not by bumping `SEED_VERSION`. Bumping would re-run the whole seed and recreate anything the owner has deleted.
- **The three wooden pieces already in the shop** (4228, 4264, 4275) are resized only while they still have their single seeded `-STD` variant. Medusa 2.18 cannot replace options in `updateProducts`, and option titles are shared unless exclusive. So the update links an exclusive `Size` option, creates the sized variants with the existing `Finish` value, then deletes the placeholder.
- **Photos.** They are in-cell images (`xl/richData`), mapped by row through `metadata.xml`. Background removal treated white and ivory panels as background, so the mask is repaired with "not white" pixels plus a hole fill from the border. Five sources were PNGs named `.jpeg` and keep their own alpha. Tiles are 600×750 because the sources are only 260–560 px.
- **Colour.** It comes only from brand tokens, a few strong moments rather than everywhere: a maroon announcement bar, a maroon sign-up band, an ivory materials band, tinted homepage tiles, and maroon primary buttons. Product photos keep their baked grey tiles; recolouring them would mean regenerating every photo and would fight the owner's uploads.

## Changes (file → what)

- `apps/medusa/src/scripts/catalog-updates.ts` (+ spec), `scripts/data/wooden-price-list.ts`, `scripts/bootstrap.ts`
- `apps/storefront/public/images/collection/wooden/*.webp` (63), `manifest.json`
- `apps/storefront/src/app/globals.css` — new tokens
- `_editorial/{section-shell,eyebrow,pill-cta}.tsx`, `signup/index.tsx`, `materials/index.tsx`, `editions/{categories,selected-editions,constants}.tsx`, `about/about-stats.tsx`, `layout/announcement-bar.tsx`, `layout/footer/cta-button.tsx`, `catalog/product-actions.tsx`, `products/[handle]/pdp.css`, `shop/editorial-product-card.tsx`
- `AGENTS.md` — brand contract records the palette rules

## Gotchas for future work

- Sheet oddities to confirm with the owner:
  - 808 sizes read "6 × 7" … "15 × 18" cm, which may be inches.
  - JH200 size B is 20 cm, between 27 and 33.
  - JH196, JH211, JH212, JH220 and JH249–JH253 have no dimensions.
  - 4314 has no price and is not in the shop.
- `WOODEN ITEM LIST.xlsx` sits in `apps/storefront/public/brand/`. It must not be committed there: anything in `public/` is served, and sheet 2 holds cost prices.
- New catalogue changes for an existing database go in `CATALOG_UPDATES` with a new id. Make each update skip products the owner has edited.

## Verification (commands + evidence)

- Local bootstrap on the existing catalogue:
  - The first run hit the shared-option error; fixed with `is_exclusive`.
  - The rerun created no duplicates, resized all three existing pieces (3/4/3 variants), and recorded the update.
  - Totals: 89 products and 89 index documents.
- The import job moved every wooden photo into file storage. No `/images/collection/wooden/` URLs remain in the database.
- The product page for 808 shows 8 sizes with dimensions; the price follows the size.
- The Wooden category page lists the items with "from" prices.
- Desktop and phone screenshots of home, shop and the Wooden category show no sideways scroll.
- Jest (wooden labels, SKUs, sheet-1 prices) and Vitest (paise formatting) pass.
