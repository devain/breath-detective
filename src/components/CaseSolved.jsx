import { HYPOTHESES, HYPOTHESIS_BY_ID } from '../data/hypotheses.js';
import { caseSolution } from '../game/caseEngine.js';
import { CASES } from '../data/cases.js';
import { SegBar, Pct, Burst } from './ui.jsx';

export default function CaseSolved({ run, caseDef, stats, dispatch, onClose, onNewRun }) {
  const r = run.result;
  const sol = caseSolution(run);
  const shares = Object.fromEntries(sol.ranked);
  const idx = CASES.findIndex((c) => c.id === caseDef.id);
  const next = CASES[idx + 1];
  const q = [
    ['Hypothesis testing', r.quality.hypothesisTesting],
    ['Evidence coverage', r.quality.evidenceCoverage],
    ['Experiment efficiency', r.quality.efficiency],
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal solved" role="dialog" aria-label="Case solved">
        <Burst count={30} />
        <div className="stamp">CASE SOLVED</div>
        <div className="kicker">CASE #{caseDef.number} · {caseDef.title}</div>

        <div className="solved-grid">
          <section>
            <h3>Your investigation</h3>
            <dl className="facts mono">
              <dt>Experiments</dt><dd>{r.experiments}</dd>
              <dt>Evidence collected</dt><dd>{r.evidence}</dd>
              <dt>Conclusion</dt>
              <dd>{[r.primary, r.secondary].filter(Boolean).map((h) => `${HYPOTHESIS_BY_ID[h].icon} ${HYPOTHESIS_BY_ID[h].name}`).join(' + ')}</dd>
              <dt>Strongest response</dt>
              <dd>{r.strongest ? <>{r.strongest.name} (<Pct value={r.strongest.pct} />)</> : '—'}</dd>
              <dt>Alternative tested</dt><dd>{r.alternative ?? 'none'}</dd>
              <dt>Confidence</dt><dd>{r.confidence}</dd>
              <dt>Reports filed</dt><dd>{run.reportAttempts}</dd>
              <dt>XP this case</dt><dd>+{run.xpEarned}</dd>
            </dl>
          </section>

          <section>
            <h3>🔬 Investigation quality</h3>
            {q.map(([label, v]) => (
              <div className="quality-row" key={label}>
                <span>{label}</span>
                <SegBar value={v} label={label} />
                <span className="mono">{Math.round(v * 100)}</span>
              </div>
            ))}
            <div className={`grade grade-${r.grade}`}>
              <span className="mono">{r.grade}</span>
              <small>process grade</small>
            </div>
            <p className="fineprint">Scores your experimental reasoning in this game. It is not medical accuracy.</p>
          </section>
        </div>

        <section className="declassified">
          <h3>🗂️ Declassified: simulated case model</h3>
          <p className="dimtext">Your evidence estimates vs. the hidden parameters of this fictional case.</p>
          <div className="declass-grid">
            {HYPOTHESES.map((h) => (
              <div className="declass-row" key={h.id}>
                <span>{h.icon} {h.name}</span>
                <div className="declass-bars">
                  <div className="db-you" style={{ width: `${stats[h.id].evidencePct ?? 0}%` }} title="Your evidence estimate" />
                  <div className="db-true" style={{ width: `${Math.round(shares[h.id] * 100)}%` }} title="Simulated share" />
                </div>
                <span className="mono">
                  {stats[h.id].n ? `${stats[h.id].evidencePct}%` : '—'} / {Math.round(shares[h.id] * 100)}%
                </span>
              </div>
            ))}
            <div className="declass-legend mono">
              <span><i className="lg-you" /> your estimate</span>
              <span><i className="lg-true" /> simulated share</span>
            </div>
          </div>
        </section>

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>Review board</button>
          <button className="btn-ghost" onClick={onNewRun}>↻ Replay (new seed)</button>
          {next ? (
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'cases' })}>
              NEXT CASE: #{next.number} →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'cases' })}>
              CASE FILES →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
