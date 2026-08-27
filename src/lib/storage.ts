import type { GameConfig, GameSettings, Team } from '../types';

const KEYS = {
  teams: 'charades.teams.v1',
  settings: 'charades.settings.v1',
  lastConfig: 'charades.lastConfig.v1',
  disabledWords: 'charades.disabledWords.v1',
} as const;

export const defaultTheme = {
  background: '#4a90d9',
  surface: '#3d7dc0',
  text: '#ffffff',
  accent: '#ffffff',
};

export const defaultSettings: GameSettings = {
  soundEnabled: true,
  quickStart: false,
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

export function loadDisabledWords(): Record<string, string[]> {
  return readRaw<Record<string, string[]>>(KEYS.disabledWords, {});
}

export function saveDisabledWords(disabled: Record<string, string[]>) {
  write(KEYS.disabledWords, disabled);
}

export function clearScores(teams: Team[]): Team[] {
  const cleared = teams.map((t) => ({ ...t, score: 0 }));
  saveTeams(cleared);
  return cleared;
}

export function clearTeams() {
  saveTeams([]);
  localStorage.removeItem(KEYS.lastConfig);
}
