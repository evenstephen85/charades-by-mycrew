function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`;
}

/** Relative luminance (WCAG) — used to decide whether white or dark text reads better on a color. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastText(hex: string, dark = '#123a5e', light = '#ffffff'): string {
  return relativeLuminance(hex) > 0.5 ? dark : light;
}

/** Mix a color toward black (negative amount) or white (positive amount), amount in [-1, 1]. */
export function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const target = amount >= 0 ? 255 : 0;
  const t = Math.abs(amount);
  return rgbToHex(
    r + (target - r) * t,
    g + (target - g) * t,
    b + (target - b) * t,
  );
}

/** CSS custom properties that reskin a screen into a team's color. */
export function teamThemeVars(color: string): Record<string, string> {
  const text = contrastText(color);
  const isLight = text !== '#ffffff';
  return {
    '--bg': color,
    '--surface': shade(color, isLight ? 0.18 : -0.18),
    '--text': text,
  };
}
