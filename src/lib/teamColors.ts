export interface NamedColor {
  name: string;
  hex: string;
}

export const TEAM_COLORS: NamedColor[] = [
  { name: 'Red', hex: '#e0483c' },
  { name: 'Orange', hex: '#f28b28' },
  { name: 'Amber', hex: '#f4b400' },
  { name: 'Yellow', hex: '#f2d230' },
  { name: 'Lime', hex: '#a8d942' },
  { name: 'Green', hex: '#3ddc84' },
  { name: 'Teal', hex: '#2bbf9e' },
  { name: 'Cyan', hex: '#35c7d6' },
  { name: 'Sky', hex: '#4aa8e8' },
  { name: 'Blue', hex: '#3f6fd1' },
  { name: 'Indigo', hex: '#6259d6' },
  { name: 'Violet', hex: '#8a5cf5' },
  { name: 'Purple', hex: '#b04fd6' },
  { name: 'Magenta', hex: '#e04fb8' },
  { name: 'Pink', hex: '#ff5da2' },
  { name: 'Rose', hex: '#d6435f' },
];

export function colorForIndex(index: number): NamedColor {
  return TEAM_COLORS[index % TEAM_COLORS.length];
}

export function nameForColor(hex: string): string {
  return TEAM_COLORS.find((c) => c.hex.toLowerCase() === hex.toLowerCase())?.name ?? 'Team';
}
