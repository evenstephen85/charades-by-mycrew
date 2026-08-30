export interface WordPack {
  id: string;
  name: string;
  words: string[];
}

export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
  isDefaultName: boolean;
}

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  accent: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  tiltUpThreshold: number;
  tiltDownThreshold: number;
  /** Screen-relative pitch of the phone held against the forehead, captured
   *  during calibration. Null until the player has calibrated. */
  tiltNeutral: number | null;
  /** False until the welcome screen (rules, about, calibration) has been seen. */
  onboarded: boolean;
  theme: ThemeColors;
}

export interface GameConfig {
  selectedPackIds: string[];
  useAllPacks: boolean;
  roundSeconds: number;
  numRounds: number;
  teamIds: string[];
}

export interface TurnResult {
  teamId: string;
  roundNumber: number;
  correct: string[];
  skipped: string[];
}

export type InputMode = 'tilt' | 'buttons';

export interface CurrentTurn {
  teamId: string;
  correct: string[];
  skipped: string[];
}

export interface ActiveGameSnapshot {
  screen: Screen;
  config: GameConfig;
  turnOrder: string[];
  turnIndex: number;
  wordQueue: string[];
  currentTurn: CurrentTurn | null;
  currentWord: string | null;
  allTurnResults: TurnResult[];
  sessionScores: Record<string, number>;
  inputMode: InputMode;
  /** Seconds left in the turn that was in progress, so leaving mid-round and
   *  coming back resumes the same turn rather than restarting it. */
  timeLeft: number | null;
  /** True once the drumroll/winner reveal has played, so restoring a finished
   *  game shows the scores straight away instead of replaying the fanfare. */
  finaleRevealed: boolean;
}

export type Screen =
  | 'intro'
  | 'welcome'
  | 'pack-select'
  | 'team-setup'
  | 'settings'
  | 'get-ready'
  | 'playing'
  | 'turn-summary'
  | 'final-results';

export const GAMEPLAY_SCREENS: Screen[] = ['get-ready', 'playing', 'turn-summary', 'final-results'];
export const PORTRAIT_SCREENS: Screen[] = ['pack-select', 'team-setup'];
