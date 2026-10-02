# Research note

> **Status: an open question, not a finding.** Nothing in this repository has been tested on real people or real sensors. This document separates what is broadly established from what we're guessing, so contributors can challenge the right things.

## The question

> **Can changes in breath signals after targeted interventions provide useful evidence for distinguishing possible contributors to oral malodor?**

Put differently: a single breath measurement tells you *how much*. Could a structured series of *before → intervention → after* measurements say something about *where it comes from* — at home, with an affordable sensor, without anyone claiming a diagnosis?

We don't know. This project is a sandbox for exploring that question safely, with simulated data first.

---

## 🟦 KNOWN — broadly accepted background

These are general points from the halitosis literature. They're stated loosely on purpose; [adding proper citations](../CONTRIBUTING.md#-research--clinical-contributions) is one of the most useful things a researcher could contribute.

- **Volatile sulfur compounds (VSCs)** — mainly hydrogen sulfide (H₂S), methyl mercaptan (CH₃SH) and dimethyl sulfide (DMS) — are widely regarded as major contributors to bad breath.
- **Most cases are generally considered to originate in the mouth**, with the tongue coating frequently described as a major source.
- **Different compounds are associated with different sources.** DMS, for example, is often discussed in connection with sources outside the mouth.
- **Instruments exist** to measure VSCs (portable sulfide monitors, gas chromatography devices). **Organoleptic assessment** (a trained person smelling the breath) is commonly treated as a reference method.
- Breath measurements are **variable**: food, time of day, hydration, recent oral hygiene and how the sample is taken all affect readings.

## 🟨 HYPOTHESIS — what this project assumes (unproven)

- **H1. Relative response is informative.** If cleaning the tongue drops the signal a lot and flossing barely moves it, that pattern carries some information about the tongue's relative role, even if absolute readings are noisy.
- **H2. Repetition beats a single reading.** Repeating an intervention, and testing alternatives, gives more robust evidence than any one measurement.
- **H3. Gas ratios help.** The *mix* of H₂S / CH₃SH / DMS, not just the total, may hint at which suspects to test first.
- **H4. A game loop helps people reason well.** Framing it as debugging — hypothesis, controlled change, compare — may lead to better self-experimentation than a single "score".

The simulation is built *as if* these were true. That's a design choice, not evidence.

### What the game simplifies (on purpose)

| In the game | In reality |
|---|---|
| Each experiment starts from a fresh, identical baseline | Baselines drift through the day and between days |
| Suspects contribute additively | Sources interact; interventions have overlapping effects |
| Effects are fixed fractions ("tongue cleaning removes ~78% of tongue load") | Effects vary by person, technique, timing; mostly unknown |
| Gas fingerprints per suspect are invented numbers | Real profiles are uncertain and variable |
| The reference levels (112 / 26 / 8 ppb) are used as a convenient scale | They are placeholders here; real thresholds are device- and study-specific and need sourcing |
| Noise is gaussian, 3.5–5% | Real sensor error includes drift, warm-up, cross-sensitivity, humidity |
| The "answer" is a known hidden parameter | In reality there may be no single answer |

## 🟥 FUTURE RESEARCH — what would need to happen

Even a modest real-world version would need, at minimum:

### 1. A measurement protocol
- **Baseline:** fixed conditions — e.g. time since eating/drinking/brushing, mouth closed for N minutes, consistent sampling method.
- **Intervention:** one change at a time, standardised (what counts as "tongue cleaning"?).
- **Post-intervention measurement:** fixed delay after the intervention; how long do effects last?
- **Relative response:** a pre-registered definition (% change in which metric?) and thresholds justified by measurement error, not chosen for game feel.
- **Repeated experiments:** how many repeats are enough, on how many days?

### 2. Handling confounders
- Time of day and morning dryness
- Recent food (garlic, onion, coffee, alcohol), smoking
- Masking effects: mouth rinses and mints change readings without changing the source
- Placebo / expectation effects when people know what is being tested
- Sensor drift, warm-up, temperature and humidity
- Regression to the mean (people test when it's worst)

### 3. Validation
- Compare sensor readings against an accepted reference (e.g. organoleptic scores and/or lab-grade instruments).
- **Controlled clinical studies**, designed and supervised by qualified professionals, with ethics approval and informed consent, before any claim that the approach is useful for anyone.

### 4. Data & ethics
- Any real dataset must be consented, anonymised and stored responsibly.
- No feature should tell a user they have a condition. The most a tool like this should say is "this change produced a large/small response" — and "talk to a professional".

## How you can help

- **Clinicians / dentists:** tell us where H1–H4 are naïve or wrong. Which interventions would you never use as a "test"? What would a sensible protocol look like?
- **Researchers:** add citations to the KNOWN section; propose a pilot study design; critique the response thresholds.
- **Hardware people:** what affordable sensors measure H₂S / CH₃SH / DMS at the right ranges, and how bad is their cross-sensitivity?
- **Data/ML people:** how would you estimate contributors from noisy before/after pairs? What's the minimum number of experiments to be confident?

Open a [research issue](https://github.com/devain/breath-detective/issues/new/choose). **Challenging the experiment is a contribution.**

---

*Breath Detective is a research/game prototype. It is not a medical device, does not diagnose halitosis or any other condition, and should not be used to make health decisions.*
