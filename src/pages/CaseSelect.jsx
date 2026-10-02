import { CASES } from '../data/cases.js';
import { ACHIEVEMENTS, RANKS } from '../data/progression.js';
import { rankFor } from '../game/scoringEngine.js';
import { newSeed } from '../game/rng.js';
import TopBar from '../components/TopBar.jsx';

export default function CaseSelect({ state, dispatch }) {
  const { profile, run } = state;
  const { rank, next, progress } = rankFor(profile.xp);
  const activeId = run?.status === 'active' ? run.caseId : null;

  const open = (c) => {
    if (activeId === c.id) return dispatch({ type: 'NAVIGATE', screen: 'investigation' });
    if (activeId && !window.confirm('Abandon the current investigation and open this case?')) return;
    dispatch({ type: 'START_CASE', caseId: c.id, seed: newSeed() });
  };

  return (
    <div className="app-shell">
      <TopBar state={state} dispatch={dispatch} />
      <div className="cases-page">
        <section>
          <div className="kicker">CASE FILES</div>
          <h1 className="page-title">Choose an investigation</h1>
          <div className="case-grid">
            {CASES.map((c, i) => {
              const locked = i > 0 && !profile.solved[CASES[i - 1].id];
              const solved = profile.solved[c.id];
              const inProgress = activeId === c.id;
              return (
                <button
                  key={c.id}
                  className={`case-file ${locked ? 'locked' : ''} ${solved ? 'solved' : ''}`}
                  disabled={locked}
                  onClick={() => open(c)}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="cf-tab mono">#{c.number}</div>
                  <div className="cf-title">{locked ? '🔒 Classified' : c.title}</div>
                  <div className="cf-teaser">{locked ? `Solve case #${CASES[i - 1].number} to unlock.` : `“${c.teaser}”`}</div>
                  <div className="cf-foot mono">
                    {solved && <span className={`grade-chip grade-${solved.grade}`}>SOLVED · {solved.grade}</span>}
                    {inProgress && <span className="chip chip-conf-medium">IN PROGRESS</span>}
                    {!locked && !solved && !inProgress && <span className="dimtext">open</span>}
                    {solved && !inProgress && <span className="dimtext">replay ↻</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="disclaimer">Fictional, simulated scenarios — not real medical cases.</p>
        </section>

        <aside className="profile panel">
          <div className="kicker">DETECTIVE PROFILE</div>
          <div className="profile-rank">
            <span className="profile-rank-icon">{rank.icon}</span>
            <div>
              <div className="profile-rank-name">{rank.name}</div>
              <div className="mono dimtext">
                {profile.xp} XP {next ? `· ${next.xp - profile.xp} to ${next.name}` : '· max rank'}
              </div>
            </div>
          </div>
          <div className="xpbar big">
            <span style={{ width: `${progress * 100}%` }} />
          </div>
          <ol className="rank-ladder mono">
            {RANKS.map((r) => (
              <li key={r.id} className={profile.xp >= r.xp ? 'reached' : ''}>
                {r.icon} {r.name} <span>{r.xp}</span>
              </li>
            ))}
          </ol>
          <div className="kicker" style={{ marginTop: 18 }}>
            ACHIEVEMENTS · {Object.keys(profile.achievements).length}/{ACHIEVEMENTS.length}
          </div>
          <div className="ach-grid">
            {ACHIEVEMENTS.map((a) => (
              <div key={a.id} className={`ach ${profile.achievements[a.id] ? 'got' : ''}`} title={a.desc}>
                <span className="ach-icon">{a.icon}</span>
                <div>
                  <div className="ach-name">{a.name}</div>
                  <div className="ach-desc">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="btn-ghost danger"
            onClick={() => window.confirm('Reset all XP, achievements and case progress?') && dispatch({ type: 'RESET_PROFILE' })}
          >
            Reset progress
          </button>
        </aside>
      </div>
    </div>
  );
}
