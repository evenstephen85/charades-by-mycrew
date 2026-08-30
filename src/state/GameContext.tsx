import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import type {
  ActiveGameSnapshot,
  CurrentTurn,
  GameConfig,
  GameSettings,
  InputMode,
  Screen,
  Team,
  TurnResult,
} from '../types';
import { GAMEPLAY_SCREENS } from '../types';
import {
  clearActiveGame,
  loadActiveGame,
  loadLastConfig,
  loadSettings,
  loadTeams,
  saveActiveGame,
  saveLastConfig,
  saveSettings,
  saveTeams,
} from '../lib/storage';
import { getAllWordsFromPacks } from '../data/packs';
import { TEAM_COLORS, colorForIndex, nameForColor } from '../lib/teamColors';
import { makeId, shuffle } from '../lib/util';

export const MAX_TEAMS = 6;
export const MIN_TEAMS = 1;

interface RuntimeGame {
  config: GameConfig;
  turnOrder: string[];
  turnIndex: number;
  wordQueue: string[];
  currentTurn: CurrentTurn | null;
  currentWord: string | null;
  allTurnResults: TurnResult[];
  sessionScores: Record<string, number>;
  inputMode: InputMode;
  pausedScreen: Screen;
  timeLeft: number | null;
  finaleRevealed: boolean;
}

export interface PackChoice {
  selectedPackIds: string[];
  useAllPacks: boolean;
}

interface State {
  screen: Screen;
  previousScreen: Screen | null;
  teams: Team[];
  settings: GameSettings;
  game: RuntimeGame | null;
  draftPackChoice: PackChoice | null;
}

type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'ADD_TEAM' }
  | { type: 'REMOVE_TEAM'; id: string }
  | { type: 'RENAME_TEAM'; id: string; name: string }
  | { type: 'RECOLOR_TEAM'; id: string; color: string }
  | { type: 'ADJUST_TEAM_SCORE'; id: string; delta: number }
  | { type: 'CHOOSE_PACK'; choice: PackChoice }
  | { type: 'START_GAME'; config: GameConfig }
  | { type: 'SET_INPUT_MODE'; inputMode: InputMode }
  | { type: 'BEGIN_TURN' }
  | { type: 'ANSWER'; result: 'correct' | 'skip' }
  | { type: 'END_TURN' }
  | { type: 'CONTINUE_AFTER_SUMMARY' }
  | { type: 'PAUSE_HOME' }
  | { type: 'RESUME_PAUSED_GAME' }
  | { type: 'END_GAME'; nextScreen: 'pack-select' | 'team-setup' }
  | { type: 'CLEAR_SCORES' }
  | { type: 'MARK_FINALE_REVEALED' }
  | { type: 'SET_TIME_LEFT'; seconds: number | null }
  | { type: 'DISCARD_AND_CHOOSE_PACK'; choice: PackChoice }
  | { type: 'LOAD_SNAPSHOT'; snapshot: ActiveGameSnapshot };

function buildTurnOrder(teamIds: string[], numRounds: number): string[] {
  const order: string[] = [];
  for (let r = 0; r < numRounds; r++) order.push(...teamIds);
  return order;
}

function snapshotFromGame(game: RuntimeGame, screen: Screen): ActiveGameSnapshot {
  return {
    screen,
    config: game.config,
    turnOrder: game.turnOrder,
    turnIndex: game.turnIndex,
    wordQueue: game.wordQueue,
    currentTurn: game.currentTurn,
    currentWord: game.currentWord,
    allTurnResults: game.allTurnResults,
    sessionScores: game.sessionScores,
    inputMode: game.inputMode,
    timeLeft: game.timeLeft,
    finaleRevealed: game.finaleRevealed,
  };
}

function gameFromSnapshot(snapshot: ActiveGameSnapshot): RuntimeGame {
  return {
    config: snapshot.config,
    turnOrder: snapshot.turnOrder,
    turnIndex: snapshot.turnIndex,
    wordQueue: snapshot.wordQueue,
    currentTurn: snapshot.currentTurn,
    currentWord: snapshot.currentWord,
    allTurnResults: snapshot.allTurnResults,
    sessionScores: snapshot.sessionScores,
    inputMode: snapshot.inputMode,
    pausedScreen: snapshot.screen,
    timeLeft: snapshot.timeLeft ?? null,
    finaleRevealed: snapshot.finaleRevealed ?? snapshot.screen === 'final-results',
  };
}

