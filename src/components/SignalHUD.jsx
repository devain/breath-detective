import { useState } from 'react';
import { GASES, GAS_REFERENCE } from '../data/hypotheses.js';
import { signalLabel } from '../game/caseEngine.js';
import { SegBar, CountUp, ConfidenceChip, SimBadge } from './ui.jsx';

export function SignalMeter({ measurement }) {
  const signal = measurement?.signal;
  const label = signalLabel(signal);
  return (
    <div className={`signal-meter lvl-${label.toLowerCase()}`} style={{ '--glow': (signal ?? 0) / 100 }}>
      <div className="sm-head">
        <span className="kicker">CURRENT SIGNAL</span>
        <span className={`sm-label lvl-chip`}>{label}</span>
      </div>
      <div className="sm-value mono">
        {signal == null ? '—' : <CountUp value={signal} />}
        <small>/100</small>
      </div>
      <SegBar value={(signal ?? 0) / 100} segments={20} tone="signal" label="Signal" />
      {measurement && <div className="sm-src mono">{measurement.label}</div>}
    </div>
  );
}

export function GasReadout({ measurement }) {
  return (
    <div className="gases">
      {GASES.map((g) => {
        const v = measurement?.[g.id];
        return (
          <div className="gas-row" key={g.id} title={`${g.name} · reference ${GAS_REFERENCE[g.id]} ppb`}>
            <span className={`gas-swatch gas-${g.id}`} />
            <span className="gas-label mono">{g.label}</span>
            <span className="gas-track">
              <span
                className={`gas-fill gas-${g.id}`}
                style={{ width: `${Math.min(100, ((v ?? 0) / (GAS_REFERENCE[g.id] * 3)) * 100)}%` }}
              />
              <span className="gas-ref" style={{ left: '33.3%' }} />
            </span>
            <span className="gas-val mono">{v == null ? '—' : <CountUp value={v} />} <small>ppb</small></span>
          </div>
        );
      })}
      <div className="gas-legend mono">┆ marks the reference level</div>
    </div>
  );
}

export function Sparkline({ measurements }) {
  const [hover, setHover] = useState(null);
  const W = 260;
  const H = 74;
  const pad = 6;
  if (measurements.length < 2)
    return <div className="spark-empty mono">Signal history appears after your first experiment.</div>;
  const xs = (i) => pad + (i * (W - pad * 2)) / (measurements.length - 1);
  const ys = (v) => H - pad - (v / 100) * (H - pad * 2);
  const d = measurements.map((m, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)} ${ys(m.signal).toFixed(1)}`).join(' ');
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((x - pad) / (W - pad * 2)) * (measurements.length - 1));
    setHover(Math.max(0, Math.min(measurements.length - 1, i)));
  };
  const hm = hover != null ? measurements[hover] : null;
  return (
    <div className="spark">
      <svg viewBox={`0 0 ${W} ${H}`} onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label="Signal history">
        {[25, 50, 75].map((v) => (
          <line key={v} x1={0} x2={W} y1={ys(v)} y2={ys(v)} className="spark-grid" />
        ))}
        <path d={`${d} L${xs(measurements.length - 1)} ${H} L${xs(0)} ${H} Z`} className="spark-area" />
        <path d={d} className="spark-line" />
        {measurements.map((m, i) => (
          <circle key={i} cx={xs(i)} cy={ys(m.signal)} r={m.phase === 'after' ? 3.2 : 2.2} className={`spark-dot ph-${m.phase}`} />
        ))}
        {hm && <line x1={xs(hover)} x2={xs(hover)} y1={0} y2={H} className="spark-cross" />}
      </svg>
      <div className="spark-tip mono">
        {hm ? (
          <>
            <b>{hm.signal}</b> · {hm.label}
          </>
        ) : (
          <>{measurements.length} samples · hover to inspect</>
        )}
      </div>
    </div>
  );
}

export default function SignalHUD({ run, confidence, onReport, providerName }) {
  const latest = run.measurements.at(-1);
  const canReport = run.experiments.length >= 3 && run.status === 'active';
  return (
    <aside className="hud">
      <section className="panel">
        <SignalMeter measurement={latest} />
        <GasReadout measurement={latest} />
        <div className="hud-src mono">
          <span>src: {providerName}</span>
          <SimBadge />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Signal history</h3>
        </div>
        <Sparkline measurements={run.measurements} />
      </section>

      <section className="panel stats">
        <div className="stat">
          <span className="kicker">EVIDENCE</span>
          <span className="stat-val mono">
            <CountUp value={run.evidenceTotal} /> <small>/ 100</small>
          </span>
          <SegBar value={run.evidenceTotal / 100} tone="accent" label="Evidence" />
        </div>
        <div className="stat-grid">
          <div className="stat">
            <span className="kicker">EXPERIMENTS</span>
            <span className="stat-val mono">{run.experiments.length}</span>
          </div>
          <div className="stat">
            <span className="kicker">CONFIDENCE</span>
            <ConfidenceChip level={run.experiments.length ? confidence : 'Low'} />
          </div>
        </div>
        <button className="btn btn-report" disabled={!canReport} onClick={onReport}>
          📝 FILE CASE REPORT
        </button>
        {!canReport && run.status === 'active' && (
          <div className="hint center">Run at least 3 experiments before filing.</div>
        )}
      </section>
    </aside>
  );
}
