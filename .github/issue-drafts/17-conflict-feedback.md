---
title: "Explain conflicting results better in game feedback"
labels: [good first issue, gameplay, UX]
---
## Problem
A classic moment in Case #001: **Brushing** gives a moderate response but **Flossing** gives a weak one, so "Oral" is flagged as *conflicting*. The real reason is that brushing also touches the tongue (`effects: { oral: 0.5, tongue: 0.2 }` in `src/data/experiments.js`).

The game shows "⚠ CONFLICT" but doesn't help the player work out *why*. That's the most educational moment in the case.

## Task
When a result contradicts earlier runs on the same suspect, improve the message (`flavorText` in `src/game/experimentEngine.js`, shown in `ExperimentRunner.jsx`):
- name the earlier run it disagrees with
- if either experiment is broad (`specificity < 0.8`), say that it touches other suspects, and name them (public info from `effects`)

The hidden model must stay hidden: only use public experiment data and past results.

## Done when
- [ ] Reproduce in Case #001 (Flossing, then Brushing) and show the new message in a screenshot
