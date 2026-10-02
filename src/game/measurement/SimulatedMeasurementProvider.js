import { MeasurementProvider } from './MeasurementProvider.js';
import {
  getModel,
  baselineLoads,
  computeGases,
  resolveEffects,
  applyEffects,
  vscIndex,
  signalFromIndex,
} from '../caseEngine.js';
import { rngFor, gaussian } from '../rng.js';

// Produces deterministic samples from the hidden case model. The same run seed,
// trial number and phase always yield the same reading.
export class SimulatedMeasurementProvider extends MeasurementProvider {
  constructor(run, { delayMs = 1400 } = {}) {
    super();
    this.run = run;
    this.delayMs = delayMs;
  }

  get info() {
    return { id: 'sim', name: 'Simulated sensor', simulated: true };
  }

  async measure({ phase, experiment, trial = 0 }) {
    if (this.delayMs) await new Promise((r) => setTimeout(r, this.delayMs));
    return sampleSimulated(this.run, { phase, experiment, trial });
  }
}

// Synchronous core, reused by tests and the headless sim script.
export function sampleSimulated(run, { phase, experiment, trial = 0 }) {
  const model = getModel(run);
  const rng = rngFor(run.seed, run.caseId, trial, phase, experiment?.id ?? 'none');

  let loads = baselineLoads();
  if (phase === 'after' && experiment) {
    const compliance = 0.88 + rngFor(run.seed, trial, 'compliance')() * 0.2;
    loads = applyEffects(loads, resolveEffects(experiment, model), compliance);
  }

  const clean = computeGases(model, loads);
  const g = {};
  for (const k of ['h2s', 'ch3sh', 'dms']) {
    g[k] = Math.max(0, Math.round(clean[k] * (1 + gaussian(rng) * model.noise)));
  }
  const index = vscIndex(g);
  return {
    timestamp: Date.now(),
    ...g,
    index: Math.round(index * 100) / 100,
    signal: signalFromIndex(index),
    source: 'simulated',
    label: phase === 'baseline' ? 'Baseline' : `${experiment?.name ?? ''} · ${phase}`,
  };
}
