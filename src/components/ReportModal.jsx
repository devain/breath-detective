import { useState } from 'react';
import { HYPOTHESES, HYPOTHESIS_BY_ID } from '../data/hypotheses.js';
import { ConfidenceChip } from './ui.jsx';

export default function ReportModal({ run, caseDef, stats, dispatch, onClose }) {
  const [primary, setPrimary] = useState(null);
  const [secondary, setSecondary] = useState(null);
  const need2 = !!caseDef.requireSecondary;
  const rejected = run.lastRejected;
  const valid = primary && (!need2 || (secondary && secondary !== primary));

  const submit = () => dispatch({ type: 'FILE_REPORT', primary, secondary });

  const row = (h, sel, set, other) => {
    const s = stats[h.id];
    return (
      <button
        key={h.id}
        className={`report-opt ${sel === h.id ? 'on' : ''}`}
        disabled={other === h.id}
        onClick={() => set(sel === h.id ? null : h.id)}
      >
        <span>{h.icon} {h.name}</span>
        <span className="mono">{s.n ? `${s.evidencePct}%` : '???'}</span>
        <ConfidenceChip level={s.confidence} />
      </button>
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal report" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="File case report">
        <div className="kicker">CASE #{caseDef.number} · FILE REPORT</div>
        <h2>What does the evidence point to?</h2>
        <p className="dimtext">
          Name the suspect your experiments suggest is the <b>main contributor</b> to the simulated signal.
          {need2 ? ' This case needs a secondary contributor too.' : ' A secondary suspect is optional.'}
        </p>

        <div className="report-cols">
          <div>
            <div className="kicker">PRIMARY SUSPECT</div>
            {HYPOTHESES.map((h) => row(h, primary, setPrimary, secondary))}
          </div>
          <div>
            <div className="kicker">SECONDARY {need2 ? '(REQUIRED)' : '(OPTIONAL)'}</div>
            {HYPOTHESES.map((h) => row(h, secondary, setSecondary, primary))}
          </div>
        </div>

        {rejected && (
          <div className="rejected fade-in" key={rejected.at}>
            🗂️ Report #{run.reportAttempts} rejected: “{[rejected.primary, rejected.secondary].filter(Boolean).map((h) => HYPOTHESIS_BY_ID[h].name).join(' + ')}”
            doesn’t match the simulated case model. Look for suspects you haven’t tested, or replicate shaky results.
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>Keep investigating</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}>
            SUBMIT REPORT
          </button>
        </div>
        <div className="fineprint">Simulated game scenario. Not a medical assessment.</div>
      </div>
    </div>
  );
}
