import { MeasurementProvider } from './MeasurementProvider.js';
import { vscIndex, signalFromIndex } from '../caseEngine.js';

// Skeleton for a real VSC sensor over Web Bluetooth. Not wired into the UI yet.
//
// To connect hardware:
//   1. Fill in the GATT service/characteristic UUIDs your firmware exposes.
//   2. Implement `decode()` for its payload format (ppb per gas).
//   3. In src/game/measurement/index.js return this provider instead of the simulated one.
// The rest of the game (experiments, evidence, scoring) works unchanged, because it
// only consumes Measurement objects.
const SERVICE_UUID = '0000xxxx-0000-1000-8000-00805f9b34fb'; // TODO: device service
const SAMPLE_CHAR_UUID = '0000yyyy-0000-1000-8000-00805f9b34fb'; // TODO: sample characteristic

export class BluetoothMeasurementProvider extends MeasurementProvider {
  constructor() {
    super();
    this.device = null;
    this.characteristic = null;
  }

  get info() {
    return { id: 'ble', name: this.device?.name ?? 'Bluetooth sensor', simulated: false };
  }

  async connect() {
    if (!navigator.bluetooth) throw new Error('Web Bluetooth is not available in this browser');
    this.device = await navigator.bluetooth.requestDevice({ filters: [{ services: [SERVICE_UUID] }] });
    const server = await this.device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    this.characteristic = await service.getCharacteristic(SAMPLE_CHAR_UUID);
    return true;
  }

  async disconnect() {
    this.device?.gatt?.disconnect();
  }

  async measure({ phase, experiment }) {
    if (!this.characteristic) throw new Error('Sensor not connected');
    const view = await this.characteristic.readValue();
    const g = this.decode(view);
    const index = vscIndex(g);
    return {
      timestamp: Date.now(),
      ...g,
      index: Math.round(index * 100) / 100,
      signal: signalFromIndex(index),
      source: 'ble',
      label: phase === 'baseline' ? 'Baseline' : `${experiment?.name ?? ''} · ${phase}`,
    };
  }

  // Example payload: three little-endian uint16 values in ppb.
  decode(view) {
    return { h2s: view.getUint16(0, true), ch3sh: view.getUint16(2, true), dms: view.getUint16(4, true) };
  }
}
