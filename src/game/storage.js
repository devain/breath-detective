const KEY = 'breath-detective:v2';

export function loadState(fallback) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw);
    return { ...fallback, ...saved, events: [], screen: 'title' };
  } catch {
    return fallback;
  }
}

export function saveState(state) {
  try {
    const { events, ...rest } = state;
    localStorage.setItem(KEY, JSON.stringify(rest));
  } catch {
    /* storage unavailable — progress just won't persist */
  }
}
