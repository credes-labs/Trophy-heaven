# 035 — Footer wordmark and column padding

- Date: 2026-10-25 · Branch: `ashish/frontend-revamp` · Status: shipped
- Layer-2 anchor: WP-38

## Context / why

The wordmark row was a fixed `16.1875em` frame with the three link columns taken out of flow. Shop fitted. Company and Support did not. Their links painted on the page background (`#FBFBF7`) below the footer’s `#F2F1EF`, which read as a white band, and “Terms of Service” sat on the bottom edge of the document.

## Decisions made (and alternatives rejected)

- **Let the columns set the height.** A flex row replaces the absolute offsets. The footer background then wraps every link. Keeping the fixed frame and only painting a taller background would still leave the columns ignoring padding.
- **Size “legacy” from the leftover width.** At `lg`, the wordmark slot is `container-type: inline-size` and the word is `36cqw`, so it fills the space beside the columns at every desktop width. A larger em would overflow into Shop; the word cannot also match the column height without colliding.
- **Pad the row, then lift the wordmark.** `5.5em` under the row clears the Support list. An extra `1.75em` under the wordmark keeps the g/y descenders, which hang out of the tight line box, off the footer edge.
- **Links, copy, and polaroids stay.** Same `FOOTER_NAV` hrefs. Same five stills.

## Changes (file → what)

- `components/layout/footer/footer-nav.tsx` — flex row; columns in normal flow; bottom padding; wordmark slot.
- `components/layout/footer/footer-nav.css` — `36cqw` wordmark from `lg` up. The thickened “l” is unchanged.

## Gotchas for future work

- Do not put the columns back on `lg:absolute` inside a fixed height. Support is the tallest list and will fall out of the gray again.
- `36cqw` is the width of the slot, not the viewport. Changing the column gap changes how big “legacy” gets.
- Line-height `0.78` lets the g and y paint outside the line box. The slot’s `lg:mb-[1.75em]` is that overflow, not decoration.
- The five polaroids above this row are listed in `FOOTER_POLAROIDS` (`constants.ts`). Replacing a file in place keeps the scatter; a new filename has to be updated there.
## Verification (commands + evidence)

- Browser, desktop ~1920: footer background ends at the document bottom (no page-background strip). About 42px between the wordmark ink and the Shop column. About 96px from “Terms of Service” to the footer edge. About 49px from the lowest wordmark ink to the footer edge.
- Browser, 390px wide: wordmark stacks above the columns, no horizontal overflow.
