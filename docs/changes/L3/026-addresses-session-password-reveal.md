# 026 — Addresses session + password reveal

- Date: 2026-08-31 · Branch: current · Status: shipped
- Layer-2 anchor: WP-28

## Context / why

Visiting `/account/addresses` logged the customer out. Password fields had no show/hide control.

## Decisions made (and alternatives rejected)

- Addresses was calling `loadCustomer()` after `listAddress`. That sets `loading: true`, AccountShell treated loading as “not ready” and unmounted the page, then remounted and called `loadCustomer` again. A 429/network failure in that loop set `customer: null` and redirected to login. Fix: do not refresh the customer from the addresses list, do not unmount the shell while a customer is already in memory, and only clear the session on 401/403.
- Password reveal uses an inline SVG (not Lucide) so login/register stay editorial.

## Changes (file → what)

- `lib/auth-session.ts` — keep vs clear session after a failed retrieve
- `stores/auth-store.ts` — silent refresh when already logged in
- `account-shell.tsx` — skeleton only when there is no customer
- `account/addresses/page.tsx` — list addresses without `loadCustomer`
- `password-field.tsx` + `input.tsx` `reveal` — show/hide on login, register, reset, checkout gate, settings

## Gotchas for future work

- Never call `loadCustomer()` from a page that is a child of AccountShell in a mount effect — the shell already loads the customer. Setting `loading: true` used to unmount those children.
- `getByLabel(/^Password$/i)` still targets the input; the toggle is `Show password` / `Hide password`.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront test`
- `pnpm --filter @legacy-crafts/storefront typecheck`
- Browser: logged-in `/account/addresses` stays signed in; login password eye toggles visibility
