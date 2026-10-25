# 037 — Letter form and trust row

- Date: 2026-10-25 · Branch: `ashish/frontend-revamp` · Status: shipped
- Layer-2 anchor: WP-41

## Context / why

The homepage closed with two separate blocks: a four-column trust strip with top and bottom rules, then a centred newsletter. The brief was one section, the form on the left, the trust lines on the right, evenly spaced and bold.

## Decisions made (and alternatives rejected)

- **Fold the lines into the signup section.** One `SectionShell`, one heading (`signup-heading`). A second section would keep the double padding and the rule.
- **Copy stays centred inside the left column.** The reference places `//stay close`, the headline, and the body on the centre of the form, with the input and button as a row under them. The column itself sits on the left of the row.
- **The list stretches to the form.** `justify-between` on a column that matches the form height spaces the four lines evenly. A fixed gap would leave them bunched at the top of a tall form.
- **Semibold, ink, no rules.** `font-semibold` and `#131111`. The old muted weight and the `border-y` belonged to the strip.

## Changes (file → what)

- `components/sections/signup/index.tsx` — two-column row; `TRUST_POINTS` as a labelled list.
- `app/page.tsx` — signup only; trust strip import removed.
- `components/sections/trust-strip/index.tsx` — deleted.

## Gotchas for future work

- Copy still comes from `TRUST_POINTS` in `lib/brand-facts.ts`. Do not hard-code the four lines in the section.
- Below `lg` the form is first and the lines follow. Putting the lines back above the form splits the block again.
- `#stay-close` is the section id. Anything that linked to a trust-strip id was only the homepage order.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck`.
- Browser, ~1920: form column left, four semibold lines on the right with even gaps, no rules. The old `trust-heading` is gone.
- Browser, 390px: form, then the four lines, document width 390 (no sideways scroll). Emulation cleared afterwards.
