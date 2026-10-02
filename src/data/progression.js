export const XP = {
  firstMeasurement: 10,
  experiment: 20,
  strongResponse: 30,
  pattern: 50,
  hypothesisDriven: 5,
  completeCase: 100,
  gradeBonus: { S: 100, A: 60, B: 30, C: 0 },
};

export const RANKS = [
  { id: 'rookie', icon: '🔰', name: 'Rookie Debugger', xp: 0 },
  { id: 'detective', icon: '🔎', name: 'Breath Detective', xp: 150 },
  { id: 'lab', icon: '🧪', name: 'Lab Investigator', xp: 450 },
  { id: 'pattern', icon: '🧠', name: 'Pattern Hunter', xp: 900 },
  { id: 'master', icon: '🏆', name: 'Master Debugger', xp: 1500 },
];

export const ACHIEVEMENTS = [
  { id: 'first_signal', icon: '🔍', name: 'First Signal', desc: 'Take your first measurement.' },
  { id: 'experimenter', icon: '🧪', name: 'Experimenter', desc: 'Run 5 experiments.' },
  { id: 'tongue_detective', icon: '👅', name: 'Tongue Detective', desc: 'Discover a strong tongue-related response.' },
  { id: 'pattern_hunter', icon: '🧩', name: 'Pattern Hunter', desc: 'Test 3 different hypotheses in one case.' },
  { id: 'replicator', icon: '♻️', name: 'Replicator', desc: 'Replicate a strong response.' },
  { id: 'null_result', icon: '🚫', name: 'Null Result', desc: 'Clear a suspect with consistent weak responses.' },
  { id: 'bug_hunter', icon: '🐛', name: 'Bug Hunter', desc: 'Complete your first case.' },
  { id: 'scientific_mind', icon: '🧠', name: 'Scientific Mind', desc: 'Complete a case without running any experiment more than twice.' },
  { id: 'first_try', icon: '🎯', name: 'Clean Report', desc: 'Solve a case on your first report.' },
  { id: 'master', icon: '🏆', name: 'Case Closed', desc: 'Solve every case.' },
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
