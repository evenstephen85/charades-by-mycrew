import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { GameConfig, GameSettings, InputMode, Screen, Team, TurnResult } from '../types';
import {
  clearScores as clearScoresStorage,
  clearTeams as clearTeamsStorage,
  loadDisabledWords,
  loadLastConfig,
  loadSettings,
  loadTeams,
  saveDisabledWords,
  saveLastConfig,
  saveSettings,
  saveTeams,
} from '../lib/storage';
import { getAllWordsFromPacks } from '../data/packs';
import { makeId, shuffle } from '../lib/util';

interface CurrentTurn {
  teamId: string;
  correct: string[];
  skipped: string[];
}

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
}

interface State {
  screen: Screen;
  teams: Team[];
  settings: GameSettings;
  disabledWords: Record<string, string[]>;
  game: RuntimeGame | null;
}

type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'SET_TEAMS'; teams: Team[] }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'CLEAR_SCORES' }
  | { type: 'CLEAR_TEAMS' }
  | { type: 'TOGGLE_DISABLED_WORD'; packId: string; word: string }
  | { type: 'START_GAME'; config: GameConfig }
  | { type: 'SET_INPUT_MODE'; inputMode: InputMode }
  | { type: 'BEGIN_TURN' }
  | { type: 'ANSWER'; result: 'correct' | 'skip' }
  | { type: 'END_TURN' }
  | { type: 'CONTINUE_AFTER_SUMMARY' }
  | { type: 'RETURN_HOME' };

function buildTurnOrder(teamIds: string[], numRounds: number): string[] {
  const order: string[] = [];
  for (let r = 0; r < numRounds; r++) order.push(...teamIds);
  return order;
}

function initialState(): State {
  return {
    screen: 'welcome',
    teams: loadTeams(),
    settings: loadSettings(),
    disabledWords: loadDisabledWords(),
    game: null,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'SET_TEAMS':
      return { ...state, teams: action.teams };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case 'CLEAR_SCORES':
      return { ...state, teams: state.teams.map((t) => ({ ...t, score: 0 })) };

    case 'CLEAR_TEAMS':
      return { ...state, teams: [] };

    case 'TOGGLE_DISABLED_WORD': {
      const current = new Set(state.disabledWords[action.packId] ?? []);
      if (current.has(action.word)) current.delete(action.word);
      else current.add(action.word);
      return {
        ...state,
        disabledWords: { ...state.disabledWords, [action.packId]: [...current] },
      };
    }

    case 'START_GAME': {
      const turnOrder = buildTurnOrder(action.config.teamIds, action.config.numRounds);
      const wordQueue = shuffle(
        getAllWordsFromPacks(action.config.selectedPackIds, state.disabledWords),
      );
      const sessionScores: Record<string, number> = {};
      for (const id of action.config.teamIds) sessionScores[id] = 0;
      return {
        ...state,
        screen: 'get-ready',
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
        queue = shuffle(
          getAllWordsFromPacks(state.game.config.selectedPackIds, state.disabledWords),
        );
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
        queue = shuffle(
          getAllWordsFromPacks(state.game.config.selectedPackIds, state.disabledWords),
        );
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
      saveTeams(teams);
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

    case 'RETURN_HOME':
      return { ...state, screen: 'welcome', game: null };

    default:
      return state;
  }
}

interface GameContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  setScreen: (screen: Screen) => void;
  saveTeamsList: (teams: Team[]) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  clearScores: () => void;
  clearTeams: () => void;
  toggleDisabledWord: (packId: string, word: string) => void;
  startGame: (config: GameConfig) => void;
  setInputMode: (inputMode: InputMode) => void;
  beginTurn: () => void;
  answer: (result: 'correct' | 'skip') => void;
  endTurn: () => void;
  continueAfterSummary: () => void;
  returnHome: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    saveSettings(state.settings);
  }, [state.settings]);

  useEffect(() => {
    saveDisabledWords(state.disabledWords);
  }, [state.disabledWords]);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      dispatch,
      setScreen: (screen) => dispatch({ type: 'SET_SCREEN', screen }),
      saveTeamsList: (teams) => {
        saveTeams(teams);
        dispatch({ type: 'SET_TEAMS', teams });
      },
      updateSettings: (settings) => dispatch({ type: 'UPDATE_SETTINGS', settings }),
      clearScores: () => {
        clearScoresStorage(state.teams);
        dispatch({ type: 'CLEAR_SCORES' });
      },
      clearTeams: () => {
        clearTeamsStorage();
        dispatch({ type: 'CLEAR_TEAMS' });
      },
      toggleDisabledWord: (packId, word) => dispatch({ type: 'TOGGLE_DISABLED_WORD', packId, word }),
      startGame: (config) => {
        saveLastConfig(config);
        dispatch({ type: 'START_GAME', config });
      },
      setInputMode: (inputMode) => dispatch({ type: 'SET_INPUT_MODE', inputMode }),
      beginTurn: () => dispatch({ type: 'BEGIN_TURN' }),
      answer: (result) => dispatch({ type: 'ANSWER', result }),
      endTurn: () => dispatch({ type: 'END_TURN' }),
      continueAfterSummary: () => dispatch({ type: 'CONTINUE_AFTER_SUMMARY' }),
      returnHome: () => dispatch({ type: 'RETURN_HOME' }),
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

export function makeDefaultTeam(index: number): Team {
  return { id: makeId(), name: `Team ${index + 1}`, score: 0, isDefaultName: true };
}

export { loadLastConfig };
