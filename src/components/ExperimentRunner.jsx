import { useEffect, useRef, useState } from 'react';
import { EXPERIMENT_BY_ID } from '../data/experiments.js';
import { HYPOTHESIS_BY_ID, GASES } from '../data/hypotheses.js';
import { flavorText, isUnlocked } from '../game/experimentEngine.js';
import { suggestNextTests } from '../game/evidenceEngine.js';
import { StrengthBadge, Pct, Burst, SensorScan, CountUp } from './ui.jsx';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function Reading({ m, title, dim }) {
  return (
    <div className={`reading ${dim ? 'dim' : ''}`}>
      <div className="kicker">{title}</div>
      <div className="reading-signal mono">
        <CountUp value={m.signal} />
        <small>/100</small>
      </div>
      <div className="reading-gases mono">
        {GASES.map((g) => (
          <div key={g.id}>
            <span className={`gas-swatch gas-${g.id}`} />
            {g.label} <b>{m[g.id]}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function GasCompare({ before, after }) {
  const max = Math.max(...GASES.flatMap((g) => [before[g.id], after[g.id]]), 1);
  return (
    <div className="gascmp">
      <div className="gascmp-legend mono">
        <span><i className="lg-before" /> before</span>
        <span><i className="lg-after" /> after</span>
      </div>
      {GASES.map((g) => {
        const delta = before[g.id] ? (after[g.id] - before[g.id]) / before[g.id] : 0;
        return (
          <div className="gascmp-row" key={g.id}>
            <span className="gas-label mono">{g.label}</span>
            <div className="gascmp-bars">
              <div className="gascmp-bar before" style={{ width: `${(before[g.id] / max) * 100}%` }} title={`Before: ${before[g.id]} ppb`}>
                <span className="mono">{before[g.id]}</span>
              </div>
              <div className={`gascmp-bar after gas-${g.id}`} style={{ width: `${(after[g.id] / max) * 100}%` }} title={`After: ${after[g.id]} ppb`}>
                <span className="mono">{after[g.id]}</span>
              </div>
            </div>
            <span className={`gascmp-delta mono ${delta < 0 ? 'down' : 'up'}`}>
              {delta > 0 ? '+' : ''}
              {Math.round(delta * 100)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

function verdictLine(record) {
  const h = HYPOTHESIS_BY_ID[record.hypothesis];
  if (!record.stated) return `This test probed the ${h.name.toLowerCase()} suspect.`;
  const yours = HYPOTHESIS_BY_ID[record.stated];
  if (record.stated !== record.hypothesis)
    return `This test targeted ${h.name}, not your hypothesis (${yours.name}). Useful for ruling things in or out.`;
  if (record.strength === 'weak') return `Your hypothesis (${yours.name}): this result does not support it.`;
  if (record.strength === 'moderate') return `Your hypothesis (${yours.name}): partial support. Worth a follow-up.`;
  return `Your hypothesis (${yours.name}): evidence supports it — for now.`;
}

export default function ExperimentRunner({ run, experimentId, provider, dispatch, onExit, onRunNext, onOpenBoard }) {
  const exp = EXPERIMENT_BY_ID[experimentId];
  const hyp = HYPOTHESIS_BY_ID[exp.hypothesis];
  const [stage, setStage] = useState('brief');
  const [before, setBefore] = useState(null);
  const [trial, setTrial] = useState(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const record = trial ? run.experiments.find((r) => r.trial === trial) : null;
  const busy = stage.startsWith('measuring') || stage === 'acting';

  async function measureBefore() {
    const t = run.experiments.length + 1;
    setTrial(t);
    setStage('measuring-before');
    const m = await provider.measure({ phase: 'before', experiment: exp, trial: t });
    if (!alive.current) return;
    setBefore(m);
    setStage('ready');
  }

  async function doAction() {
    setStage('acting');
    await sleep(1300);
    if (!alive.current) return;
    setStage('measuring-after');
    const after = await provider.measure({ phase: 'after', experiment: exp, trial });
    if (!alive.current) return;
    dispatch({ type: 'RECORD_TRIAL', experimentId: exp.id, before, after });
    setStage('result');
  }

  const steps = ['MEASURE', 'ACT', 'MEASURE AGAIN', 'COMPARE'];
  const stepIdx = { brief: 0, 'measuring-before': 0, ready: 1, acting: 1, 'measuring-after': 2, result: 3 }[stage];

  return (
    <div className={`runner stage-${stage}`}>
      <div className="runner-head">
        <button className="btn-ghost" onClick={onExit} disabled={busy}>
          ← Lab
        </button>
        <div>
          <div className="kicker">EXPERIMENT · TRIAL #{trial ?? run.experiments.length + 1}</div>
          <h2>🔬 {exp.name}</h2>
        </div>
        <span className="runner-tests mono">
          tests {hyp.icon} {hyp.name}
        </span>
      </div>

      <ol className="steps mono">
        {steps.map((s, i) => (
          <li key={s} className={i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''}>
            <span>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      {stage === 'brief' && (
        <div className="runner-brief fade-in">
          <p className="lede">{exp.blurb}</p>
          <div className="hyp-callout">
            {run.statedHypothesis ? (
              <>
                <span className="kicker">YOUR HYPOTHESIS</span>
                <div>
                  “I suspect {HYPOTHESIS_BY_ID[run.statedHypothesis].statement}.”
                  {run.statedHypothesis === exp.hypothesis ? (
                    <span className="match ok"> ✓ this test checks it</span>
                  ) : (
                    <span className="match"> ↯ this test checks {hyp.name} instead</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <span className="kicker">NO HYPOTHESIS STATED</span>
                <div>Pick a suspect on the left first — hypothesis-driven tests earn bonus XP.</div>
              </>
            )}
          </div>
          {exp.specificity < 0.8 && <div className="warn-note">⚠ Broad test — it may affect more than one suspect.</div>}
          <button className="btn btn-primary" onClick={measureBefore}>
            ▶ TAKE “BEFORE” MEASUREMENT
          </button>
        </div>
      )}

      {stage === 'measuring-before' && <SensorScan label="Sampling breath — before" />}

      {(stage === 'ready' || stage === 'acting' || stage === 'measuring-after') && before && (
        <div className="runner-mid fade-in">
          <Reading m={before} title="BEFORE" />
          <div className="runner-action">
            {stage === 'ready' && (
              <button className="btn btn-action" onClick={doAction}>
                [ {exp.action} ]
              </button>
            )}
            {stage === 'acting' && <SensorScan label={exp.working} durationMs={1300} />}
            {stage === 'measuring-after' && <SensorScan label="Sampling breath — after" />}
          </div>
        </div>
      )}

      {stage === 'result' && record && (
        <div className="runner-result fade-in">
          <div className="result-grid">
            <Reading m={record.before} title="BEFORE" dim />
            <div className="result-arrow mono">→</div>
            <Reading m={record.after} title="AFTER" />
            <div className={`response-card resp-${record.strength}`}>
              {record.strength === 'strong' && <Burst key={record.id} />}
              <div className="kicker">RESPONSE · VSC INDEX</div>
              <div className="response-pct mono">
                <Pct value={record.responsePct} />
              </div>
              <StrengthBadge strength={record.strength} big />
              <div className="evidence-gain mono">
                Evidence gained <b>+{record.points}</b>
                {record.repeatIndex > 0 && <span className="dimtext"> (repeat ×{record.repeatIndex + 1})</span>}
              </div>
            </div>
          </div>

          <GasCompare before={record.before} after={record.after} />

          <div className={`flavor ${record.contradicts ? 'flavor-warn' : ''}`}>
            <span className="flavor-q">“</span>
            {flavorText(record)}
            <div className="verdict">{verdictLine(record)}</div>
          </div>

          <NextTests run={run} record={record} onRunNext={onRunNext} />

          <div className="result-actions">
            <button className="btn-ghost" onClick={onExit}>← Back to lab</button>
            <button className="btn-ghost" onClick={onOpenBoard}>🧩 Open evidence board</button>
          </div>
        </div>
      )}
    </div>
  );
}

function NextTests({ run, record, onRunNext }) {
  const suggestions = suggestNextTests(run, record, { isUnlocked, newlyUnlocked: run.lastUnlocked ?? [] });
  if (!suggestions.length) return null;
  return (
    <section className="next-tests">
      <h3>🧠 WHAT SHOULD WE TEST NEXT?</h3>
      <div className="next-grid">
        {suggestions.map((s, i) => {
          const exp = EXPERIMENT_BY_ID[s.experimentId];
          const h = HYPOTHESIS_BY_ID[s.hypothesis];
          return (
            <article className="next-card" key={s.experimentId} style={{ animationDelay: `${i * 90}ms` }}>
              <div className="next-opt mono">OPTION {'ABC'[i]}</div>
              <div className="next-title">
                {h.icon} {s.title}
              </div>
              <div className="next-exp mono">🔬 {exp.name}</div>
              <p className="next-why">
                <span className="kicker">WHY</span> {s.why}
              </p>
              <button className="btn btn-small" onClick={() => onRunNext(s)}>
                [ RUN TEST ]
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
