// Case engine: owns the hidden model of a case and the physics of the simulated breath.
//
//   gas_g = AMBIENT_g + intensity * Σ_f  contrib_f * load_f * profile_f,g
//   index = Σ_g gas_g / reference_g          (composite VSC load)
//   signal = 100 * (1 - e^(-index / 4))      (0..100, saturating)
//
// Every suspect starts a sample at load 1. Experiments scale loads down (or up),
// so the measured change depends on how much each suspect *secretly* contributes.

import { CASE_BY_ID } from '../data/cases.js';
import { HYPOTHESES, AMBIENT, GAS_REFERENCE } from '../data/hypotheses.js';
import { rngFor } from './rng.js';

const FACTORS = HYPOTHESES.map((h) => h.id);
const modelCache = new Map();

export function createRun(caseId, seed) {
  return {
    caseId,
    seed,
    startedAt: Date.now(),
    status: 'active', // active | solved
    baseline: null,
    measurements: [],
    experiments: [],
    evidenceTotal: 0,
    statedHypothesis: null,
    unlocked: [],
    patterns: {},
    reportAttempts: 0,
    xpEarned: 0,
    result: null,
    log: [],
  };
}

export function buildHiddenModel(caseDef, seed) {
  const key = `${caseDef.id}:${seed}`;
  if (modelCache.has(key)) return modelCache.get(key);

  const rng = rngFor(caseDef.id, seed, 'model');
  let base = { ...(caseDef.hiddenFactors || {}) };

  if (caseDef.mixedPool) {
    const pool = [...caseDef.mixedPool];
    const first = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    const second = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    base = { [first]: 0.44, [second]: 0.38, food: 0.04 };
    // remaining pool members share what is left
    pool.forEach((f) => (base[f] = 0.07));
  }

  const contrib = {};
  let sum = 0;
  for (const f of FACTORS) {
    const c = (base[f] || 0) * (1 + (rng() * 2 - 1) * caseDef.jitter);
    contrib[f] = c;
    sum += c;
  }
  for (const f of FACTORS) contrib[f] /= sum;

  const model = {
    caseId: caseDef.id,
    contrib,
    intensity: caseDef.intensity * (0.92 + rng() * 0.16),
    noise: caseDef.noise,
    morningAmp: caseDef.morningAmp,
  };
  model.shares = signalShares(model);
  modelCache.set(key, model);
  return model;
}

export function getModel(run) {
  return buildHiddenModel(CASE_BY_ID[run.caseId], run.seed);
}

export function baselineLoads() {
  return Object.fromEntries(FACTORS.map((f) => [f, 1]));
}

export function computeGases(model, loads) {
  const g = { ...AMBIENT };
  for (const h of HYPOTHESES) {
    const k = model.intensity * model.contrib[h.id] * (loads[h.id] ?? 1);
    g.h2s += k * h.profile.h2s;
    g.ch3sh += k * h.profile.ch3sh;
    g.dms += k * h.profile.dms;
  }
  return g;
}

export function vscIndex(g) {
  return g.h2s / GAS_REFERENCE.h2s + g.ch3sh / GAS_REFERENCE.ch3sh + g.dms / GAS_REFERENCE.dms;
}

export function signalFromIndex(index) {
  return Math.round(100 * (1 - Math.exp(-index / 4)));
}

export function signalLabel(signal) {
  if (signal == null) return 'UNKNOWN';
  if (signal >= 75) return 'HIGH';
  if (signal >= 55) return 'ELEVATED';
  if (signal >= 30) return 'MODERATE';
  return 'LOW';
}

// Share of the baseline index each suspect is responsible for. Hidden.
function signalShares(model) {
  const total = vscIndex(computeGases(model, baselineLoads()));
  const shares = {};
  for (const h of HYPOTHESES) {
    const only = Object.fromEntries(FACTORS.map((f) => [f, f === h.id ? 1 : 0]));
    const g = computeGases(model, only);
    shares[h.id] = (vscIndex(g) - vscIndex(AMBIENT)) / total;
  }
  return shares;
}

export function resolveEffects(experiment, model) {
  if (experiment.effects === 'timeOfDay') {
    return { dry: model.morningAmp, tongue: model.morningAmp * 0.3 };
  }
  return experiment.effects;
}

export function applyEffects(loads, effects, compliance = 1) {
  const next = { ...loads };
  for (const [f, e] of Object.entries(effects)) {
    next[f] = Math.max(0, (next[f] ?? 1) * (1 - e * compliance));
  }
  return next;
}

// Ground truth for the end-of-case check. Only consulted when a report is filed.
export function caseSolution(run) {
  const caseDef = CASE_BY_ID[run.caseId];
  const { shares } = getModel(run);
  const ranked = Object.entries(shares).sort((a, b) => b[1] - a[1]);
  const max = ranked[0][1];
  return {
    ranked,
    top2: ranked.slice(0, 2).map(([f]) => f),
    acceptablePrimary: ranked.filter(([, s]) => s >= max * 0.8).map(([f]) => f),
    requireSecondary: !!caseDef.requireSecondary,
  };
}

export function checkReport(run, primary, secondary) {
  const sol = caseSolution(run);
  if (sol.requireSecondary) {
    const pair = new Set([primary, secondary]);
    return pair.size === 2 && sol.top2.every((f) => pair.has(f));
  }
  return sol.acceptablePrimary.includes(primary);
}
