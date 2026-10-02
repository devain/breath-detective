---
title: "Add a data-source switch: Simulated vs Bluetooth sensor"
labels: [help wanted, hardware, UX]
---
## Problem
The provider is chosen in one place, `createMeasurementProvider()` in `src/game/measurement/index.js`, and it always returns the simulated one. There's no UI to pick a source or connect a device.

## Task
- Add a small "Data source" control (for example in the top bar or the case intake screen): **Simulated** (default) / **Bluetooth sensor (experimental)**
- Choosing Bluetooth calls `provider.connect()` from the click (Web Bluetooth requires a user gesture) and shows the connection state
- If Web Bluetooth isn't available (Firefox, Safari), show a friendly message and stay on Simulated
- The HUD already shows `src: …` from `provider.info.name`

Real hardware isn't needed: success is that the flow works and fails gracefully.

## Done when
- [ ] Simulated play is unchanged
- [ ] Choosing Bluetooth opens the browser's device chooser (in Chrome) or shows a clear "not supported" message
