# 027 — Addresses editorial add/edit

- Date: 2026-08-31 · Branch: current · Status: shipped
- Layer-2 anchor: WP-29

## Context / why

Edit (and add) on `/account/addresses` opened a white rounded Dialog with gold Save and bordered inputs, while the account shell and checkout address form are cream / Outfit / underline / PIN-first.

## Decisions made (and alternatives rejected)

- Reuse `AddressForm` (PIN → city/state → house/area → name → Home/Work) instead of a second field set. Email is hidden on the account dialog because Medusa customer addresses do not store it.
- PIN lookup is skipped once on edit when city and state are already present, so opening Edit does not overwrite the saved place.
- The list behind the dialog is restyled the same way so Edit is not a gold card on a gold page.

## Changes (file → what)

- `checkout/address-form.tsx` — `idPrefix`, `showEmail`, `submitLabel`, `onCancel`, `children`
- `account/addresses/page.tsx` — editorial list + cream dialog
- `ui/dialog.tsx` — close control uses walnut focus ring

## Gotchas for future work

- Apartment/area is required (same as checkout). Older addresses with a blank `address_2` must be filled on save.
- Do not put Lucide or gold `Button` back on this route.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront test`
- `pnpm --filter @legacy-crafts/storefront typecheck`
- Browser: Edit and Add on `/account/addresses`
