import { useEffect } from 'react';
import { GameProvider, useGame } from './state/GameContext';
import { RotateDevicePrompt } from './components/RotateDevicePrompt';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { SetupScreen } from './screens/SetupScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { WordReviewScreen } from './screens/WordReviewScreen';
import { GetReadyScreen } from './screens/GetReadyScreen';
import { PlayingScreen } from './screens/PlayingScreen';
import { TurnSummaryScreen } from './screens/TurnSummaryScreen';
import { FinalResultsScreen } from './screens/FinalResultsScreen';

function Screens() {
  const { state } = useGame();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', state.settings.theme.background);
    root.style.setProperty('--surface', state.settings.theme.surface);
    root.style.setProperty('--text', state.settings.theme.text);
    root.style.setProperty('--accent', state.settings.theme.accent);
  }, [state.settings.theme]);

  switch (state.screen) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'setup':
      return <SetupScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'review':
      return <WordReviewScreen />;
    case 'get-ready':
      return <GetReadyScreen />;
    case 'playing':
      return <PlayingScreen />;
    case 'turn-summary':
      return <TurnSummaryScreen />;
    case 'final-results':
      return <FinalResultsScreen />;
    default:
      return <WelcomeScreen />;
  }
}

function App() {
  return (
    <GameProvider>
      <div className="app-shell">
        <Screens />
      </div>
      <RotateDevicePrompt />
    </GameProvider>
  );
}

export default App;
