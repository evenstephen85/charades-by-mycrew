export interface WordPack {
  id: string;
  name: string;
  emoji: string;
  words: string[];
}

export interface Team {
  id: string;
  name: string;
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
  quickStart: boolean;
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

export type Screen =
  | 'welcome'
  | 'setup'
  | 'settings'
  | 'review'
  | 'get-ready'
  | 'playing'
  | 'turn-summary'
  | 'final-results';
