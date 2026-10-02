import { useMemo } from 'react';
import { useCountUp } from '../hooks/useGame.js';

const clamp01 = (x) => Math.max(0, Math.min(1, x || 0));

export function SegBar({ value, segments = 10, tone = 'accent', label, size = 'md' }) {
  const filled = Math.round(clamp01(value) * segments);
  return (
    <div
      className={`segbar segbar-${size} tone-${tone}`}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamp01(value) * 100)}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className={i < filled ? 'on' : ''} style={{ '--i': i }} />
      ))}
    </div>
  );
}

export function CountUp({ value, decimals = 0, prefix = '', suffix = '', duration }) {
  const v = useCountUp(value, duration);
  return (
    <>
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </>
  );
}

export function Pct({ value, signed = true }) {
  const v = useCountUp(value * 100);
  const r = Math.round(v);
  return <>{signed && r > 0 ? '+' : ''}{r}%</>;
}

export function ConfidenceChip({ level }) {
  if (!level) return <span className="chip chip-none">—</span>;
  return <span className={`chip chip-conf-${level.toLowerCase()}`}>{level.toUpperCase()}</span>;
}

export function StrengthBadge({ strength, big }) {
  const label = { strong: 'STRONG', moderate: 'MODERATE', weak: 'WEAK' }[strength];
  return <span className={`badge badge-${strength} ${big ? 'badge-big' : ''}`}>{label}{big ? ' RESPONSE' : ''}</span>;
}

export function SimBadge() {
  return <span className="sim-badge">SIMULATED DATA — PROTOTYPE</span>;
}

// Particle burst for strong results.
export function Burst({ count = 22 }) {
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        a: (360 / count) * i + Math.random() * 12,
        d: 60 + Math.random() * 90,
        s: 3 + Math.random() * 4,
        delay: Math.random() * 120,
      })),
    [count],
  );
  return (
    <div className="burst" aria-hidden="true">
      {parts.map((p, i) => (
        <span
          key={i}
          style={{ '--a': `${p.a}deg`, '--d': `${p.d}px`, '--s': `${p.s}px`, animationDelay: `${p.delay}ms` }}
        />
      ))}
    </div>
  );
}

export function SensorScan({ label, durationMs = 1400 }) {
  return (
    <div className="scan">
      <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="scan-wave" aria-hidden="true">
        <path d="M0 30 Q 15 5 30 30 T 60 30 T 90 30 T 120 30 T 150 30 T 180 30 T 210 30 T 240 30 T 270 30 T 300 30" />
        <path className="alt" d="M0 30 Q 10 50 20 30 T 40 30 T 60 30 T 80 30 T 100 30 T 120 30 T 140 30 T 160 30 T 180 30 T 200 30 T 220 30 T 240 30 T 260 30 T 280 30 T 300 30" />
      </svg>
      <div className="scan-label mono">
        <span className="blink">●</span> {label}
      </div>
      <div className="scan-progress">
        <span style={{ animationDuration: `${durationMs}ms` }} />
      </div>
    </div>
  );
}
