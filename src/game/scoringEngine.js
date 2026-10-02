// Scoring engine: XP ranks, end-of-case investigation quality, achievements.
// "Investigation quality" grades the reasoning process — it is a game score,
// not a measure of medical accuracy.

import { RANKS, ACHIEVEMENTS } from '../data/progression.js';
import { CASES } from '../data/cases.js';
import { EXPERIMENT_BY_ID } from '../data/experiments.js';
import { HYPOTHESIS_BY_ID } from '../data/hypotheses.js';
import { hypothesisStats } from './evidenceEngine.js';

export function rankFor(xp) {
  let idx = 0;
  RANKS.forEach((r, i) => {
    if (xp >= r.xp) idx = i;
  });
  const rank = RANKS[idx];
  const next = RANKS[idx + 1] ?? null;
  const progress = next ? (xp - rank.xp) / (next.xp - rank.xp) : 1;
  return { rank, next, progress };
}

const clamp01 = (x) => Math.max(0, Math.min(1, x));

export function finalScore(run, primary, secondary) {
  const stats = hypothesisStats(run);
  const exps = run.experiments;
  const n = exps.length;
  const tested = Object.values(stats).filter((s) => s.n > 0);
  const p = stats[primary];

  const counts = {};
  exps.forEach((r) => (counts[r.experimentId] = (counts[r.experimentId] || 0) + 1));
  const excessRepeats = Object.values(counts).reduce((a, c) => a + Math.max(0, c - 2), 0);
  const hypothesisDriven = n ? exps.filter((r) => r.stated === r.hypothesis).length / n : 0;

  const hypothesisTesting = clamp01(
    0.4 * Math.min(1, tested.length / 3) + 0.35 * (p?.n >= 2 ? 1 : p?.n ? 0.4 : 0) + 0.25 * hypothesisDriven,
  );
  const evidenceCoverage = clamp01(0.6 * Math.min(1, run.evidenceTotal / 100) + 0.4 * (tested.length / 5));
  let efficiency = n < 3 ? 0.4 : 1 - Math.max(0, n - 6) * 0.08;
  efficiency -= excessRepeats * 0.1 + Math.max(0, run.reportAttempts - 1) * 0.15;
  efficiency = clamp01(efficiency);

  const overall = (hypothesisTesting + evidenceCoverage + efficiency) / 3;
  const grade = overall >= 0.88 ? 'S' : overall >= 0.75 ? 'A' : overall >= 0.6 ? 'B' : 'C';

  const strongest = [...exps].sort((a, b) => b.effective - a.effective)[0];
  const alternative = tested
    .filter((s) => s.id !== primary)
    .sort((a, b) => b.n - a.n)[0];

  return {
    experiments: n,
    evidence: run.evidenceTotal,
    strongest: strongest && { name: EXPERIMENT_BY_ID[strongest.experimentId].name, pct: strongest.responsePct },
    alternative: alternative && HYPOTHESIS_BY_ID[alternative.id].name,
    primary,
    secondary,
    confidence: p?.confidence ?? 'Low',
    quality: { hypothesisTesting, evidenceCoverage, efficiency },
    overall,
    grade,
    excessRepeats,
  };
}

// Returns ids of achievements newly earned given the updated profile/run.
export function newAchievements(profile, run, { solvedNow = false } = {}) {
  const has = (id) => !!profile.achievements[id];
  const stats = hypothesisStats(run);
  const earned = [];
  const check = (id, cond) => !has(id) && cond && earned.push(id);

  check('first_signal', !!run.baseline);
  check('experimenter', profile.totalExperiments >= 5);
  check('tongue_detective', run.experiments.some((r) => r.hypothesis === 'tongue' && r.strength === 'strong'));
  check('pattern_hunter', Object.values(stats).filter((s) => s.n > 0).length >= 3);
  check('replicator', run.experiments.some((r) => r.repeatIndex >= 1 && r.strength === 'strong' &&
    run.experiments.some((o) => o !== r && o.experimentId === r.experimentId && o.strength === 'strong')));
  check('null_result', Object.values(run.patterns).includes('cleared'));
  if (solvedNow) {
    check('bug_hunter', true);
    check('scientific_mind', run.result?.excessRepeats === 0);
    check('first_try', run.reportAttempts === 1);
    check('master', CASES.every((c) => profile.solved[c.id]));
  }
  return earned.filter((id) => ACHIEVEMENTS.some((a) => a.id === id));
}
