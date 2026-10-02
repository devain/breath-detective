---
title: "Challenge the experiment: is 'mouth rinse' a valid test at all?"
labels: [research, gameplay]
---
## The assumption
`Mouth rinse` is modelled as a broad test of the 🦷 *Oral* suspect that reduces several suspects' load (`src/data/experiments.js`).

## The challenge
Many rinses may mostly **mask** odour for a while rather than change its source. If so, a big drop after rinsing says little about *where* the signal comes from. The game might be teaching a misleading habit.

## Discussion wanted
- Clinicians and researchers: is this a fair concern? What is known about how quickly rinse effects fade?
- Game designers: should rinse become a **"trap" experiment** (a big immediate drop, then a rebound if you re-measure later)? Should it cost evidence or give a hint about masking?
- Is there a better "broad" test to include?

## Outcome
A decision recorded in this issue, followed by a small PR to the experiment data or the model.
