---
title: "Export an investigation as JSON / CSV"
labels: [good first issue, help wanted]
---
## Why
Exports make investigations shareable, give data people something to analyse, and are a first step towards a real-world measurement log format.

## Task
Add an **Export** button (for example in the Case log tab) that downloads:
- `investigation.json`: the current run (`state.run`: measurements, experiment records, log)
- `investigation.csv`: one row per experiment: trial, experiment, hypothesis, before/after gases, response %, strength, evidence points

Generate the files in the browser (`Blob` + `URL.createObjectURL`). No backend.

## Careful
Don't export the hidden case model while a case is active (no spoilers). Include `source: "simulated"` so exported data can't be mistaken for real measurements.

## Done when
- [ ] Both files download and open correctly (CSV opens in a spreadsheet)
- [ ] The format is described briefly in `docs/ARCHITECTURE.md`
