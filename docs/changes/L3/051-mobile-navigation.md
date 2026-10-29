# 051 - Mobile header and menu

- Date: 2026-10-29
- Layer-2 anchor: WP-74

## Context / why
The mobile menu was nested inside the isolated hero, allowing page copy to appear above it; its long link list also overflowed. The user asked for the mobile photograph crop to move left, removal of the bottom tabs, and transparent sticky top navigation.

## Changes
- Root layout removes the bottom tab bar.
- Hero uses a left-aligned photograph crop below the desktop breakpoint and drops the bottom tab clearance.
- Site chrome owns a transparent fixed mobile homepage header that switches to ink over the light sections. Inner-page headers stay sticky and transparent.
- Mobile menu uses a native top-layer dialog, collapsible link groups, its own scroll container, focus containment, Escape dismissal and focus restoration.

## Verification
Results follow after checks.

## Verification results
- Root lint passed with 7 existing warnings; root typecheck passed.
- Root tests: schemas 18/18 then documented Windows TEST_TYPE failure. Direct storefront 103/103 and Medusa 44/44 using the documented PowerShell environment workaround.
- Chromium at 390x844 and 360x640: native modal visible above the hero, independently scrolling link groups, no bottom bar, left hero crop (`object-position: 0% 50%`). Screenshots visually inspected.
- Header remains at viewport y=0 with fully transparent background after scrolling and switches from white to ink outside the hero.
- Native dialog focus containment verified through 32 Tab presses; Escape restores focus to the trigger and restores the original body overflow. Cart opens correctly from the menu.
- Resizing to 1440x1000 dismisses the modal and preserves desktop navigation. /about retains its transparent sticky header, and menu Search closes the modal and navigates to /search.
- Source diff whitespace checks passed. No homepage browser page errors.
