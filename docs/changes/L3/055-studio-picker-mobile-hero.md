# 055 - Studio choices and mobile trophy hero

- Date: 2026-10-29
- Layer-2 anchor: WP-81

## Context / why
The studio design choices used tiny cropped photos. The mobile hero's left crop showed a chair, while the user wanted trophies visible.

## Changes
- Studio picker: full-height rotating award models in three neutral cards using the existing shared CategoryCanvas. Labels, selected check, keyboard links, reduced motion, WebGL failure cutouts and visibility-based lifecycle remain available.
- Hero background: existing Ascent trophy photograph for mobile/tablet, with a fade into the lower copy surface. Desktop keeps the original table photograph. The old table image contains no trophies, so changing its crop alone cannot show an award.

## Verification
Pending checks.

## Loading behavior follow-up (WP-82)
The user subsequently requested 3D-only startup, so shared category displays, studio cards and the award editor no longer render photo fallbacks. Reserved slots use aria-busy during initialization and a short status on WebGL failure. This supersedes the fallback description above. Mobile/desktop hero sources use a single picture with Next getImageProps so only the selected art direction downloads.
