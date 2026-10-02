// Pure game-state reducer. UI dispatches intents; all rules live in the engines.

import { createRun, checkReport } from './caseEngine.js';
import { evaluateTrial, isUnlocked } from './experimentEngine.js';
import { hypothesisStats, detectPatterns } from './evidenceEngine.js';
import { finalScore, newAchievements, rankFor } from './scoringEngine.js';
import { EXPERIMENTS, EXPERIMENT_BY_ID } from '../data/experiments.js';
import { HYPOTHESIS_BY_ID } from '../data/hypotheses.js';
import { XP } from '../data/progression.js';

export const initialProfile = { xp: 0, achievements: {}, solved: {}, totalExperiments: 0 };

export const initialState = {
  screen: 'title', // title | cases | investigation
  theme: 'dark',
  profile: initialProfile,
  run: null,
  events: [],
  eventSeq: 0,
};

const fmtPct = (x) => `${x > 0 ? '+' : ''}${Math.round(x * 100)}%`;

// Mutable helper used inside one reducer step on fresh copies.
function makeCtx(state) {
  const ctx = {
    profile: { ...state.profile, achievements: { ...state.profile.achievements }, solved: { ...state.profile.solved } },
    run: state.run ? { ...state.run, log: [...state.run.log], patterns: { ...state.run.patterns } } : null,
    events: [...state.events],
    seq: state.eventSeq,
  };
  ctx.emit = (e) => ctx.events.push({ id: ++ctx.seq, ...e });
  ctx.log = (type, text) => ctx.run && ctx.run.log.push({ t: Date.now(), type, text });
  ctx.xp = (amount, reason) => {
    if (!amount) return;
    const before = rankFor(ctx.profile.xp).rank;
    ctx.profile.xp += amount;
    if (ctx.run) ctx.run.xpEarned += amount;
    ctx.emit({ type: 'xp', amount, reason });
    const after = rankFor(ctx.profile.xp).rank;
    if (after.id !== before.id) ctx.emit({ type: 'rank', rank: after });
  };
  ctx.achievements = (opts) => {
    if (!ctx.run) return;
    for (const id of newAchievements(ctx.profile, ctx.run, opts)) {
      ctx.profile.achievements[id] = Date.now();
      ctx.emit({ type: 'achievement', achievementId: id });
    }
  };
  ctx.commit = (extra = {}) => ({
    ...state,
    profile: ctx.profile,
    run: ctx.run,
    events: ctx.events.slice(-8),
    eventSeq: ctx.seq,
    ...extra,
  });
  return ctx;
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, screen: action.screen };

    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };

    case 'DISMISS_EVENT':
      return { ...state, events: state.events.filter((e) => e.id !== action.id) };

    case 'START_CASE': {
      const run = createRun(action.caseId, action.seed);
      run.log.push({ t: Date.now(), type: 'case', text: `Case opened · seed ${action.seed}` });
      return { ...state, run, screen: 'investigation' };
    }

    case 'ABANDON_CASE':
      return { ...state, run: null, screen: 'cases' };

    case 'RESET_PROFILE':
      return { ...initialState, theme: state.theme };

    case 'BASELINE': {
      const ctx = makeCtx(state);
      const m = action.measurement;
      ctx.run.baseline = m;
      ctx.run.measurements = [...ctx.run.measurements, { ...m, phase: 'baseline' }];
      ctx.log('measure', `Baseline · signal ${m.signal} · H₂S ${m.h2s} · CH₃SH ${m.ch3sh} · DMS ${m.dms} ppb`);
      ctx.xp(XP.firstMeasurement, 'First measurement');
      ctx.achievements();
      return ctx.commit();
    }

    case 'STATE_HYPOTHESIS': {
      if (!state.run) return state;
      const ctx = makeCtx(state);
      ctx.run.statedHypothesis = action.hypothesis;
      ctx.log('hypothesis', `Hypothesis: "I suspect ${HYPOTHESIS_BY_ID[action.hypothesis].statement}."`);
      return ctx.commit();
    }

    case 'RECORD_TRIAL': {
      const ctx = makeCtx(state);
      const run = ctx.run;
      const exp = EXPERIMENT_BY_ID[action.experimentId];
      const record = evaluateTrial(state.run, action);
      const unlockedBefore = new Set(EXPERIMENTS.filter((e) => isUnlocked(e, run)).map((e) => e.id));

      run.experiments = [...run.experiments, record];
      run.measurements = [
        ...run.measurements,
        { ...action.before, phase: 'before', trial: record.trial },
        { ...action.after, phase: 'after', trial: record.trial },
      ];
      run.evidenceTotal = Math.min(100, run.evidenceTotal + record.points);
      ctx.profile.totalExperiments += 1;

      ctx.log('experiment',
        `#${record.trial} ${exp.name} · index ${action.before.index} → ${action.after.index} (${fmtPct(record.responsePct)}) · ${record.strength.toUpperCase()} · +${record.points} evidence`);
      if (record.contradicts) ctx.log('warn', `#${record.trial} conflicts with earlier ${HYPOTHESIS_BY_ID[exp.hypothesis].name} results`);

      ctx.xp(XP.experiment, 'Experiment run');
      if (record.stated && record.stated === record.hypothesis) ctx.xp(XP.hypothesisDriven, 'Hypothesis-driven test');
      if (record.strength === 'strong') ctx.xp(XP.strongResponse, 'Strong response');

      const stats = hypothesisStats(run);
      for (const p of detectPatterns(run, stats)) {
        run.patterns[p.hypothesis] = p.kind;
        const h = HYPOTHESIS_BY_ID[p.hypothesis];
        ctx.emit({ type: 'pattern', hypothesis: p.hypothesis, kind: p.kind });
        ctx.log('pattern', p.kind === 'supported'
          ? `PATTERN · ${h.name} responds consistently across runs`
          : `PATTERN · ${h.name} repeatedly shows little response — deprioritised`);
        ctx.xp(XP.pattern, 'Pattern discovered');
      }

      const newly = EXPERIMENTS.filter((e) => !unlockedBefore.has(e.id) && isUnlocked(e, run)).map((e) => e.id);
      run.unlocked = [...run.unlocked, ...newly];
      newly.forEach((id) => {
        ctx.emit({ type: 'unlock', experimentId: id });
        ctx.log('unlock', `New test unlocked: ${EXPERIMENT_BY_ID[id].name}`);
      });
      run.lastUnlocked = newly;

      ctx.achievements();
      return ctx.commit();
    }

    case 'FILE_REPORT': {
      const ctx = makeCtx(state);
      const run = ctx.run;
      run.reportAttempts += 1;
      const { primary, secondary } = action;
      const ok = checkReport(run, primary, secondary);
      const label = [primary, secondary].filter(Boolean).map((h) => HYPOTHESIS_BY_ID[h].name).join(' + ');
      if (!ok) {
        ctx.log('report', `Report #${run.reportAttempts} rejected · ${label}`);
        ctx.emit({ type: 'rejected' });
        run.lastRejected = { primary, secondary, at: Date.now() };
        return ctx.commit();
      }
      run.status = 'solved';
      run.result = finalScore(run, primary, secondary);
      ctx.log('report', `Report #${run.reportAttempts} accepted · ${label} · grade ${run.result.grade}`);
      ctx.xp(XP.completeCase, 'Case complete');
      ctx.xp(XP.gradeBonus[run.result.grade], `Grade ${run.result.grade} bonus`);
      const prev = ctx.profile.solved[run.caseId];
      if (!prev || prev.overall < run.result.overall)
        ctx.profile.solved[run.caseId] = { grade: run.result.grade, overall: run.result.overall, at: Date.now() };
      ctx.achievements({ solvedNow: true });
      return ctx.commit();
    }

    default:
      return state;
  }
}
