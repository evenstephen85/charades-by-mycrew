import { useEffect, useState } from 'react';
import { GameProvider, useGame } from './state/GameContext';
import { loadActiveGame, clearActiveGame } from './lib/storage';
import { requestFullscreen } from './lib/orientation';
import { hideNativeStatusBar } from './lib/nativeChrome';
import { contrastText, teamThemeVars } from './lib/color';
import { ResumePrompt } from './components/ResumePrompt';
import { IntroScreen } from './screens/IntroScreen';
import { PackSelectScreen } from './screens/PackSelectScreen';
import { TeamSetupScreen } from './screens/TeamSetupScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { GetReadyScreen } from './screens/GetReadyScreen';
import { PlayingScreen } from './screens/PlayingScreen';
import { TurnSummaryScreen } from './screens/TurnSummaryScreen';
import { FinalResultsScreen } from './screens/FinalResultsScreen';
import type { ActiveGameSnapshot, Screen } from './types';

function currentTeamColor(state: ReturnType<typeof useGame>['state']): string | null {
  const game = state.game;
  if (!game) return null;

  if (state.screen === 'get-ready' || state.screen === 'playing') {
    const teamId = game.turnOrder[game.turnIndex];
    return state.teams.find((t) => t.id === teamId)?.color ?? null;
  }
  if (state.screen === 'turn-summary' && game.allTurnResults.length > 0) {
    const last = game.allTurnResults[game.allTurnResults.length - 1];
    return state.teams.find((t) => t.id === last.teamId)?.color ?? null;
  }
  return null;
}

function Root() {
  const { state, setScreen, loadSnapshot } = useGame();
  const [coldSnapshot, setColdSnapshot] = useState<ActiveGameSnapshot | null>(null);

  useEffect(() => {
    hideNativeStatusBar();
    const onFirstGesture = () => {
      requestFullscreen();
      window.removeEventListener('pointerdown', onFirstGesture);
    };
    window.addEventListener('pointerdown', onFirstGesture);
    return () => window.removeEventListener('pointerdown', onFirstGesture);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', state.settings.theme.background);
    root.style.setProperty('--surface', state.settings.theme.surface);
    root.style.setProperty('--text', state.settings.theme.text);
    root.style.setProperty('--accent', state.settings.theme.accent);
    root.style.setProperty('--btn-primary-text', contrastText(state.settings.theme.accent));
  }, [state.settings.theme]);

  const [finalPhaseColor, setFinalPhaseColor] = useState<string | null>(null);
  const teamColor = state.screen === 'final-results' ? finalPhaseColor : currentTeamColor(state);
  const shellStyle = teamColor ? teamThemeVars(teamColor) : undefined;
  const packMode: 'new-game' | 'manage' = state.draftPackChoice ? 'new-game' : 'manage';

  function handleIntroFinish() {
    const snapshot = loadActiveGame();
    if (snapshot) setColdSnapshot(snapshot);
    setScreen('pack-select');
  }

  function screenFor(screen: Screen) {
    switch (screen) {
      case 'intro':
        return <IntroScreen soundEnabled={state.settings.soundEnabled} onFinish={handleIntroFinish} />;
      case 'pack-select':
        return <PackSelectScreen />;
      case 'team-setup':
        return <TeamSetupScreen mode={packMode} />;
      case 'settings':
        return <SettingsScreen />;
      case 'get-ready':
        return <GetReadyScreen />;
      case 'playing':
        return <PlayingScreen />;
      case 'turn-summary':
        return <TurnSummaryScreen />;
      case 'final-results':
        return <FinalResultsScreen onPhaseColor={setFinalPhaseColor} />;
      default:
        return <PackSelectScreen />;
    }
  }

  return (
    <>
      <div className="app-shell" style={shellStyle}>
        {screenFor(state.screen)}
      </div>
      {coldSnapshot && (
        <ResumePrompt
          onResume={() => {
            loadSnapshot(coldSnapshot);
            setColdSnapshot(null);
          }}
          onStartNew={() => {
            clearActiveGame();
            setColdSnapshot(null);
          }}
        />
      )}
    </>
  );
}

function App() {
  return (
    <GameProvider>
      <Root />
    </GameProvider>
  );
}

export default App;
