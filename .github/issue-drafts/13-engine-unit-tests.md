---
title: "Add unit tests for the game engines"
labels: [good first issue, help wanted]
---
## Context
There's no test suite yet. The engines in `src/game/` are plain functions with no React or DOM, so they're easy to test. `scripts/simulate.mjs` already shows how to drive them headlessly.

## Task
- Add [Vitest](https://vitest.dev/) as a devDependency and an `npm test` script
- Start with a few high-value tests:
  - `rng.js`: the same seed gives the same sequence
  - `caseEngine.js`: contributions normalise to 1; `checkReport` accepts the dominant suspect for each case
  - `experimentEngine.js`: `classify()` thresholds (14.9% → weak, 15% → moderate, 35% → strong; the increase direction works)
  - `evidenceEngine.js`: confidence rules (for example, 2 agreeing runs from different experiments → High)
  - `gameReducer.js`: `RECORD_TRIAL` adds evidence, and evidence is capped at 100

## Done when
- [ ] `npm test` passes
- [ ] CONTRIBUTING.md mentions `npm test` in the PR checklist
