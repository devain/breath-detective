---
title: "Add a new experiment: sugar-free gum (saliva stimulation)"
labels: [good first issue, gameplay]
---
## What
Add a **Sugar-free gum** experiment that mainly tests the 💧 *Dry mouth* suspect, with a small side effect on 🍜 *Food*.

## Where
- `src/data/experiments.js`: add an object to `EXPERIMENTS`
- Field reference: [CONTRIBUTING.md → Add an experiment](https://github.com/devain/breath-detective/blob/main/CONTRIBUTING.md#-add-an-experiment)

## Things to decide
- `effects`: how strong compared with *Hydration* (`dry: 0.75`)?
- `specificity`: is it a clean test or a broad one?
- `unlock`: available from the start, or unlocked later?

## Done when
- [ ] The experiment shows in the Lab and can be run
- [ ] `npm run sim` output looks sensible: a strong response in Case #002, weak in Case #001
- [ ] It can appear in "What should we test next?" (no code change needed; check that it shows up)
