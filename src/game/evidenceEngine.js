// Evidence engine: aggregates experiment records into per-hypothesis evidence,
// confidence and patterns, and suggests what to test next.

import { HYPOTHESES, HYPOTHESIS_BY_ID } from '../data/hypotheses.js';
import { EXPERIMENTS, EXPERIMENT_BY_ID } from '../data/experiments.js';

const isSupport = (strength) => strength !== 'weak';

// Strong: 20–30, moderate: 10–20, weak: 0–10. Repeats and broad tests earn less.
export function evidencePoints({ strength, effective, repeatIndex, specificity, contradicts }) {
  const e = Math.max(0, effective) * 100;
  let base;
  if (strength === 'strong') base = 20 + Math.min(10, (e - 35) / 3);
  else if (strength === 'moderate') base = 10 + Math.min(10, (e - 15) / 2);
  else base = Math.max(2, Math.min(6, (15 - e) / 2.5)); // a clean null result is informative too
  const repeat = [1, 0.6, 0.25][Math.min(repeatIndex, 2)];
  const spec = 0.6 + 0.4 * specificity;
  const penalty = contradicts ? 0.5 : 1;
  return Math.max(0, Math.round(base * repeat * spec * penalty));
}

// Does a new result disagree with the majority of earlier results on that suspect?
export function contradictsHistory(run, hypothesis, strength) {
  const prior = run.experiments.filter((r) => r.hypothesis === hypothesis);
  if (!prior.length) return false;
  const sup = prior.filter((r) => isSupport(r.strength)).length;
  const majoritySupport = sup * 2 >= prior.length;
  return majoritySupport !== isSupport(strength);
}

export function hypothesisStats(run) {
  const out = {};
  for (const h of HYPOTHESES) {
    const tests = run.experiments.filter((r) => r.hypothesis === h.id);
    const n = tests.length;
    const supporting = tests.filter((r) => isSupport(r.strength)).length;
    const contradicting = n - supporting;
    const distinct = new Set(tests.map((r) => r.experimentId)).size;

    let evidencePct = null;
    if (n) {
      let w = 0;
      let s = 0;
      for (const r of tests) {
        const wt = EXPERIMENT_BY_ID[r.experimentId].specificity;
        w += wt;
        s += wt * r.estimate;
      }
      evidencePct = Math.round((100 * s) / w);
    }

    const consistency = n ? Math.max(supporting, contradicting) / n : 0;
    let confidence = null;
    if (n) {
      if ((n >= 3 && consistency >= 0.75) || (n >= 2 && distinct >= 2 && consistency === 1)) confidence = 'High';
      else if (n >= 2 && consistency >= 0.66) confidence = 'Medium';
      else confidence = 'Low';
    }

    let status = 'unknown';
    if (n) {
      if (supporting && contradicting && consistency < 0.75) status = 'conflicting';
      else if (supporting >= contradicting) status = 'supported';
      else status = 'unsupported';
    }

    out[h.id] = { id: h.id, n, supporting, contradicting, distinct, evidencePct, confidence, status };
  }
  return out;
}

export function leadingHypothesis(stats) {
  return Object.values(stats)
    .filter((s) => s.status === 'supported')
    .sort((a, b) => b.evidencePct - a.evidencePct)[0];
}

export function overallConfidence(run) {
  const lead = leadingHypothesis(hypothesisStats(run));
  return lead?.confidence ?? 'Low';
}

// Newly-discovered patterns since `prevStats`, given current `run.patterns`.
export function detectPatterns(run, stats) {
  const found = [];
  for (const s of Object.values(stats)) {
    if (run.patterns[s.id]) continue;
    if (s.status === 'supported' && s.supporting >= 2 && (s.confidence === 'Medium' || s.confidence === 'High')) {
      found.push({ hypothesis: s.id, kind: 'supported' });
    } else if (s.status === 'unsupported' && s.contradicting >= 2) {
      found.push({ hypothesis: s.id, kind: 'cleared' });
    }
  }
  return found;
}

// ─── What should we test next? ───────────────────────────────────────────────

export function suggestNextTests(run, last, { isUnlocked, newlyUnlocked = [] }) {
  const stats = hypothesisStats(run);
  const avail = EXPERIMENTS.filter((e) => isUnlocked(e, run));
  const count = (id) => run.experiments.filter((r) => r.experimentId === id).length;
  const cands = new Map();
  const add = (exp, score, title, why) => {
    if (!exp) return;
    const adj = score - Math.max(0, count(exp.id) - 1) * 30;
    const prev = cands.get(exp.id);
    if (!prev || prev.score < adj) cands.set(exp.id, { experimentId: exp.id, hypothesis: exp.hypothesis, score: adj, title, why });
  };
  const bestFor = (hyp) =>
    avail
      .filter((e) => e.hypothesis === hyp)
      .sort((a, b) => count(a.id) - count(b.id) || b.specificity - a.specificity)[0];
  const name = (hyp) => HYPOTHESIS_BY_ID[hyp].name.toLowerCase();

  const lastExp = EXPERIMENT_BY_ID[last.experimentId];
  const H = last.hypothesis;
  const untested = HYPOTHESES.filter((h) => stats[h.id].n === 0 && bestFor(h.id));

  if (last.strength !== 'weak') {
    if (count(lastExp.id) === 1)
      add(lastExp, last.strength === 'strong' ? 80 : 68, `Repeat ${lastExp.name.toLowerCase()}`,
        'One run can be noise. If the effect replicates, the pattern is much harder to dismiss.');
    avail
      .filter((e) => e.hypothesis === H && e.id !== lastExp.id && count(e.id) === 0)
      .forEach((e) => add(e, 77, `Cross-check with ${e.name.toLowerCase()}`,
        `A different test of the same suspect. Converging evidence from two methods beats one method twice.`));
    if (lastExp.specificity < 0.8 && typeof lastExp.effects === 'object') {
      Object.keys(lastExp.effects)
        .filter((f) => f !== H)
        .forEach((f) => add(bestFor(f), 84, `Isolate the ${name(f)}`,
          `${lastExp.name} also touches the ${name(f)}. If a ${name(f)}-only test responds too, the earlier result may be borrowed.`));
    }
    untested.forEach((h, i) =>
      add(bestFor(h.id), 72 - i, `Test ${name(h.id)}`,
        `Your ${name(H)} test responded. Rule out an alternative: does the ${name(h.id)} produce a similar response?`));
  } else {
    untested.forEach((h, i) =>
      add(bestFor(h.id), 82 - i, `Pivot to ${name(h.id)}`,
        `The ${name(H)} stayed quiet. Shift attention to a suspect you haven't touched yet.`));
    if (count(lastExp.id) === 1)
      add(lastExp, 50, `Repeat ${lastExp.name.toLowerCase()}`,
        'Confirm the null result. A second flat run would clear this suspect.');
  }

  newlyUnlocked.forEach((id) => {
    const e = EXPERIMENT_BY_ID[id];
    add(e, 79, `New tool: ${e.name.toLowerCase()}`, `Just unlocked. ${e.blurb}`);
  });

  // Conflicting suspects deserve a tie-breaker.
  Object.values(stats)
    .filter((s) => s.status === 'conflicting')
    .forEach((s) => add(bestFor(s.id), 74, `Break the tie on ${name(s.id)}`,
      `Results on the ${name(s.id)} disagree. A clean, specific test can settle it.`));

  avail.filter((e) => count(e.id) === 0).forEach((e) => add(e, 20, `Try ${e.name.toLowerCase()}`, e.blurb));

  return [...cands.values()].sort((a, b) => b.score - a.score).slice(0, 3);
}
