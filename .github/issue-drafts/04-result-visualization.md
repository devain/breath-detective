---
title: "Improve experiment result visualization: show the response on a threshold scale"
labels: [good first issue, UX]
---
## Problem
After an experiment, the player sees "−44% · STRONG RESPONSE", but not *how close* it was to the strong/moderate/weak boundaries. A −34% "moderate" and a −36% "strong" look very different, yet they are almost the same result.

## Idea
In the response card (`src/components/ExperimentRunner.jsx`), add a small horizontal scale:

```
weak        moderate        strong
|-----------|---------------|--------------->
0%         15%             35%      ▲ 44%
```

Thresholds live in `STRENGTH` in `src/game/experimentEngine.js`. Read them from there; don't hard-code them.

## Done when
- [ ] The scale renders for decrease and increase experiments (the food challenge is an "increase" test)
- [ ] It works in dark and light themes
- [ ] A screenshot is attached to the PR
