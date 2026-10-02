---
title: "Add sourced references to the KNOWN section of docs/RESEARCH.md"
labels: [good first issue, research, documentation]
---
## Problem
`docs/RESEARCH.md` lists broadly accepted background (VSCs as major contributors, the tongue coating as a frequent source, DMS and sources outside the mouth, organoleptic assessment as a reference). It deliberately has **no citations yet**.

## Task
For each bullet in **KNOWN**:
- find one or two reputable sources (review articles preferred)
- add a reference list at the bottom, with links
- if a source contradicts or nuances a bullet, **rewrite the bullet** to match. That's even better.

Also worth sourcing or correcting: the reference levels the game uses (`GAS_REFERENCE` in `src/data/hypotheses.js`: 112 / 26 / 8 ppb), which are currently described as placeholders.

## Done when
- [ ] Every KNOWN bullet has at least one source
- [ ] No claim goes further than its source
