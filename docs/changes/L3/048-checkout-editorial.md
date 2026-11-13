# 048 — Checkout editorial layout

- Date: 2026-10-26 · Branch: ashish/frontend-revamp · Status: shipped
- Layer-2 anchor: WP-69

## Context / why

`/checkout` mixed a viewport-wide address grid with the landing pill and a white summary card. City and state were a nested `1fr` pair inside a page grid, so their min-content width escaped the form column and, once scrolled, sat in the transparent header. Underline fields were `h-12` boxes, so the rule sat far from its label. Continue reused the landing button, including its decorative dot.

## Decisions made (and alternatives rejected)

- The column split lives in `checkout.css` with `minmax(0, 1fr)`, the same reason the cart grid is not a Tailwind arbitrary template.
- The address form is a column, max 40rem. City and state share a nested `minmax(0, 1fr)` pair only from 640px. They are not page-grid items.
- A paper veil sticks over the header band so scrolled labels do not show through the wordmark. It does not add a second content offset; `#main` padding and `.under-site-header` are unchanged.
- Continue is a compact ink pill with no dot. The footer and landing pills keep theirs.
- Field errors are burgundy text under the control. The Razorpay verify-then-complete path is unchanged.
- Phone stays optional. A filled phone is not format-gated, so a saved number is not newly rejected.

## Changes (file → what)

- `components/features/checkout/checkout.css` — page grid, veil, steps, fields, summary, button.
- `address-form.tsx`, `checkout-address-step.tsx`, `delivery-options.tsx`, `payment-step.tsx`, `review-step.tsx`, `checkout-auth-gate.tsx`, `step-indicator.tsx`, `checkout-summary.tsx`, `checkout-actions.tsx` — editorial markup. Same fields and step handlers.
- `app/(shop)/checkout/page.tsx` — paper shell, Playfair title, contained layout. Payment handlers untouched.
- `lib/checkout-address.ts` — `validateDeliveryAddress` for the messages under the fields.

## Gotchas for future work

- Do not put the address fields back on `lg:grid-cols-[1fr_…]` without `minmax(0, …)`. Inputs will escape the column again.
- Ancestors of the sticky summary stay `overflow: clip`, not `hidden`.
- `AddressForm` is shared with the account address dialog, so this CSS styles that dialog too.
- The header is still a zero-height overlay. Do not add a second `padding-top` on the page root.

## Verification (commands + evidence)

- Storefront `tsc --noEmit` clean. eslint on the checkout files and `checkout-address` clean. vitest `checkout-address` + `data/checkout` 12/12.
- Browser on `:3000/checkout` at 1440×900: signed-out cart of two plaques. Title top 236px, Playfair 72px, logo bottom 100px. Layout columns `926px 352px`. Email field ends at 680px; summary starts at 1038px; no overlap. Summary background `rgb(251, 251, 247)`, shadow none. Sign in is 108px wide, no dot, no `::before`. `scrollWidth` 1430 equals `clientWidth`.
- At 390×844: one column (`350px`), summary top below the email field, price inside the panel, `scrollWidth` 390. Title top 175px, visible logo bottom 92px. After a 280px scroll the email label still clears the logo.
- The address step itself was not on screen: this browser session is signed out, so checkout shows the sign-in gate. No cart was created.
