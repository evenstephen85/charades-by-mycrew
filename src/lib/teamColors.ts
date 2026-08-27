export const TEAM_COLORS = [
  '#ff5da2', '#3ddc84', '#5da2ff', '#ffcc3d',
  '#ff6767', '#b985ff', '#3ddcd0', '#ff9a3d',
];

export function teamColor(index: number): string {
  return TEAM_COLORS[index % TEAM_COLORS.length];
}
