import { EXPERIMENTS } from '../data/experiments.js';
import { HYPOTHESES, HYPOTHESIS_BY_ID } from '../data/hypotheses.js';
import { isUnlocked, unlockHint, timesRun } from '../game/experimentEngine.js';

export default function ExperimentLab({ run, onPickHypothesis, onStart }) {
  const stated = run.statedHypothesis;
  return (
    <div className="lab fade-in">
      <section className="hyp-builder">
        <div className="kicker">FORM A HYPOTHESIS</div>
        <div className="hyp-sentence">
          I suspect the
          <span className="hyp-chips">
            {HYPOTHESES.map((h) => (
              <button
                key={h.id}
                className={`hyp-chip ${stated === h.id ? 'on' : ''}`}
                onClick={() => onPickHypothesis(h.id)}
              >
                {h.icon} {h.name}
              </button>
            ))}
          </span>
          is contributing to the signal.
        </div>
      </section>

      <div className="exp-grid">
        {EXPERIMENTS.map((e, i) => {
          const unlocked = isUnlocked(e, run);
          const h = HYPOTHESIS_BY_ID[e.hypothesis];
          const n = timesRun(run, e.id);
          const isNew = run.unlocked.includes(e.id) && n === 0;
          const matches = stated && stated === e.hypothesis;
          return (
            <button
              key={e.id}
              className={`exp-card ${unlocked ? '' : 'locked'} ${matches ? 'matches' : ''} ${isNew ? 'is-new' : ''}`}
              disabled={!unlocked}
              onClick={() => onStart(e.id)}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="exp-top">
                <span className="exp-name">{unlocked ? '🔬' : '🔒'} {e.name}</span>
                {isNew && <span className="new-tag mono">NEW</span>}
                {n > 0 && <span className="runs mono">×{n}</span>}
              </div>
              <div className="exp-blurb">{unlocked ? e.blurb : unlockHint(e)}</div>
              <div className="exp-foot mono">
                <span>
                  tests {h.icon} {h.name}
                </span>
                {matches && <span className="match ok">✓ your hypothesis</span>}
                {e.specificity < 0.8 && unlocked && <span className="broad">broad</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
