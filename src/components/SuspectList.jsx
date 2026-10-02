import { HYPOTHESES } from '../data/hypotheses.js';
import { SegBar, ConfidenceChip } from './ui.jsx';

const STATUS_TEXT = {
  supported: 'evidence supports',
  unsupported: 'low support',
  conflicting: 'conflicting results',
};

export default function SuspectList({ run, stats, onPick }) {
  return (
    <section className="panel suspects">
      <div className="panel-head">
        <h3>Known suspects</h3>
        <span className="hint">click to hypothesise</span>
      </div>
      <ul>
        {HYPOTHESES.map((h) => {
          const s = stats[h.id];
          const stated = run.statedHypothesis === h.id;
          const pattern = run.patterns[h.id];
          return (
            <li key={h.id}>
              <button
                className={`suspect status-${s.status} ${stated ? 'is-stated' : ''}`}
                onClick={() => onPick(h.id)}
                aria-pressed={stated}
              >
                <div className="suspect-row">
                  <span className="suspect-icon">{h.icon}</span>
                  <span className="suspect-name">{h.name}</span>
                  {pattern && <span className={`pattern-tag pattern-${pattern}`}>{pattern === 'supported' ? '🧩' : '🚫'}</span>}
                  <span className="suspect-val mono">{s.n ? `${s.evidencePct}%` : '???'}</span>
                </div>
                {s.n ? (
                  <>
                    <SegBar
                      value={s.evidencePct / 100}
                      tone={s.status === 'supported' ? 'accent' : s.status === 'conflicting' ? 'violet' : 'muted'}
                      size="sm"
                      label={`${h.name} evidence`}
                    />
                    <div className="suspect-meta">
                      <ConfidenceChip level={s.confidence} />
                      <span className="mono counts" title="supporting / contradicting experiments">
                        ▲{s.supporting} ▼{s.contradicting}
                      </span>
                      <span className="status-text">{STATUS_TEXT[s.status]}</span>
                    </div>
                  </>
                ) : (
                  <div className="suspect-unknown mono">untested</div>
                )}
                {stated && <div className="stated-flag mono">◂ your hypothesis</div>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
