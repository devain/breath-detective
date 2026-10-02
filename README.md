# 🐛 Breath Detective — V2

*Debug the mystery. Find the signal.*

A detective/debugging game about experimental reasoning. **Fictional research prototype — not a medical diagnostic system. All data is simulated.**

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run sim      # headless balance check of every case/experiment
```

## Layout
- `src/data/` — cases, experiments, suspects (gas fingerprints), XP/ranks/achievements
- `src/game/caseEngine.js` — hidden case model + breath physics (the only place that knows the answer)
- `src/game/experimentEngine.js` — unlocks, response %, strength classification, trial records
- `src/game/evidenceEngine.js` — per-hypothesis evidence/confidence, patterns, "what to test next"
- `src/game/scoringEngine.js` — ranks, investigation-quality score, achievements
- `src/game/gameReducer.js` — pure state transitions; `storage.js` persists to localStorage
- `src/game/measurement/` — `MeasurementProvider` interface, `SimulatedMeasurementProvider`, `BluetoothMeasurementProvider` stub
- `src/components/`, `src/pages/` — UI only

## Plugging in a real sensor
Implement `GATT UUIDs + decode()` in `BluetoothMeasurementProvider.js`, then return it from
`createMeasurementProvider()` in `src/game/measurement/index.js`. The game only consumes
`{ timestamp, h2s, ch3sh, dms, index, signal }` objects.
