// Headless balance check: runs every experiment once per case and prints the response.
import { CASES } from '../src/data/cases.js';
import { EXPERIMENTS } from '../src/data/experiments.js';
import { createRun, caseSolution } from '../src/game/caseEngine.js';
import { sampleSimulated } from '../src/game/measurement/SimulatedMeasurementProvider.js';
import { gameReducer, initialState } from '../src/game/gameReducer.js';
import { hypothesisStats } from '../src/game/evidenceEngine.js';

const seed = process.argv[2] || 'demo';
for (const c of CASES) {
  let state = gameReducer(initialState, { type: 'START_CASE', caseId: c.id, seed });
  const base = sampleSimulated(state.run, { phase: 'baseline', trial: 0 });
  state = gameReducer(state, { type: 'BASELINE', measurement: base });
  const sol = caseSolution(state.run);
  console.log(`\n${c.number} ${c.title}  baseline signal ${base.signal} (H2S ${base.h2s} CH3SH ${base.ch3sh} DMS ${base.dms})`);
  console.log('  hidden shares:', sol.ranked.map(([f, s]) => `${f} ${(s * 100).toFixed(0)}%`).join(', '));
  for (const e of EXPERIMENTS) {
    const trial = state.run.experiments.length + 1;
    const before = sampleSimulated(state.run, { phase: 'before', experiment: e, trial });
    const after = sampleSimulated(state.run, { phase: 'after', experiment: e, trial });
    state = gameReducer(state, { type: 'RECORD_TRIAL', experimentId: e.id, before, after });
    const r = state.run.experiments.at(-1);
    console.log(`  ${e.name.padEnd(24)} ${(r.responsePct * 100).toFixed(0).padStart(5)}%  ${r.strength.padEnd(9)} +${r.points}`);
  }
  const st = hypothesisStats(state.run);
  console.log('  evidence%:', Object.values(st).map((s) => `${s.id} ${s.evidencePct}`).join(', '), '| total', state.run.evidenceTotal);
  const rep = gameReducer(state, { type: 'FILE_REPORT', primary: sol.top2[0], secondary: sol.top2[1] });
  console.log('  report:', rep.run.status, rep.run.result?.grade, 'xp', rep.profile.xp);
}
