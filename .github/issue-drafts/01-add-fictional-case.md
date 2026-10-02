---
title: "Add a new fictional breath case"
labels: [good first issue, gameplay]
---
## What
Add **Case #006** to the game. A case is plain data, roughly 20 lines in one file. No React knowledge needed.

## Where
- `src/data/cases.js`: add an object to `CASES` (copy an existing one)
- Recipe with every field explained: [CONTRIBUTING.md → Add a fictional case](https://github.com/devain/breath-detective/blob/main/CONTRIBUTING.md#-add-a-fictional-case)

## Ideas (pick one or invent your own)
- *The Coffee Conundrum*: fine at 7am, worse mid-morning (dry mouth + food)
- *The Post-Gym Mystery*: dehydration-driven
- *The Decoy*: a broad test (mouth rinse) responds strongly, but the real contributor is somewhere else

## Done when
- [ ] The case appears after #005 and is playable end to end
- [ ] `npm run sim` shows at least one clearly **strong** experiment for the main contributor
- [ ] Field notes hint without giving the answer away
- [ ] Text stays fictional and avoids diagnostic language (see "Language rules" in CONTRIBUTING.md)
