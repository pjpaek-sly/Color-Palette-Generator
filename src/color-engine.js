import { converter, formatHex, clampChroma } from 'culori';

const toLch = converter('lch');

/**
 * Generate a color scale from a master hex color using LCH color space.
 *
 * The master color defines the Hue and Chroma "DNA" of the scale.
 * Lightness values from the preset determine each stop's brightness.
 * Gamut clamping reduces chroma at lightness extremes to stay in sRGB.
 *
 * @param {string} masterHex - The master color as a hex string (e.g. "#3B82F6")
 * @param {object} preset - Preset object with `stops` and `lightness` arrays
 * @returns {Array<{stop: number, hex: string, l: number, c: number, h: number}>}
 */
export function generateScale(masterHex, preset) {
  const master = toLch(masterHex);
  if (!master) return [];

  const hue = master.h ?? 0;
  const chroma = master.c ?? 0;
  const { stops, lightness } = preset;

  return stops.map((stop, i) => {
    const l = lightness[i];
    const raw = { mode: 'lch', l, c: chroma, h: hue };
    const clamped = clampChroma(raw, 'lch', 'rgb');
    const hex = formatHex(clamped);
    return {
      stop,
      hex,
      l: clamped.l,
      c: clamped.c,
      h: clamped.h ?? hue,
    };
  });
}

/**
 * Convert a hex color to its LCH components.
 * @param {string} hex
 * @returns {{ l: number, c: number, h: number } | null}
 */
export function hexToLch(hex) {
  const lch = toLch(hex);
  if (!lch) return null;
  return {
    l: Math.round(lch.l * 10) / 10,
    c: Math.round(lch.c * 10) / 10,
    h: Math.round((lch.h ?? 0) * 10) / 10,
  };
}
