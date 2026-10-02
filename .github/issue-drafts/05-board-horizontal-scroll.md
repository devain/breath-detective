---
title: "Evidence board: the Food column is hidden on ~1280px screens"
labels: [good first issue, UX]
---
## Problem
On a 1280×800 window the evidence board scrolls horizontally inside its panel, and the 🍜 Food column is cut off. Many players won't notice they can scroll.

Cause: `.board-svg { min-width: 760px }` in `src/styles.css`, while the centre column is narrower than that at this window size.

## Possible approaches
- Let the SVG shrink further, and hide or shorten secondary text at small widths
- Reduce the sidebar/HUD widths around 1280px
- Show a visible "scroll →" hint when the board overflows

## Done when
- [ ] All 5 suspects are visible without scrolling at 1280px wide
- [ ] Board text stays readable (check the experiment cards)
- [ ] Before/after screenshots in the PR
