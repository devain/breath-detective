// Experiment engine: availability, response maths, and turning a before/after
// pair of measurements into an experiment record. Knows nothing about the hidden
// model — it only sees measurements, exactly like a player would.

import { EXPERIMENTS, EXPERIMENT_BY_ID } from '../data/experiments.js';
import { evidencePoints, contradictsHistory } from './evidenceEngine.js';

export const STRENGTH = {
  strong: { id: 'strong', label: 'STRONG RESPONSE', dot: '🟠', min: 0.35 },
  moderate: { id: 'moderate', label: 'MODERATE RESPONSE', dot: '🟣', min: 0.15 },
  weak: { id: 'weak', label: 'WEAK RESPONSE', dot: '⚪', min: 0 },
};

export function isUnlocked(exp, run) {
  if (!exp.unlock) return true;
  const { experiments, evidence } = exp.unlock;
  return (
    (experiments != null && run.experiments.length >= experiments) ||
    (evidence != null && run.evidenceTotal >= evidence)
  );
}

export function unlockHint(exp) {
  const parts = [];
  if (exp.unlock?.experiments != null) parts.push(`${exp.unlock.experiments} experiments`);
  if (exp.unlock?.evidence != null) parts.push(`${exp.unlock.evidence} evidence`);
  return `Unlocks at ${parts.join(' or ')}`;
}

export function availableExperiments(run) {
  return EXPERIMENTS.filter((e) => isUnlocked(e, run));
}

export function timesRun(run, experimentId) {
  return run.experiments.filter((r) => r.experimentId === experimentId).length;
}

// Response is the relative change of the composite VSC index.
export function computeResponse(before, after) {
  const pct = (after.index - before.index) / before.index;
  const gas = {};
  for (const k of ['h2s', 'ch3sh', 'dms']) gas[k] = before[k] ? (after[k] - before[k]) / before[k] : 0;
  return { pct, signalDelta: after.signal - before.signal, gas };
}

export function classify(pct, direction) {
  const effective = direction === 'increase' ? pct : -pct;
  const strength = effective >= STRENGTH.strong.min ? 'strong' : effective >= STRENGTH.moderate.min ? 'moderate' : 'weak';
  return { effective, strength };
}

// Nominal (publicly known) strength of the intervention on its own suspect.
function nominalEffect(exp) {
  if (exp.effects === 'timeOfDay') return 0.7;
  return Math.abs(exp.effects[exp.hypothesis]);
}

export function evaluateTrial(run, { experimentId, before, after }) {
  const exp = EXPERIMENT_BY_ID[experimentId];
  const response = computeResponse(before, after);
  const { effective, strength } = classify(response.pct, exp.direction);
  const repeatIndex = timesRun(run, experimentId);
  const contradicts = contradictsHistory(run, exp.hypothesis, strength);
  const points = evidencePoints({ strength, effective, repeatIndex, specificity: exp.specificity, contradicts });
  return {
    id: `trial-${run.experiments.length + 1}`,
    trial: run.experiments.length + 1,
    experimentId,
    hypothesis: exp.hypothesis,
    stated: run.statedHypothesis,
    before,
    after,
    responsePct: response.pct,
    gasDelta: response.gas,
    signalDelta: response.signalDelta,
    effective,
    strength,
    repeatIndex,
    contradicts,
    points,
    estimate: Math.max(0, Math.min(1, effective / nominalEffect(exp))),
    timestamp: Date.now(),
  };
}

export function flavorText(record) {
  const exp = EXPERIMENT_BY_ID[record.experimentId];
  if (record.contradicts) return 'Hmm. This disagrees with an earlier run on the same suspect. Something is confounding the picture.';
  if (record.effective < -0.08) return 'The signal moved the opposite way. That does not fit this hypothesis.';
  if (record.strength === 'strong')
    return exp.direction === 'increase'
      ? 'Interesting. Provoking this route pushed the signal up substantially.'
      : 'Interesting. The signal changed substantially after this experiment.';
  if (record.strength === 'moderate')
    return exp.specificity < 0.8
      ? 'Some change — but this test touches more than one suspect. The credit may be shared.'
      : 'A noticeable change. Suggestive, not conclusive.';
  return 'Barely moved. The evidence does not support this suspect as a major contributor — so far.';
}
