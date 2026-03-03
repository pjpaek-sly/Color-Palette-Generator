import './style.css';
import { presets, presetGroups, DEFAULT_PRESET } from './presets.js';
import { generateScale, hexToLch } from './color-engine.js';
import { renderLightnessChart } from './lightness-chart.js';

// ── State ───────────────────────────────────────────

let nextId = 1;

const state = {
  presetKey: DEFAULT_PRESET,
  customLightness: null, // null = use preset defaults, array = user-adjusted
  colors: [
    { id: nextId++, name: 'Blue', hex: '#3b82f6' },
    { id: nextId++, name: 'Red', hex: '#ef4444' },
    { id: nextId++, name: 'Green', hex: '#22c55e' },
    { id: nextId++, name: 'Amber', hex: '#f59e0b' },
    { id: nextId++, name: 'Purple', hex: '#a855f7' },
  ],
};

// ── DOM refs ────────────────────────────────────────

const presetSelect = document.getElementById('preset-select');
const stopsInfo = document.getElementById('stops-info');
const colorInputs = document.getElementById('color-inputs');
const palettes = document.getElementById('palettes');
const addColorBtn = document.getElementById('add-color-btn');
const toast = document.getElementById('toast');
const lightnessChart = document.getElementById('lightness-chart');
const resetLightnessBtn = document.getElementById('reset-lightness-btn');

// ── Helpers ─────────────────────────────────────────

function getActivePreset() {
  const base = presets[state.presetKey];
  if (state.customLightness) {
    return { ...base, lightness: state.customLightness };
  }
  return base;
}

// ── Preset dropdown ─────────────────────────────────

function buildPresetDropdown() {
  presetSelect.innerHTML = '';
  for (const group of presetGroups) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = group.label;
    for (const key of group.keys) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = presets[key].name;
      if (key === state.presetKey) opt.selected = true;
      optgroup.appendChild(opt);
    }
    presetSelect.appendChild(optgroup);
  }
}

function updateStopsInfo() {
  const p = presets[state.presetKey];
  const first = p.stops[0];
  const last = p.stops[p.stops.length - 1];
  const custom = state.customLightness ? ' (custom)' : '';
  stopsInfo.textContent = `${p.stops.length} stops (${first}\u2013${last})${custom}`;
}

// ── Lightness chart ─────────────────────────────────

function onLightnessChange(index, newL) {
  if (!state.customLightness) {
    state.customLightness = [...presets[state.presetKey].lightness];
  }
  state.customLightness[index] = newL;
  resetLightnessBtn.hidden = false;
  updateStopsInfo();
  renderPalettes();
}

function renderChart() {
  const preset = presets[state.presetKey];
  renderLightnessChart(lightnessChart, preset, state.customLightness, onLightnessChange);
  resetLightnessBtn.hidden = !state.customLightness;
}

// ── Color inputs ────────────────────────────────────

function renderColorInputs() {
  colorInputs.innerHTML = '';

  for (const color of state.colors) {
    const lch = hexToLch(color.hex);
    const row = document.createElement('div');
    row.className = 'color-input-row';
    row.innerHTML = `
      <div class="color-picker-wrapper" style="background:${color.hex}">
        <input type="color" value="${color.hex}" data-id="${color.id}" />
      </div>
      <input
        class="color-name-input"
        type="text"
        value="${color.name}"
        data-id="${color.id}"
        spellcheck="false"
      />
      <span class="color-hex-display">${color.hex.toUpperCase()}</span>
      <span class="color-lch-display">L${lch?.l ?? 0} C${lch?.c ?? 0} H${lch?.h ?? 0}</span>
      <button class="btn-remove" data-id="${color.id}" title="Remove color">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    `;
    colorInputs.appendChild(row);
  }
}

// ── Palette rendering ───────────────────────────────

