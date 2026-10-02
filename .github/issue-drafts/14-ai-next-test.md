---
title: "Smarter 'What should we test next?' using expected information gain"
labels: [help wanted, AI]
---
## Context
After each experiment the game suggests three next tests. Today that's a hand-written scored rule set (`suggestNextTests` in `src/game/evidenceEngine.js`): "replicate a strong result", "isolate a broad test", "pivot after a weak result", and so on.

## Idea
Rank experiments by how much they're **expected to reduce uncertainty** about which suspect dominates:
- keep a belief over suspect contributions (a simple discrete grid or particles is fine)
- for each available experiment, simulate likely outcomes under the current belief
- pick the experiments with the highest expected information gain, and explain *why* in plain words

The hidden model must stay hidden. The recommender may only use past measurements and the **public** experiment definitions (`effects`, `specificity`), never `caseEngine` internals.

## Done when
- [ ] Suggestions come from the new method, with human-readable reasons
- [ ] With `npm run sim`-style headless runs, show that it solves cases in fewer experiments on average than the rule set
- [ ] No heavy dependencies
