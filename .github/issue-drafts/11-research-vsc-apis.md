---
title: "Investigate VSC sensor specs and measurement interfaces"
labels: [research, hardware]
---
## Goal
Find out whether affordable sensors can realistically give the game what it expects: **H₂S, CH₃SH and DMS in ppb** (see the `Measurement` model in `docs/ARCHITECTURE.md`).

## Questions
- Which commercially available sensors or modules measure any of these gases at roughly 10–1000 ppb?
- Cross-sensitivity: can a sensor tell H₂S from CH₃SH, or do we only get a "total sulfur" number?
- Output interface: analog, I²C, UART, BLE? Do any devices expose a documented API or SDK?
- Warm-up time, drift, and humidity effects (breath is humid)

## Why it matters
If realistic hardware only gives one "total VSC" number, the game's three-gas fingerprint model needs rethinking. That would be a valuable finding.

## Output
A summary comment or a PR to `docs/RESEARCH.md`, with datasheet links.