function renderPalettes() {
  palettes.innerHTML = '';
  const preset = getActivePreset();

  for (const color of state.colors) {
    const scale = generateScale(color.hex, preset);
    if (!scale.length) continue;

    const section = document.createElement('div');
    section.className = 'palette-section';

    const header = document.createElement('div');
    header.className = 'palette-header';
    header.innerHTML = `
      <div class="palette-color-dot" style="background:${color.hex}"></div>
      <h3>${escapeHtml(color.name)}</h3>
    `;
    section.appendChild(header);

    const row = document.createElement('div');
    row.className = 'palette-row';

    for (const swatch of scale) {
      const textClass = swatch.l > 55 ? 'swatch-text-dark' : 'swatch-text-light';
      const el = document.createElement('div');
      el.className = `swatch ${textClass}`;
      el.style.backgroundColor = swatch.hex;
      el.dataset.hex = swatch.hex;
      el.innerHTML = `
        <span class="swatch-label">${swatch.stop}</span>
        <span class="swatch-lightness">L${Math.round(swatch.l)}</span>
        <span class="swatch-hex">${swatch.hex.toUpperCase()}</span>
      `;
      row.appendChild(el);
    }

    section.appendChild(row);
    palettes.appendChild(section);
  }
}

// ── Toast ───────────────────────────────────────────

let toastTimeout;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 1800);
}

// ── Clipboard ───────────────────────────────────────

async function copyToClipboard(hex) {
  try {
    await navigator.clipboard.writeText(hex.toUpperCase());
    showToast(`Copied ${hex.toUpperCase()}`);
  } catch {
    showToast('Copy failed');
  }
}

// ── Utilities ───────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Full render ─────────────────────────────────────

function render() {
  updateStopsInfo();
  renderChart();
  renderColorInputs();
  renderPalettes();
}

// ── Event handlers ──────────────────────────────────

presetSelect.addEventListener('change', (e) => {
  state.presetKey = e.target.value;
  state.customLightness = null; // reset custom values on preset change
  render();
});

addColorBtn.addEventListener('click', () => {
  const hue = Math.floor(Math.random() * 360);
  const randomHex = hslToHex(hue, 70, 50);
  state.colors.push({
    id: nextId++,
    name: `Color ${state.colors.length + 1}`,
    hex: randomHex,
  });
  render();
});

resetLightnessBtn.addEventListener('click', () => {
  state.customLightness = null;
  render();
});

colorInputs.addEventListener('input', (e) => {
  const id = Number(e.target.dataset.id);
  const color = state.colors.find((c) => c.id === id);
  if (!color) return;

  if (e.target.type === 'color') {
    color.hex = e.target.value;
    e.target.parentElement.style.background = color.hex;
    const row = e.target.closest('.color-input-row');
    const hexDisplay = row.querySelector('.color-hex-display');
    const lchDisplay = row.querySelector('.color-lch-display');
    const lch = hexToLch(color.hex);
    hexDisplay.textContent = color.hex.toUpperCase();
    lchDisplay.textContent = `L${lch?.l ?? 0} C${lch?.c ?? 0} H${lch?.h ?? 0}`;
    renderPalettes();
  } else if (e.target.classList.contains('color-name-input')) {
    color.name = e.target.value;
    renderPalettes();
  }
});

colorInputs.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.btn-remove');
  if (!removeBtn) return;
  const id = Number(removeBtn.dataset.id);
  state.colors = state.colors.filter((c) => c.id !== id);
  render();
});

palettes.addEventListener('click', (e) => {
  const swatch = e.target.closest('.swatch');
  if (!swatch) return;
  const hex = swatch.dataset.hex;
  copyToClipboard(hex);
  swatch.classList.remove('copied');
  void swatch.offsetWidth; // force reflow
  swatch.classList.add('copied');
});

// ── Helper: HSL to Hex (for random color generation) ─

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// ── Init ────────────────────────────────────────────

buildPresetDropdown();
render();
