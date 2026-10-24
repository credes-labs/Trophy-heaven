# 033 — Editorial contrast and type

- Date: 2026-10-25 · Branch: `main` · Status: shipped
- Layer-2 anchor: WP-36

## Context / why

The live storefront is the Figma editorial system: Outfit, ink `#131111`, paper `#FBFBF7` / raised `#F2F1EF`, uppercase kickers. A contrast audit found readable text set with Tailwind opacity modifiers that do not meet WCAG AA — including `#131111` at 4–8% (`/4`, `/5`, `/6`, `/7`), which is effectively invisible. Gold (`--color-gold`, ~2.4:1 on paper) was still used for focus rings and for a few leftover account cards.

## Decisions made (and alternatives rejected)

- **Keep the editorial system.** Do not swap Outfit for Playfair, and do not strip uppercase. Those are the Figma voice. Playfair and gold remain in the token file for older remnants and for decorative icons on dark surfaces.
- **One muted ink, not more opacity.** `#6B635C` is about 5.7:1 on paper and 5.9:1 on white. Opacity at 70% and above on full ink was left alone (about 6.9:1).
- **Ink focus, not gold.** A 2px `#131111` outline in `@layer base` covers buttons, links, inputs, and summaries. Components that set `outline-none` keep their own `focus-visible` ring. `editorialFieldClass` dropped `focus:outline-none`, which was clearing the ring via Tailwind's `--tw-outline-style`.
- **Account leftovers restyled in place.** Home, orders, order detail, coupons, designs, settings, and the corporate dashboard use paper, Outfit, ink pills, and underline actions. Fields, validation, and `AUTH_PATHS` are unchanged. Login, wishlist, addresses, about, FAQ, contact, and journal were already editorial and only received contrast and focus fixes.
- **Category accents stay** on trophies, furniture, and artwork heroes.
- **Backdrop watermarks stay faint.** `SectionWatermark` at 6% is `aria-hidden` decoration, not readable text. The film title "From Concept to Ceremony" sits on a dark gradient with solid `#F2F1EF`.

## Changes (file → what)

- `app/globals.css` — tokens `--color-ink`, `--color-ink-muted`, `--color-paper`, `--color-paper-raised`; `text-wrap` on headings and paragraphs; reduced-motion cancels smooth scroll; base focus outline.
- `app/loading.tsx` — loading label was ~1.1:1; now ink on raised paper.
- `components/ui/*` — gold rings replaced with `ring-ink`; badge success text was light green on a light wash and is now ink; tabs indicator no longer uses `transition-all`.
- Homepage sections, site chrome, shop, PDP, cart, checkout, journal, and content pages — low-opacity text → `#6B635C`, `text-balance` / `text-pretty` / `tabular-nums`, focus rings on fields that had suppressed outlines.
- Account and corporate dashboard pages listed above — editorial classes instead of gold shadcn cards.

## Gotchas for future work

- Do not use `text-[#131111]/40` (or lower) for anything someone must read. Use `text-ink-muted` or `#6B635C`.
- `focus:outline-none` together with `focus-visible:outline-2` can still hide the ring, because `outline-none` sets `--tw-outline-style: none` and `outline-2` reads that variable. Pair a visible ring with `focus-visible:outline-solid`, or omit `outline-none`.
- Gold text on cream still fails AA. `text-gold` is for dark surfaces and decorative icons. Small gold words on paper use `text-gold-dark`.
- The frosted "drag me" badge is decorative (`aria-hidden`) and can be low contrast on a light photo. It is a Figma sticker, not body copy.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck` — pass.
- `pnpm --filter @legacy-crafts/storefront lint` — pass, with the existing unused `focusIndex` warning in `dropdown-menu.tsx`.
- `pnpm --filter @legacy-crafts/storefront test` — 64 passed.
- Browser, narrow viewport: `/` hero and materials (descriptions readable; film title on the dark gradient); `/shop` hero and Luna Brass tile; `/products/luna-brass` add to cart; `/cart` shows the line, coupon field, and totals; `/account/login` placeholder `you@studio.in` is readable and accepts input; `/furniture` midnight hero, subcategory chips, and sort/price/material filters.
