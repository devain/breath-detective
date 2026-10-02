// Contract between the game and anything that can produce a breath sample.
//
// The UI only ever calls `measure()` and renders the returned Measurement:
//   { timestamp, h2s, ch3sh, dms, index, signal, source, label }
//
// `context` describes *why* the sample is being taken:
//   { phase: 'baseline' | 'before' | 'after', experiment, trial }
// A simulated provider uses it to drive the hidden model; a real sensor can ignore
// it (the player performs the intervention physically) or use it for prompts.
export class MeasurementProvider {
  get info() {
    return { id: 'abstract', name: 'Abstract provider', simulated: true };
  }

  /** Optional: pair / warm up a device. */
  async connect() {
    return true;
  }

  async disconnect() {}

  /** @returns {Promise<object>} a Measurement */
  // eslint-disable-next-line no-unused-vars
  async measure(context) {
    throw new Error('measure() not implemented');
  }
}
