import { rankFor } from '../game/scoringEngine.js';

export default function TopBar({ state, dispatch, caseDef }) {
  const { rank, next, progress } = rankFor(state.profile.xp);
  return (
    <header className="topbar">
      <button className="logo" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'title' })}>
        <span className="logo-bug">🐛</span>
        <span className="logo-text">Breath<b>Detective</b></span>
      </button>
      {caseDef && (
        <div className="crumbs mono">
          <span className="crumb-dim">cases /</span> CASE #{caseDef.number} <span className="crumb-dim">·</span>{' '}
          <span className="crumb-title">{caseDef.title}</span>
        </div>
      )}
      <div className="topbar-right">
        <div className="rank" title={next ? `${next.xp - state.profile.xp} XP to ${next.name}` : 'Max rank'}>
          <span className="rank-icon">{rank.icon}</span>
          <div className="rank-body">
            <div className="rank-name">{rank.name}</div>
            <div className="xpbar">
              <span style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="rank-xp mono">
              {state.profile.xp} {next ? `/ ${next.xp}` : ''} XP
            </div>
          </div>
        </div>
        <button className="icon-btn" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'cases' })} title="Case files">
          🗂️
        </button>
        <button className="icon-btn" onClick={() => dispatch({ type: 'TOGGLE_THEME' })} title="Toggle theme">
          {state.theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
