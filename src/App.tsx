import { useEffect, useRef, useState } from 'react';
import { GameProvider, useGame } from './state/GameContext';
import { loadActiveGame, clearActiveGame } from './lib/storage';
import { requestFullscreen } from './lib/orientation';
import { hideNativeStatusBar } from './lib/nativeChrome';
import { contrastText, teamThemeVars } from './lib/color';
import { playBoop, unlockAudio } from './lib/sound';
import { ResumePrompt, FinishedGamePrompt } from './components/ResumePrompt';
import { IntroScreen } from './screens/IntroScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { PackSelectScreen } from './screens/PackSelectScreen';
import { CustomPacksScreen } from './screens/CustomPacksScreen';
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
  const { state, setScreen, loadSnapshot, clearScores } = useGame();
  const [coldSnapshot, setColdSnapshot] = useState<ActiveGameSnapshot | null>(null);
  const soundEnabled = state.settings.soundEnabled;

  useEffect(() => {
    hideNativeStatusBar();
  }, []);

  // A single capture-phase listener drives both jobs, in this order:
  //   1. Unlock audio. The browser keeps the AudioContext suspended (clock
  //      frozen) until a gesture, and anything scheduled against that frozen
  //      clock is discarded, so this has to happen before the first sound the
  //      game wants to make -- not lazily when one is requested.
  //   2. Boop, for any control that doesn't carry a sound of its own.
  // Capture phase so it still fires for handlers that stop propagation.
  const unlockedRef = useRef(false);
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!unlockedRef.current) {
        unlockedRef.current = true;
        unlockAudio();
        requestFullscreen();
      }
      if (!soundEnabled) return;
      const target = e.target as Element | null;
      const control = target?.closest?.('button, input, [role="button"]');
      if (!control || control.matches('[data-no-boop], [data-no-boop] *')) return;
      if (control instanceof HTMLButtonElement && control.disabled) return;
      playBoop();
    };
    window.addEventListener('pointerdown', onPointerDown, true);
    return () => window.removeEventListener('pointerdown', onPointerDown, true);
  }, [soundEnabled]);

  const [finalPhaseColor, setFinalPhaseColor] = useState<string | null>(null);
  const teamColor = state.screen === 'final-results' ? finalPhaseColor : currentTeamColor(state);

  useEffect(() => {
    const root = document.documentElement;
    const vars = teamColor
      ? teamThemeVars(teamColor)
      : {
          '--bg': state.settings.theme.background,
          '--surface': state.settings.theme.surface,
          '--text': state.settings.theme.text,
        };
    root.style.setProperty('--bg', vars['--bg']);
    root.style.setProperty('--surface', vars['--surface']);
    root.style.setProperty('--text', vars['--text']);
    root.style.setProperty('--accent', state.settings.theme.accent);
    root.style.setProperty('--btn-primary-text', contrastText(state.settings.theme.accent));
  }, [state.settings.theme, teamColor]);

  const packMode: 'new-game' | 'manage' = state.draftPackChoice ? 'new-game' : 'manage';

  function handleIntroFinish() {
    // A first-time player meets the rules and calibration before anything else;
    // the saved-game prompt would only get in the way, so it waits.
    if (!state.settings.onboarded) {
      setScreen('welcome');
      return;
    }
    const snapshot = loadActiveGame();
    if (snapshot) setColdSnapshot(snapshot);
    setScreen('pack-select');
  }

  function screenFor(screen: Screen) {
    switch (screen) {
      case 'intro':
        return <IntroScreen soundEnabled={state.settings.soundEnabled} onFinish={handleIntroFinish} />;
      case 'welcome':
        return <WelcomeScreen />;
      case 'pack-select':
        return <PackSelectScreen />;
      case 'custom-packs':
        return <CustomPacksScreen />;
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
      <div className="app-shell">
        {screenFor(state.screen)}
      </div>
      {coldSnapshot && coldSnapshot.screen === 'final-results' && (
        <FinishedGamePrompt
          onKeep={() => {
            clearActiveGame();
            setColdSnapshot(null);
          }}
          onClear={() => {
            clearActiveGame();
            clearScores();
            setColdSnapshot(null);
          }}
        />
      )}
      {coldSnapshot && coldSnapshot.screen !== 'final-results' && (
        <ResumePrompt
          onResume={() => {
            loadSnapshot(coldSnapshot);
            setColdSnapshot(null);
          }}
          onStartNew={() => {
            clearActiveGame();
            clearScores();
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
