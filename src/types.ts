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
}

export type Screen =
  | 'intro'
  | 'pack-select'
  | 'team-setup'
  | 'settings'
  | 'get-ready'
  | 'playing'
  | 'turn-summary'
  | 'final-results';

export const GAMEPLAY_SCREENS: Screen[] = ['get-ready', 'playing', 'turn-summary', 'final-results'];
export const PORTRAIT_SCREENS: Screen[] = ['pack-select', 'team-setup'];
