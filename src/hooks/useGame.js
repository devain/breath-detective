import { useEffect, useReducer, useRef, useState } from 'react';
import { gameReducer, initialState } from '../game/gameReducer.js';
import { loadState, saveState } from '../game/storage.js';

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState, (init) => loadState(init));
  useEffect(() => {
    saveState(state);
  }, [state]);
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);
  return [state, dispatch];
}

// Eased number animation toward `target`.
export function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(target ?? 0);
  const current = useRef(target ?? 0);
  useEffect(() => {
    if (target == null) return undefined;
    const from = current.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const v = from + (target - from) * (1 - Math.pow(1 - p, 3));
      current.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}
