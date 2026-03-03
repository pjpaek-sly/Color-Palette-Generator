/**
 * Interactive SVG lightness distribution chart with draggable dots.
 */

const SVG_W = 600;
const SVG_H = 200;
const PAD = { top: 20, right: 24, bottom: 32, left: 40 };
const PLOT_W = SVG_W - PAD.left - PAD.right;
const PLOT_H = SVG_H - PAD.top - PAD.bottom;

const THRESHOLD = 55; // text contrast threshold used in swatches

function x(i, count) {
  return PAD.left + (i / (count - 1)) * PLOT_W;
}

function y(l) {
  return PAD.top + PLOT_H - (l / 100) * PLOT_H;
}

function lightnessFromY(py) {
  const l = ((PAD.top + PLOT_H - py) / PLOT_H) * 100;
  return Math.round(Math.max(0, Math.min(100, l)));
}

function buildPolylinePoints(lightness) {
  const n = lightness.length;
  return lightness.map((l, i) => `${x(i, n)},${y(l)}`).join(' ');
}

function biasText(lightness) {
  const light = lightness.filter((l) => l > THRESHOLD).length;
  const dark = lightness.length - light;
  return `${light} light / ${dark} dark`;
}

/**
 * Render an interactive SVG lightness chart.
 * @param {HTMLElement} container
 * @param {object} preset - { stops, lightness }
 * @param {number[]|null} customLightness - user-overridden values, or null for defaults
 * @param {(index: number, newL: number) => void} onChange - called on drag end
 */
export function renderLightnessChart(container, preset, customLightness, onChange) {
  const stops = preset.stops;
  const lightness = customLightness || preset.lightness;
  const n = stops.length;

  // ── Build SVG ───────────────────────────────────

  const parts = [];
  parts.push(`<svg viewBox="0 0 ${SVG_W} ${SVG_H}" xmlns="http://www.w3.org/2000/svg" class="lc-svg">`);

  // Zone shading
  const yThresh = y(THRESHOLD);
  parts.push(`<rect x="${PAD.left}" y="${PAD.top}" width="${PLOT_W}" height="${yThresh - PAD.top}" fill="rgba(255,200,50,0.07)" />`);
  parts.push(`<rect x="${PAD.left}" y="${yThresh}" width="${PLOT_W}" height="${PAD.top + PLOT_H - yThresh}" fill="rgba(30,30,80,0.05)" />`);

  // Grid lines
  for (const tick of [0, 25, 50, 75, 100]) {
    const ty = y(tick);
    const isRef = tick === 50;
    parts.push(`<line x1="${PAD.left}" y1="${ty}" x2="${PAD.left + PLOT_W}" y2="${ty}" stroke="${isRef ? '#bbb' : '#e8e8e8'}" stroke-width="${isRef ? 1 : 0.5}" ${isRef ? 'stroke-dasharray="6 4"' : ''} />`);
    parts.push(`<text x="${PAD.left - 8}" y="${ty + 4}" text-anchor="end" fill="#aaa" font-size="10" font-family="system-ui">${tick}</text>`);
  }

  // Threshold line (L=55)
  parts.push(`<line x1="${PAD.left}" y1="${yThresh}" x2="${PAD.left + PLOT_W}" y2="${yThresh}" stroke="#c4a44a" stroke-width="1" stroke-dasharray="4 3" opacity="0.6" />`);
  parts.push(`<text x="${PAD.left + PLOT_W + 4}" y="${yThresh + 3}" fill="#c4a44a" font-size="9" font-family="system-ui" opacity="0.7">L${THRESHOLD}</text>`);

  // Polyline
  parts.push(`<polyline class="lc-line" points="${buildPolylinePoints(lightness)}" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linejoin="round" />`);

  // Dots, labels, and x-axis labels
  for (let i = 0; i < n; i++) {
    const cx = x(i, n);
    const cy = y(lightness[i]);

    // X-axis stop label
    const rotate = n > 13 ? ` transform="rotate(-45 ${cx} ${PAD.top + PLOT_H + 18})"` : '';
    const anchor = n > 13 ? 'end' : 'middle';
    parts.push(`<text x="${cx}" y="${PAD.top + PLOT_H + 18}" text-anchor="${anchor}" fill="#999" font-size="${n > 16 ? 8 : 10}" font-family="system-ui"${rotate}>${stops[i]}</text>`);

    // Dot group
    parts.push(`<g class="lc-dot-group" data-index="${i}">`);
    // Hit target (wider, invisible)
    parts.push(`<circle cx="${cx}" cy="${cy}" r="12" fill="transparent" class="lc-hit" data-index="${i}" />`);
    // Visible dot
    parts.push(`<circle cx="${cx}" cy="${cy}" r="5" fill="#3b82f6" stroke="#fff" stroke-width="2" class="lc-dot" data-index="${i}" />`);
    // Lightness label
    parts.push(`<text x="${cx}" y="${cy - 10}" text-anchor="middle" fill="#3b82f6" font-size="10" font-weight="600" font-family="system-ui" class="lc-label">${lightness[i]}</text>`);
    parts.push(`</g>`);
  }

  // Bias summary
  parts.push(`<text x="${PAD.left + PLOT_W}" y="${PAD.top - 4}" text-anchor="end" fill="#888" font-size="11" font-weight="500" font-family="system-ui" class="lc-bias">${biasText(lightness)}</text>`);

  parts.push(`</svg>`);
  container.innerHTML = parts.join('');

  // ── Drag interaction ────────────────────────────

  const svg = container.querySelector('.lc-svg');
  let dragging = null;

  function getLocalY(e) {
    const rect = svg.getBoundingClientRect();
    const scaleY = SVG_H / rect.height;
    return (e.clientY - rect.top) * scaleY;
  }

  svg.addEventListener('pointerdown', (e) => {
    const dot = e.target.closest('.lc-hit, .lc-dot');
    if (!dot) return;
    const index = Number(dot.dataset.index);
    dragging = { index };
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('lc-dragging');
    e.preventDefault();
  });

  svg.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const { index } = dragging;
    const newL = lightnessFromY(getLocalY(e));
    const cx = x(index, n);
    const cy = y(newL);

    // Update dot
    const group = svg.querySelector(`.lc-dot-group[data-index="${index}"]`);
    group.querySelector('.lc-dot').setAttribute('cy', cy);
    group.querySelector('.lc-hit').setAttribute('cy', cy);
    const label = group.querySelector('.lc-label');
    label.setAttribute('y', cy - 10);
    label.textContent = newL;

    // Update polyline (rebuild from current dot positions)
    const tempLightness = [...lightness];
    tempLightness[index] = newL;
    svg.querySelector('.lc-line').setAttribute('points', buildPolylinePoints(tempLightness));

    // Update bias
    svg.querySelector('.lc-bias').textContent = biasText(tempLightness);

    dragging.currentL = newL;
  });

  svg.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    const { index, currentL } = dragging;
    svg.classList.remove('lc-dragging');
    svg.releasePointerCapture(e.pointerId);
    if (currentL !== undefined && currentL !== lightness[index]) {
      onChange(index, currentL);
    }
    dragging = null;
  });
}
