---
title: "Polish the mobile layout"
labels: [help wanted, UX]
---
## Current state
Below 820px the layout collapses to one column (`@media (max-width: 820px)` in `src/styles.css`): HUD first, then the lab, then suspects. It works, and there is no page-level horizontal scroll at 390px, but it's long and clunky:

- the experiment list is very tall, so the hypothesis chips and results are far apart
- the evidence board needs sideways scrolling
- the suspects list ends up at the very bottom

## Ideas
- A sticky compact signal bar (signal + evidence) at the top on mobile
- Collapsible sections, or bottom tabs: Lab / Board / Suspects
- A vertical evidence board layout on narrow screens

## Done when
- [ ] Case #001 is comfortable to play at 390×844
- [ ] No horizontal page scroll
- [ ] Screenshots in the PR
