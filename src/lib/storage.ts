import type { ActiveGameSnapshot, GameConfig, GameSettings, Team } from '../types';
import { DEFAULT_TILT_DOWN_THRESHOLD, DEFAULT_TILT_UP_THRESHOLD } from './motion';

const KEYS = {
  teams: 'charades.teams.v2',
  settings: 'charades.settings.v2',
  lastConfig: 'charades.lastConfig.v2',
  activeGame: 'charades.activeGame.v1',
} as const;

export const defaultTheme = {
  background: '#4a90d9',
  surface: '#3d7dc0',
  text: '#ffffff',
  accent: '#ffffff',
};

export const defaultSettings: GameSettings = {
  soundEnabled: true,
  tiltUpThreshold: DEFAULT_TILT_UP_THRESHOLD,
  tiltDownThreshold: DEFAULT_TILT_DOWN_THRESHOLD,
  theme: defaultTheme,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function readRaw<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode, quota) — game still works, just won't persist
  }
}

export function loadTeams(): Team[] {
  return readRaw<Team[]>(KEYS.teams, []);
}

export function saveTeams(teams: Team[]) {
  write(KEYS.teams, teams);
}

export function loadSettings(): GameSettings {
  return read<GameSettings>(KEYS.settings, defaultSettings);
}

export function saveSettings(settings: GameSettings) {
  write(KEYS.settings, settings);
}

export function loadLastConfig(): Partial<GameConfig> | null {
  return readRaw<Partial<GameConfig> | null>(KEYS.lastConfig, null);
}

export function saveLastConfig(config: GameConfig) {
  write(KEYS.lastConfig, config);
}

export function loadActiveGame(): ActiveGameSnapshot | null {
  return readRaw<ActiveGameSnapshot | null>(KEYS.activeGame, null);
}

export function saveActiveGame(snapshot: ActiveGameSnapshot) {
  write(KEYS.activeGame, snapshot);
}

export function clearActiveGame() {
  try {
    localStorage.removeItem(KEYS.activeGame);
  } catch {
    // ignore
  }
}
