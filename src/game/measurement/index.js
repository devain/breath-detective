import { SimulatedMeasurementProvider } from './SimulatedMeasurementProvider.js';

export { MeasurementProvider } from './MeasurementProvider.js';
export { SimulatedMeasurementProvider } from './SimulatedMeasurementProvider.js';
export { BluetoothMeasurementProvider } from './BluetoothMeasurementProvider.js';

// Single switch point for the data source. Swap in BluetoothMeasurementProvider here.
export function createMeasurementProvider(run) {
  return new SimulatedMeasurementProvider(run);
}
