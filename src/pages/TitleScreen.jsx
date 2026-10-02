import { useEffect, useState } from 'react';
import { CASES, CASE_BY_ID } from '../data/cases.js';
import { newSeed } from '../game/rng.js';

function useTyped(text, speed = 55) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(t), v) : v + 1)), speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return text.slice(0, n);
}

export default function TitleScreen({ state, dispatch }) {
  const active = state.run?.status === 'active' ? state.run : null;
  const firstTime = !active && !Object.keys(state.profile.solved).length && state.profile.totalExperiments === 0;
  const nextCase = active ? CASE_BY_ID[active.caseId] : CASES.find((c) => !state.profile.solved[c.id]) ?? CASES[0];
  const typed = useTyped(`“${nextCase.teaser}”`);

  const start = () => {
    if (active) dispatch({ type: 'NAVIGATE', screen: 'investigation' });
    else if (firstTime) dispatch({ type: 'START_CASE', caseId: CASES[0].id, seed: newSeed() });
    else dispatch({ type: 'NAVIGATE', screen: 'cases' });
  };

  return (
    <div className="title-screen">
      <div className="title-grid" aria-hidden="true" />
      <div className="title-orb" aria-hidden="true" />
      <button className="icon-btn title-theme" onClick={() => dispatch({ type: 'TOGGLE_THEME' })} title="Toggle theme">
        {state.theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <main className="title-card">
        <div className="title-bug">🐛</div>
        <h1 className="glitch" data-text="BREATH DETECTIVE">BREATH DETECTIVE</h1>
        <p className="tagline mono">Debug the mystery. Find the signal.</p>

        <div className="title-case">
          <div className="kicker">CASE #{nextCase.number}</div>
          <div className="typed mono">
            {typed}
            <span className="blink">▌</span>
          </div>
          <p>{firstTime ? 'A mysterious breath profile has been detected.' : nextCase.description}</p>
          <p className="mission">
            <b>Your mission:</b> find out what changes the signal.
          </p>
        </div>

        <button className="btn btn-hero" onClick={start}>
          {active ? '[ RESUME INVESTIGATION ]' : '[ START INVESTIGATION ]'}
        </button>
        {!firstTime && (
          <button className="btn-ghost" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'cases' })}>
            🗂️ Case files
          </button>
        )}

        <p className="disclaimer">
          This prototype demonstrates experimental reasoning. It is not a medical diagnostic system.
          All cases and data are simulated.
        </p>
      </main>
    </div>
  );
}
