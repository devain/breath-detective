---
title: "Add a new hypothesis type (support more than 5 suspects on the evidence board)"
labels: [help wanted, gameplay, UX]
---
## Problem
Suspects live in `src/data/hypotheses.js` and are mostly data-driven, **but** the evidence board hard-codes 5 columns:

```js
// src/components/EvidenceBoard.jsx
const colX = (i) => 100 + i * 200;   // assumes exactly 5 suspects in a 1000-wide viewBox
```

Adding a 6th suspect (for example *Tonsils* or *Medication-related dryness*) pushes it off the board.

## Task
1. Make the board layout scale with `HYPOTHESES.length` (column spacing and node width derived from the count).
2. Add one new suspect with a gas `profile` and at least one experiment that targets it.

## Done when
- [ ] The board looks right with 5 and with 6 suspects
- [ ] The new suspect appears in the sidebar, lab chips, report modal and evidence board
- [ ] `npm run build` passes; one case was played through
