import { HYPOTHESES } from '../data/hypotheses.js';
import { EXPERIMENT_BY_ID } from '../data/experiments.js';

const W = 1000;
const NODE_W = 172;
const HYP_Y = 196;
const HYP_H = 78;
const CARD_Y0 = 318;
const CARD_H = 70;
const GAP = 90;
const colX = (i) => 100 + i * 200;

const STATUS_LABEL = {
  unknown: 'UNTESTED',
  supported: 'SUPPORTED',
  unsupported: 'LOW SUPPORT',
  conflicting: 'CONFLICTING',
};

function Segment({ x1, y1, x2, y2, cls = '', width = 1.6 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} className={`str draw ${cls}`} strokeWidth={width} pathLength="1" />;
}

export default function EvidenceBoard({ run, caseDef, stats }) {
  const byHyp = Object.fromEntries(HYPOTHESES.map((h) => [h.id, run.experiments.filter((r) => r.hypothesis === h.id)]));
  const maxCards = Math.max(1, ...Object.values(byHyp).map((a) => a.length));
  const H = Math.max(440, CARD_Y0 + maxCards * GAP + 10);
  const baseline = run.baseline?.signal;

  return (
    <div className="board fade-in">
      <div className="board-head">
        <div>
          <div className="kicker">EVIDENCE BOARD</div>
          <h2>Case #{caseDef.number} · {caseDef.title}</h2>
        </div>
        <div className="board-legend mono">
          <span><i className="lg-strong" /> strong</span>
          <span><i className="lg-moderate" /> moderate</span>
          <span><i className="lg-weak" /> weak</span>
          <span className="dimtext">string weight = evidence</span>
        </div>
      </div>
      <div className="board-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} className="board-svg" role="img" aria-label="Evidence board">
          <defs>
            <pattern id="cork" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" className="cork-dot" />
            </pattern>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width={W} height={H} fill="url(#cork)" />

          {/* root */}
          <g className="bnode node-case pop">
            <rect x={W / 2 - 100} y={14} width={200} height={50} rx={10} />
            <text x={W / 2} y={36} className="t-kicker">CASE #{caseDef.number}</text>
            <text x={W / 2} y={54} className="t-main">{caseDef.title}</text>
          </g>
          <Segment x1={W / 2} y1={64} x2={W / 2} y2={90} />
          <g className="bnode node-signal pop">
            <rect x={W / 2 - 90} y={90} width={180} height={48} rx={10} />
            <text x={W / 2} y={110} className="t-kicker">BREATH SIGNAL</text>
            <text x={W / 2} y={128} className="t-main mono">{baseline != null ? `${baseline} / 100` : '???'}</text>
          </g>
          <Segment x1={W / 2} y1={138} x2={W / 2} y2={162} />
          <Segment x1={colX(0)} y1={162} x2={colX(4)} y2={162} />

          {HYPOTHESES.map((h, i) => {
            const s = stats[h.id];
            const x = colX(i);
            const tests = byHyp[h.id];
            const weight = s.n ? 1.4 + (s.evidencePct / 100) * 4.5 : 1.2;
            const lead = s.status === 'supported' && s.evidencePct >= 40;
            return (
              <g key={h.id}>
                <Segment x1={x} y1={162} x2={x} y2={HYP_Y} cls={s.n ? `st-${s.status}` : 'st-unknown'} width={weight} />
                <g className={`bnode node-hyp st-${s.status} ${lead ? 'lead' : ''}`}>
                  {lead && <rect x={x - NODE_W / 2} y={HYP_Y} width={NODE_W} height={HYP_H} rx={12} className="halo" filter="url(#glow)" />}
                  <rect x={x - NODE_W / 2} y={HYP_Y} width={NODE_W} height={HYP_H} rx={12} />
                  <text x={x} y={HYP_Y + 24} className="t-main">{h.icon} {h.name.toUpperCase()}</text>
                  <text x={x} y={HYP_Y + 50} className="t-big mono">{s.n ? `${s.evidencePct}%` : '???'}</text>
                  <text x={x} y={HYP_Y + 68} className="t-kicker">
                    {STATUS_LABEL[s.status]}
                    {s.confidence ? ` · ${s.confidence.toUpperCase()}` : ''}
                  </text>
                </g>
                {run.patterns[h.id] && (
                  <text x={x + NODE_W / 2 - 14} y={HYP_Y + 18} className="t-pin">
                    {run.patterns[h.id] === 'supported' ? '🧩' : '🚫'}
                  </text>
                )}
                {tests.map((r, j) => {
                  const y = CARD_Y0 + j * GAP;
                  const exp = EXPERIMENT_BY_ID[r.experimentId];
                  const pct = Math.round(r.responsePct * 100);
                  return (
                    <g key={r.id}>
                      <Segment x1={x} y1={j ? y - GAP + CARD_H : HYP_Y + HYP_H} x2={x} y2={y} cls={`st-${r.strength}`} width={r.strength === 'strong' ? 3 : 1.6} />
                      <g className={`bnode card s-${r.strength} pop`}>
                        <rect x={x - NODE_W / 2 + 6} y={y} width={NODE_W - 12} height={CARD_H} rx={8} />
                        <circle cx={x} cy={y} r={5} className="pin" />
                        <text x={x} y={y + 22} className="t-small">#{r.trial} {exp.name}</text>
                        <text x={x} y={y + 45} className="t-big mono">{pct > 0 ? '+' : ''}{pct}%</text>
                        <text x={x} y={y + 61} className="t-kicker">
                          {r.strength.toUpperCase()}
                          {r.contradicts ? ' · ⚠ CONFLICT' : ''}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      {!run.experiments.length && (
        <div className="board-empty">No evidence pinned yet. Run an experiment and its result card will appear here.</div>
      )}
    </div>
  );
}
