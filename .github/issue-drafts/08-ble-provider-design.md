---
title: "Design the BLE MeasurementProvider interface (payload + connection flow)"
labels: [help wanted, hardware]
---
## Context
The game reads all measurements through `MeasurementProvider` (`src/game/measurement/`). There's a `BluetoothMeasurementProvider` **stub** with placeholder UUIDs and an example `decode()` (three little-endian uint16 values in ppb). It has never touched real hardware.

## Questions to answer (a design write-up is a great outcome; code is optional)
1. **Payload:** what should a device send? Raw ppb per gas? Raw sensor resistance plus calibration? Temperature/humidity? A sample ID?
2. **Sampling:** does the game request a sample (read characteristic), or does the device stream one (notify)? How do we handle warm-up time?
3. **Errors:** disconnects, sensor not ready, out-of-range values.
4. **Interface changes:** does `measure({ phase, experiment, trial })` need more, such as a progress callback for a 30-second sampling window?

## Done when
- [ ] A short spec, either as a comment here or as a new `docs/SENSOR_INTERFACE.md` in a PR
- [ ] (Optional) The stub updated to match the spec