const DEFAULT_TEAM_COUNT = 2;

// Only seeds default teams for a genuinely fresh install (nothing saved yet).
// A saved team list of length 1 is a deliberate Freeplay choice, not a state
// to "correct" back up to the minimum on every load.
function ensureMinTeams(teams: Team[]): Team[] {
  if (teams.length > 0) return teams;
  const result: Team[] = [];
  while (result.length < DEFAULT_TEAM_COUNT) {
    const color = colorForIndex(result.length);
    result.push({ id: makeId(), name: color.name, color: color.hex, score: 0, isDefaultName: true });
  }
  return result;
}

/** First palette colour not already taken by a team, so two teams never match. */
function firstFreeColor(teams: Team[]) {
  const taken = new Set(teams.map((t) => t.color.toLowerCase()));
  return TEAM_COLORS.find((c) => !taken.has(c.hex.toLowerCase())) ?? colorForIndex(teams.length);
}

/** Scores are per-game: zero them whenever no game is in progress. */
function zeroScores(teams: Team[]): Team[] {
  return teams.map((t) => (t.score === 0 ? t : { ...t, score: 0 }));
}

function initialState(): State {
  return {
    screen: 'intro',
    previousScreen: null,
    teams: ensureMinTeams(loadTeams()),
    settings: loadSettings(),
    game: null,
    draftPackChoice: null,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'OPEN_SETTINGS': {
      // The turn is preserved: PlayingScreen writes its remaining seconds into
      // game.timeLeft on every tick, so coming back picks the round up where it
      // was rather than restarting it. pausedScreen is pinned to the gameplay
      // screen being left, so a later Home -> Resume returns to the round and
      // not to Settings.
      const leavingGameplay = state.game && GAMEPLAY_SCREENS.includes(state.screen);
      return {
        ...state,
        screen: 'settings',
        previousScreen: state.screen,
        game: leavingGameplay ? { ...state.game!, pausedScreen: state.screen } : state.game,
      };
    }

    case 'CLOSE_SETTINGS':
      return { ...state, screen: state.previousScreen ?? 'pack-select', previousScreen: null };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case 'ADD_TEAM': {
      if (state.teams.length >= MAX_TEAMS) return state;
      const color = firstFreeColor(state.teams);
      const team: Team = {
        id: makeId(),
        name: color.name,
        color: color.hex,
        score: 0,
        isDefaultName: true,
      };
      return { ...state, teams: [...state.teams, team] };
    }

    case 'REMOVE_TEAM': {
      if (state.teams.length <= MIN_TEAMS) return state;
      return { ...state, teams: state.teams.filter((t) => t.id !== action.id) };
    }

    case 'RENAME_TEAM':
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.id ? { ...t, name: action.name, isDefaultName: action.name.trim() === '' } : t,
        ),
      };

    case 'RECOLOR_TEAM': {
      const takenByOther = state.teams.some(
        (t) => t.id !== action.id && t.color.toLowerCase() === action.color.toLowerCase(),
      );
      if (takenByOther) return state;
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.id
            ? { ...t, color: action.color, name: t.isDefaultName ? nameForColor(action.color) : t.name }
            : t,
        ),
      };
    }

    case 'ADJUST_TEAM_SCORE':
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.id ? { ...t, score: Math.max(0, t.score + action.delta) } : t,
        ),
      };

    case 'CHOOSE_PACK':
      return { ...state, draftPackChoice: action.choice, screen: 'team-setup' };

    case 'START_GAME': {
      const turnOrder = buildTurnOrder(action.config.teamIds, action.config.numRounds);
      const wordQueue = shuffle(getAllWordsFromPacks(action.config.selectedPackIds));
      const sessionScores: Record<string, number> = {};
      for (const id of action.config.teamIds) sessionScores[id] = 0;
      return {
        ...state,
        screen: 'get-ready',
        draftPackChoice: null,
        teams: zeroScores(state.teams),
        game: {
          config: action.config,
          turnOrder,
          turnIndex: 0,
          wordQueue,
          currentTurn: null,
          currentWord: null,
          allTurnResults: [],
          sessionScores,
          inputMode: 'buttons',
          pausedScreen: 'get-ready',
          timeLeft: null,
          finaleRevealed: false,
        },
      };
    }

    case 'SET_INPUT_MODE': {
      if (!state.game) return state;
      return { ...state, game: { ...state.game, inputMode: action.inputMode } };
    }

    case 'BEGIN_TURN': {
      if (!state.game) return state;
      const teamId = state.game.turnOrder[state.game.turnIndex];
      let queue = state.game.wordQueue;
      if (queue.length === 0) {
        queue = shuffle(getAllWordsFromPacks(state.game.config.selectedPackIds));
      }
      const [currentWord, ...rest] = queue;
      return {
        ...state,
        screen: 'playing',
        game: {
          ...state.game,
          wordQueue: rest,
          currentWord: currentWord ?? null,
          currentTurn: { teamId, correct: [], skipped: [] },
          timeLeft: state.game.config.roundSeconds,
        },
      };
    }

    case 'ANSWER': {
      if (!state.game || !state.game.currentTurn || !state.game.currentWord) return state;
      const word = state.game.currentWord;
      const updatedTurn: CurrentTurn = {
        ...state.game.currentTurn,
        correct:
          action.result === 'correct'
            ? [...state.game.currentTurn.correct, word]
            : state.game.currentTurn.correct,
        skipped:
          action.result === 'skip'
            ? [...state.game.currentTurn.skipped, word]
            : state.game.currentTurn.skipped,
      };
      let queue = state.game.wordQueue;
      if (queue.length === 0) {
        queue = shuffle(getAllWordsFromPacks(state.game.config.selectedPackIds));
      }
      const [nextWord, ...rest] = queue;
      return {
        ...state,
        game: {
          ...state.game,
          currentTurn: updatedTurn,
          wordQueue: rest,
          currentWord: nextWord ?? null,
        },
      };
    }

    case 'END_TURN': {
      if (!state.game || !state.game.currentTurn) return state;
      const { teamId, correct, skipped } = state.game.currentTurn;
      const roundNumber = Math.floor(state.game.turnIndex / state.game.config.teamIds.length) + 1;
      const result: TurnResult = { teamId, roundNumber, correct, skipped };
      const teams = state.teams.map((t) =>
        t.id === teamId ? { ...t, score: t.score + correct.length } : t,
      );
      return {
        ...state,
        screen: 'turn-summary',
        teams,
        game: {
          ...state.game,
          allTurnResults: [...state.game.allTurnResults, result],
          sessionScores: {
            ...state.game.sessionScores,
            [teamId]: state.game.sessionScores[teamId] + correct.length,
          },
          currentTurn: null,
          currentWord: null,
          timeLeft: null,
        },
      };
    }

    case 'CONTINUE_AFTER_SUMMARY': {
      if (!state.game) return state;
      const nextIndex = state.game.turnIndex + 1;
      if (nextIndex >= state.game.turnOrder.length) {
        return { ...state, screen: 'final-results' };
      }
      return {
        ...state,
        screen: 'get-ready',
        game: { ...state.game, turnIndex: nextIndex },
      };
    }

    case 'PAUSE_HOME': {
      if (!state.game) return { ...state, screen: 'pack-select' };
      // Resume returns to exactly where the player was -- including a live
      // round, with its remaining time, word and mid-round tally intact. When
      // Home is pressed from Settings, state.screen is 'settings', so fall back
      // to the gameplay screen already recorded on the way in.
      const resumeAt = GAMEPLAY_SCREENS.includes(state.screen)
        ? state.screen
        : state.game.pausedScreen;
      return {
        ...state,
        screen: 'pack-select',
        game: { ...state.game, pausedScreen: resumeAt },
      };
    }

    case 'RESUME_PAUSED_GAME': {
      if (!state.game) return state;
      return { ...state, screen: state.game.pausedScreen };
    }

    case 'END_GAME':
      return { ...state, screen: action.nextScreen, game: null, draftPackChoice: null };

    case 'CLEAR_SCORES':
      return { ...state, teams: zeroScores(state.teams) };

    case 'SET_TIME_LEFT': {
      if (!state.game || state.game.timeLeft === action.seconds) return state;
      return { ...state, game: { ...state.game, timeLeft: action.seconds } };
    }

    case 'MARK_FINALE_REVEALED': {
      if (!state.game || state.game.finaleRevealed) return state;
      return { ...state, game: { ...state.game, finaleRevealed: true } };
    }

    case 'DISCARD_AND_CHOOSE_PACK':
      return {
        ...state,
        game: null,
        draftPackChoice: action.choice,
        screen: 'team-setup',
        teams: zeroScores(state.teams),
      };

    case 'LOAD_SNAPSHOT':
      return { ...state, game: gameFromSnapshot(action.snapshot), screen: action.snapshot.screen };

    default:
      return state;
  }
}

