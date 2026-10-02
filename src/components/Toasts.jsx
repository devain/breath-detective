import { useEffect } from 'react';
import { ACHIEVEMENT_BY_ID } from '../data/progression.js';
import { EXPERIMENT_BY_ID } from '../data/experiments.js';
import { HYPOTHESIS_BY_ID } from '../data/hypotheses.js';

function Toast({ ev, dispatch }) {
  const ttl = ev.type === 'xp' ? 2400 : 5000;
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: 'DISMISS_EVENT', id: ev.id }), ttl);
    return () => clearTimeout(t);
  }, [ev.id, ttl, dispatch]);

  const dismiss = () => dispatch({ type: 'DISMISS_EVENT', id: ev.id });

  if (ev.type === 'xp')
    return (
      <div className="toast toast-xp" onClick={dismiss}>
        <b className="mono">+{ev.amount} XP</b> <span>{ev.reason}</span>
      </div>
    );

  let icon, kicker, title, body;
  if (ev.type === 'achievement') {
    const a = ACHIEVEMENT_BY_ID[ev.achievementId];
    [icon, kicker, title, body] = [a.icon, 'ACHIEVEMENT UNLOCKED', a.name, a.desc];
  } else if (ev.type === 'pattern') {
    const h = HYPOTHESIS_BY_ID[ev.hypothesis];
    icon = '🧩';
    kicker = 'PATTERN DISCOVERED';
    title = ev.kind === 'supported' ? `${h.icon} ${h.name} responds consistently` : `${h.icon} ${h.name} stays quiet`;
    body = ev.kind === 'supported' ? 'Multiple runs agree. Evidence supports this hypothesis.' : 'Repeated weak responses. Likely not a major contributor in this case.';
  } else if (ev.type === 'unlock') {
    const e = EXPERIMENT_BY_ID[ev.experimentId];
    [icon, kicker, title, body] = ['🔓', 'NEW TEST UNLOCKED', e.name, e.blurb];
  } else if (ev.type === 'rank') {
    [icon, kicker, title, body] = [ev.rank.icon, 'RANK UP', ev.rank.name, 'Your investigation skills are improving.'];
  } else if (ev.type === 'rejected') {
    [icon, kicker, title, body] = ['🗂️', 'REPORT REJECTED', 'The case model disagrees', 'Gather more evidence and try again.'];
  } else return null;

  return (
    <div className={`toast toast-${ev.type}`} onClick={dismiss} role="status">
      <div className="toast-icon">{icon}</div>
      <div>
        <div className="toast-kicker mono">{kicker}</div>
        <div className="toast-title">{title}</div>
        <div className="toast-body">{body}</div>
      </div>
    </div>
  );
}

export default function Toasts({ events, dispatch }) {
  return (
    <div className="toasts" aria-live="polite">
      {events.map((ev) => (
        <Toast key={ev.id} ev={ev} dispatch={dispatch} />
      ))}
    </div>
  );
}
