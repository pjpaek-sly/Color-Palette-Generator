/**
 * Framework preset definitions.
 * Each preset defines stop labels and corresponding LCH lightness values (0-100).
 * Stops are ordered in the framework's native convention (typically light-to-dark).
 */

function linearLightness(count, lightMax = 97, lightMin = 10) {
  return Array.from({ length: count }, (_, i) =>
    Math.round(lightMax - (lightMax - lightMin) * (i / (count - 1)))
  );
}

export const presets = {
  // --- Google ---
  material: {
    name: 'Material Design',
    group: 'Google',
    stops: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    lightness: linearLightness(10, 95, 10),
  },
  material3: {
    name: 'Material 3',
    group: 'Google',
    stops: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100],
    // Material 3 tonal values map directly to lightness, dark-to-light
    lightness: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100],
  },

  // --- Frameworks ---
  tailwind: {
    name: 'Tailwind',
    group: 'Frameworks',
    stops: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    lightness: [97, 93, 85, 76, 66, 55, 45, 35, 25, 15, 10],
  },
  antdesign: {
    name: 'Ant Design',
    group: 'Frameworks',
    stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    lightness: linearLightness(10, 95, 10),
  },
  bootstrap: {
    name: 'Bootstrap',
    group: 'Frameworks',
    stops: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    lightness: linearLightness(9, 93, 12),
  },
  radix: {
    name: 'Radix',
    group: 'Frameworks',
    stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    lightness: [99, 97, 93, 88, 82, 73, 62, 50, 40, 32, 22, 13],
  },
  untitledui: {
    name: 'Untitled UI',
    group: 'Frameworks',
    stops: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    lightness: [98, 96, 92, 84, 74, 64, 53, 43, 33, 23, 15, 9],
  },
  opencolor: {
    name: 'Open Color',
    group: 'Frameworks',
    stops: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    lightness: linearLightness(10, 97, 15),
  },

  // --- Atlassian ---
  ads: {
    name: 'ADS Foundations',
    group: 'Atlassian',
    stops: [50, 100, 200, 300, 400, 500, 600],
    lightness: linearLightness(7, 95, 20),
  },
  adsNeutral: {
    name: 'ADS Foundations Neutral',
    group: 'Atlassian',
    stops: [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900],
    lightness: linearLightness(19, 100, 3),
  },

  // --- Adobe ---
  spectrum: {
    name: 'Spectrum',
    group: 'Adobe',
    stops: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300],
    lightness: linearLightness(13, 96, 5),
  },
  spectrumNeutral: {
    name: 'Spectrum Neutral',
    group: 'Adobe',
    stops: [25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    lightness: linearLightness(12, 98, 8),
  },

  // --- More ---
  carbon: {
    name: 'Carbon (IBM)',
    group: 'More',
    stops: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    lightness: linearLightness(10, 97, 10),
  },
  base: {
    name: 'Base (Uber)',
    group: 'More',
    stops: [50, 100, 200, 300, 400, 500, 600, 700],
    lightness: linearLightness(8, 96, 15),
  },
  polaris: {
    name: 'Polaris (Shopify)',
    group: 'More',
    stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    lightness: linearLightness(16, 98, 7),
  },
  fluent: {
    name: 'Fluent (Microsoft)',
    group: 'More',
    stops: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160],
    lightness: linearLightness(16, 97, 7),
  },
};

/** Ordered groups for the dropdown */
export const presetGroups = [
  { label: 'Google', keys: ['material', 'material3'] },
  { label: 'Frameworks', keys: ['tailwind', 'antdesign', 'bootstrap', 'radix', 'untitledui', 'opencolor'] },
  { label: 'Atlassian', keys: ['ads', 'adsNeutral'] },
  { label: 'Adobe', keys: ['spectrum', 'spectrumNeutral'] },
  { label: 'More', keys: ['carbon', 'base', 'polaris', 'fluent'] },
];

export const DEFAULT_PRESET = 'tailwind';