interface GameContextValue {
  state: State;
  setScreen: (screen: Screen) => void;
  openSettings: () => void;
  closeSettings: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  addTeam: () => void;
  removeTeam: (id: string) => void;
  renameTeam: (id: string, name: string) => void;
  recolorTeam: (id: string, color: string) => void;
  adjustTeamScore: (id: string, delta: number) => void;
  choosePack: (choice: PackChoice) => void;
  discardAndChoosePack: (choice: PackChoice) => void;
  startGame: (config: GameConfig) => void;
  setInputMode: (inputMode: InputMode) => void;
  beginTurn: () => void;
  answer: (result: 'correct' | 'skip') => void;
  endTurn: () => void;
  continueAfterSummary: () => void;
  pauseHome: () => void;
  resumePausedGame: () => void;
  endGame: (nextScreen: 'pack-select' | 'team-setup') => void;
  clearScores: () => void;
  markFinaleRevealed: () => void;
  setTimeLeft: (seconds: number | null) => void;
  loadSnapshot: (snapshot: ActiveGameSnapshot) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    saveSettings(state.settings);
  }, [state.settings]);

  useEffect(() => {
    saveTeams(state.teams);
  }, [state.teams]);

  useEffect(() => {
    // Note: state.game starts out null on every cold boot even when a saved
    // snapshot exists in storage (it isn't loaded into state until the user
    // chooses to resume it), so this must never blanket-clear storage just
    // because state.game is null — only explicit game-ending actions do that.
    if (state.game && GAMEPLAY_SCREENS.includes(state.screen)) {
      saveActiveGame(snapshotFromGame(state.game, state.screen));
    } else if (state.game) {
      saveActiveGame(snapshotFromGame(state.game, state.game.pausedScreen));
    }
  }, [state.game, state.screen]);

  useEffect(() => {
    if (state.game) saveLastConfig(state.game.config);
  }, [state.game?.config]);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      setScreen: (screen) => dispatch({ type: 'SET_SCREEN', screen }),
      openSettings: () => dispatch({ type: 'OPEN_SETTINGS' }),
      closeSettings: () => dispatch({ type: 'CLOSE_SETTINGS' }),
      updateSettings: (settings) => dispatch({ type: 'UPDATE_SETTINGS', settings }),
      addTeam: () => dispatch({ type: 'ADD_TEAM' }),
      removeTeam: (id) => dispatch({ type: 'REMOVE_TEAM', id }),
      renameTeam: (id, name) => dispatch({ type: 'RENAME_TEAM', id, name }),
      recolorTeam: (id, color) => dispatch({ type: 'RECOLOR_TEAM', id, color }),
      adjustTeamScore: (id, delta) => dispatch({ type: 'ADJUST_TEAM_SCORE', id, delta }),
      choosePack: (choice) => dispatch({ type: 'CHOOSE_PACK', choice }),
      discardAndChoosePack: (choice) => {
        clearActiveGame();
        dispatch({ type: 'DISCARD_AND_CHOOSE_PACK', choice });
      },
      startGame: (config) => dispatch({ type: 'START_GAME', config }),
      setInputMode: (inputMode) => dispatch({ type: 'SET_INPUT_MODE', inputMode }),
      beginTurn: () => dispatch({ type: 'BEGIN_TURN' }),
      answer: (result) => dispatch({ type: 'ANSWER', result }),
      endTurn: () => dispatch({ type: 'END_TURN' }),
      continueAfterSummary: () => dispatch({ type: 'CONTINUE_AFTER_SUMMARY' }),
      pauseHome: () => dispatch({ type: 'PAUSE_HOME' }),
      resumePausedGame: () => dispatch({ type: 'RESUME_PAUSED_GAME' }),
      endGame: (nextScreen) => {
        // The snapshot deliberately survives: a finished game is offered back as
        // "keep or clear these scores", not resumed.
        dispatch({ type: 'END_GAME', nextScreen });
      },
      clearScores: () => dispatch({ type: 'CLEAR_SCORES' }),
      markFinaleRevealed: () => dispatch({ type: 'MARK_FINALE_REVEALED' }),
      setTimeLeft: (seconds) => dispatch({ type: 'SET_TIME_LEFT', seconds }),
      loadSnapshot: (snapshot) => dispatch({ type: 'LOAD_SNAPSHOT', snapshot }),
    }),
    [state],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export { loadActiveGame, loadLastConfig };
