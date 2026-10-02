import { useMemo, useState } from 'react';
import { CASE_BY_ID } from '../data/cases.js';
import { GAS_REFERENCE, GASES } from '../data/hypotheses.js';
import { createMeasurementProvider } from '../game/measurement/index.js';
import { hypothesisStats, overallConfidence } from '../game/evidenceEngine.js';
import { newSeed } from '../game/rng.js';
import TopBar from '../components/TopBar.jsx';
import SuspectList from '../components/SuspectList.jsx';
import SignalHUD, { SignalMeter, GasReadout } from '../components/SignalHUD.jsx';
import ExperimentLab from '../components/ExperimentLab.jsx';
import ExperimentRunner from '../components/ExperimentRunner.jsx';
import EvidenceBoard from '../components/EvidenceBoard.jsx';
import CaseLog from '../components/CaseLog.jsx';
import ReportModal from '../components/ReportModal.jsx';
import CaseSolved from '../components/CaseSolved.jsx';
import { SensorScan, SimBadge } from '../components/ui.jsx';

// Which gas dominates relative to its reference — an observable clue.
function fingerprint(m) {
  const r = GASES.map((g) => ({ g, v: m[g.id] / GAS_REFERENCE[g.id] }));
  const total = r.reduce((a, x) => a + x.v, 0);
  const top = [...r].sort((a, b) => b.v - a.v)[0];
  return { top: top.g, share: top.v / total };
}

function Intake({ caseDef, provider, dispatch }) {
  const [busy, setBusy] = useState(false);
  const measure = async () => {
    setBusy(true);
    const m = await provider.measure({ phase: 'baseline', trial: 0 });
    dispatch({ type: 'BASELINE', measurement: m });
  };
  return (
    <div className="intake fade-in">
      <div className="kicker">CASE #{caseDef.number} · INTAKE</div>
      <h2>{caseDef.title}</h2>
      <p className="lede">{caseDef.description}</p>
      <div className="intake-mission">
        <b>Your mission:</b> find out what changes the signal. The answer is hidden in how the signal responds to
        your experiments — not in any single reading.
      </div>
      {busy ? (
        <SensorScan label="Acquiring baseline sample…" />
      ) : (
        <button className="btn btn-primary btn-pulse" onClick={measure}>
          ▶ TAKE BASELINE MEASUREMENT
        </button>
      )}
    </div>
  );
}

export default function Investigation({ state, dispatch }) {
  const { run } = state;
  const caseDef = CASE_BY_ID[run.caseId];
  const provider = useMemo(() => createMeasurementProvider(run), [run.caseId, run.seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const stats = useMemo(() => hypothesisStats(run), [run]);
  const confidence = useMemo(() => overallConfidence(run), [run]);

  const [tab, setTab] = useState('lab');
  const [active, setActive] = useState(null); // { id, nonce }
  const [reportOpen, setReportOpen] = useState(false);
  const [solvedOpen, setSolvedOpen] = useState(true);

  const pickHypothesis = (h) => dispatch({ type: 'STATE_HYPOTHESIS', hypothesis: h });
  const startExperiment = (id) => {
    setActive({ id, nonce: Date.now() });
    setTab('lab');
  };
  const runNext = (s) => {
    if (run.statedHypothesis !== s.hypothesis) pickHypothesis(s.hypothesis);
    startExperiment(s.experimentId);
  };

  const fp = run.baseline ? fingerprint(run.baseline) : null;
  const solved = run.status === 'solved';

  return (
    <div className="app-shell">
      <TopBar state={state} dispatch={dispatch} caseDef={caseDef} />
      <div className="strip mono">
        <SimBadge />
        <span>This prototype demonstrates experimental reasoning. It is not a medical diagnostic system.</span>
      </div>

      {!run.baseline ? (
        <div className="intake-wrap">
          <Intake caseDef={caseDef} provider={provider} dispatch={dispatch} />
          <div className="intake-hud panel">
            <SignalMeter measurement={null} />
            <GasReadout measurement={null} />
          </div>
        </div>
      ) : (
        <div className="workspace">
          <div className="sidebar">
            <SuspectList run={run} stats={stats} onPick={pickHypothesis} />
            <section className="panel notes">
              <div className="panel-head">
                <h3>📝 Field notes</h3>
              </div>
              <ul>
                {caseDef.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
                {fp && (
                  <li className="obs">
                    Observation: baseline is <b>{fp.top.label}-dominant</b> ({Math.round(fp.share * 100)}% of the VSC
                    index).
                  </li>
                )}
              </ul>
            </section>
          </div>

          <main className="main">
            <nav className="tabs" role="tablist">
              {[
                ['lab', '🔬 Lab'],
                ['board', `🧩 Evidence board${run.experiments.length ? ` · ${run.experiments.length}` : ''}`],
                ['log', '>_ Case log'],
              ].map(([id, label]) => (
                <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
                  {label}
                </button>
              ))}
            </nav>
            <div className="tab-body">
              <div hidden={tab !== 'lab'}>
                {active ? (
                  <ExperimentRunner
                    key={active.nonce}
                    run={run}
                    experimentId={active.id}
                    provider={provider}
                    dispatch={dispatch}
                    onExit={() => setActive(null)}
                    onRunNext={runNext}
                    onOpenBoard={() => setTab('board')}
                  />
                ) : (
                  <ExperimentLab run={run} onPickHypothesis={pickHypothesis} onStart={startExperiment} />
                )}
              </div>
              {tab === 'board' && <EvidenceBoard run={run} caseDef={caseDef} stats={stats} />}
              {tab === 'log' && <CaseLog run={run} />}
            </div>
          </main>

          <SignalHUD run={run} confidence={confidence} onReport={() => setReportOpen(true)} providerName={provider.info.name} />
        </div>
      )}

      {reportOpen && !solved && (
        <ReportModal run={run} caseDef={caseDef} stats={stats} dispatch={dispatch} onClose={() => setReportOpen(false)} />
      )}
      {solved && solvedOpen && (
        <CaseSolved
          run={run}
          caseDef={caseDef}
          stats={stats}
          dispatch={dispatch}
          onClose={() => {
            setSolvedOpen(false);
            setTab('board');
          }}
          onNewRun={() => dispatch({ type: 'START_CASE', caseId: caseDef.id, seed: newSeed() })}
        />
      )}
      {solved && !solvedOpen && (
        <button className="btn btn-primary solved-reopen" onClick={() => setSolvedOpen(true)}>
          🏁 Case solved — view summary
        </button>
      )}
    </div>
  );
}
