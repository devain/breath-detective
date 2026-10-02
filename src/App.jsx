import { useGame } from './hooks/useGame.js';
import TitleScreen from './pages/TitleScreen.jsx';
import CaseSelect from './pages/CaseSelect.jsx';
import Investigation from './pages/Investigation.jsx';
import Toasts from './components/Toasts.jsx';

export default function App() {
  const [state, dispatch] = useGame();
  const screen = state.screen === 'investigation' && !state.run ? 'cases' : state.screen;

  return (
    <>
      {screen === 'title' && <TitleScreen state={state} dispatch={dispatch} />}
      {screen === 'cases' && <CaseSelect state={state} dispatch={dispatch} />}
      {screen === 'investigation' && (
        <Investigation key={`${state.run.caseId}:${state.run.seed}`} state={state} dispatch={dispatch} />
      )}
      <Toasts events={state.events} dispatch={dispatch} />
    </>
  );
}
