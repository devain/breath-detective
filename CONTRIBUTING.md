# Contributing to Breath Detective 🐛

First: thank you for even opening this file. This project started as a slightly ridiculous question, *"what if we debugged bad breath like a software bug?"*, and it only gets interesting if other people poke at it.

**You do not need to understand the whole project to contribute.** Most useful changes touch one file. And not every contribution is code.

## Who we'd love to hear from

| You are… | You could… |
|---|---|
| 🎨 **Frontend / game developer** | polish the evidence board, add animations, improve mobile, make feedback juicier |
| 🛠️ **Backend developer** | (there's no backend, on purpose!) help design data export, or a future optional sync. Ask first |
| 🤖 **AI / ML person** | smarter "what to test next?" recommendations, estimating contributors from noisy data |
| 🔌 **Hardware / sensor tinkerer** | survey VSC sensors, design the BLE payload, build the real `MeasurementProvider` |
| 🦷 **Dentist / clinician** | tell us which assumptions are naïve, which "experiments" make no sense, what a sane protocol looks like |
| 🔬 **Researcher** | add citations, critique the model, sketch a pilot study |
| ✏️ **UX designer** | make the loop clearer: hypothesis → experiment → evidence |
| 🎲 **Game designer** | balance, pacing, new mechanics, better cases |
| 📊 **Data scientist** | improve the simulation, design an export format, think about future datasets |
| 💡 **Anyone with an interesting idea** | open an issue. Seriously |

## Good first contributions

| | Idea | Where |
|---|---|---|
| 🐛 | Add a new fictional case | `src/data/cases.js` |
| 🧪 | Add a new experiment | `src/data/experiments.js` |
| 📊 | Improve a visualization | `src/components/` |
| 🎮 | Improve game feedback (messages, animations) | `src/components/ExperimentRunner.jsx`, `src/game/experimentEngine.js` |
| 🧠 | Improve the simulation model | `src/game/caseEngine.js`, `src/data/hypotheses.js` |
| 📝 | Improve documentation | `README.md`, `docs/` |
| 🔌 | Design the sensor interface | `src/game/measurement/` |

Browse issues labelled [`good first issue`](https://github.com/devain/breath-detective/labels/good%20first%20issue) and [`help wanted`](https://github.com/devain/breath-detective/labels/help%20wanted). Comment on one to claim it. No need to wait for permission.

## Getting set up (≈ 2 minutes)

You need [Node.js](https://nodejs.org/) 18+.

```bash
git clone https://github.com/devain/breath-detective.git
cd breath-detective
npm install
npm run dev        # http://localhost:5173 — hot reloads as you edit
```

Before opening a PR, check:

```bash
npm run build      # must succeed
npm run sim        # prints every case × experiment; check your change behaves sensibly
```

…and play through at least one case in the browser. There's no test suite or linter yet ([adding tests is a good issue](https://github.com/devain/breath-detective/issues)). Match the surrounding style: plain JS, small functions, comments only where something isn't obvious.

Want a 5-minute tour of the code first? Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Recipes

### 🐛 Add a fictional case

Add an object to `CASES` in [`src/data/cases.js`](src/data/cases.js):

```js
{
  id: 'case-006',
  number: '006',
  title: 'The Coffee Conundrum',
  teaser: 'Fine at 7am. Not fine at 10am.',
  description: 'Short setup the player reads at intake.',
  notes: ['Clue the player can see.', 'Another clue.'],      // field notes, no spoilers
  hiddenFactors: { dry: 0.4, food: 0.35, tongue: 0.2, oral: 0.05 }, // secret; normalised automatically
  intensity: 1,      // overall strength
  morningAmp: 0.3,   // how much "time of day" affects dry mouth
  noise: 0.04,       // sensor noise per gas (0.035–0.05 is comfortable)
  jitter: 0.1,       // per-playthrough randomisation of hiddenFactors
}
```

Then run `npm run sim` to see how each experiment responds. A good case has **one clearly strong test**, at least one **red herring** (a moderate response from a broad test), and field notes that hint without spoiling. Cases unlock in order, so new ones go at the end.

### 🧪 Add an experiment

Add an object to `EXPERIMENTS` in [`src/data/experiments.js`](src/data/experiments.js):

```js
{
  id: 'gum',
  name: 'Sugar-free gum',
  hypothesis: 'dry',                 // which suspect this tests
  action: 'CHEW GUM',                // the big button label
  working: 'Chewing for 5 minutes…', // shown while "doing" it
  blurb: 'Stimulates saliva flow.',
  effects: { dry: 0.5, food: 0.1 },  // fraction of each suspect's load removed (negative = adds)
  direction: 'decrease',             // which direction would SUPPORT the hypothesis
  specificity: 0.8,                  // 1 = isolates its suspect; lower = broad, earns less evidence
  unlock: { experiments: 2 },        // optional: { experiments: n } and/or { evidence: n }
}
```

The "what to test next?" system picks it up automatically.

### 👃 Add a hypothesis (suspect)

Add it to `HYPOTHESES` in [`src/data/hypotheses.js`](src/data/hypotheses.js) with a gas `profile`, and give at least one experiment that targets it. ⚠️ The evidence board currently lays out exactly 5 columns, so a 6th suspect also needs a small layout change in `EvidenceBoard.jsx`. There's an issue for that.

## Challenge the experiment

Code is welcome. So is disagreement. If you think:

- a threshold is arbitrary,
- an experiment is a bad test (e.g. mouth rinse mostly *masks* things),
- the scoring rewards the wrong habits,
- or the whole premise is flawed,

open an issue with the **💡 Idea / challenge** template. Well-argued scepticism moves this project forward more than another button.

## 🔬 Research & clinical contributions

- Add citations to the **KNOWN** section of [docs/RESEARCH.md](docs/RESEARCH.md). Please link the source and quote the specific claim.
- Propose changes to the protocol or the list of confounders.
- Point out anything that reads like a medical claim. We'll fix it.

## Language rules (important)

This is a game and research prototype, **not** a medical tool. In UI text, docs and code comments:

- ✅ "possible contributor", "strong response", "the signal changed", "evidence supports this hypothesis", "simulated result"
- ❌ "you have…", "the cause is…", "diagnosis", any named disease as a conclusion

Cases must stay clearly fictional. Never present simulated numbers as real data.

## Pull requests

1. Fork, then create a branch: `git checkout -b add-coffee-case`
2. Keep PRs small and focused: one case, one feature, one fix.
3. Fill in the PR template (it's short).
4. Screenshots or GIFs for anything visual are hugely appreciated.

Unsure whether something fits? Open an issue or a draft PR and ask. There are no stupid questions in a project about debugging breath.

## Be kind

Be respectful and assume good intent. People here come from very different fields. A dentist doesn't know React, a React dev doesn't know periodontology, and that's the point. Harassment or dismissive behaviour isn't welcome.

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
