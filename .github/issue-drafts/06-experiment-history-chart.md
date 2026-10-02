---
title: "Add an experiment history chart (response per trial, grouped by suspect)"
labels: [help wanted, UX]
---
## Problem
The HUD's *Signal history* sparkline (`Sparkline` in `src/components/SignalHUD.jsx`) shows raw signal over every sample. It doesn't answer the question players actually have: **"which suspects keep responding?"**

## Idea
A small chart (in the Evidence board tab or the Case log tab) with:
- x: trial number
- y: response % (`record.responsePct`)
- one colour/marker per suspect, with a legend
- dashed lines at the ±15% and ±35% thresholds

Data is already in `run.experiments`. No new state needed.

## Notes
- No new dependencies, please. The existing charts are hand-written SVG.
- Hover should show the experiment name and the exact %.

## Done when
- [ ] The chart updates live as experiments are run
- [ ] It's readable in both themes and on a phone-width screen
