const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/styles/globals.css');
const css = fs.readFileSync(file, 'utf8');

function extractBlock(startMarker, endMarker, text) {
  const start = text.indexOf(startMarker);
  if (start === -1) return null;
  const from = text.indexOf('{', start);
  if (from === -1) return null;
  // find matching closing brace for this block
  let depth = 0;
  let i = from;
  for (; i < text.length; i++) {
    if (text[i] === '{') depth++;
    if (text[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  return text.slice(from + 1, i);
}

function parseVars(block) {
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  const vars = {};
  let m;
  while ((m = re.exec(block))) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
}

function hexToRgb(hex) {
  hex = hex.trim();
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ];
}

function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  try {
    const [r,g,b] = hex.startsWith('rgb') ? rgbFromString(hex) : hexToRgb(hex);
    const R = srgbToLinear(r);
    const G = srgbToLinear(g);
    const B = srgbToLinear(b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  } catch (e) {
    return null;
  }
}

function rgbFromString(s) {
  const m = s.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
  if (!m) throw new Error('Invalid rgb string');
  return [parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10)];
}

function contrastRatio(hexA, hexB) {
  const L1 = luminance(hexA);
  const L2 = luminance(hexB);
  if (L1 == null || L2 == null) return null;
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const themeBlock = extractBlock('@theme', '}', css);
const darkBlock = extractBlock('[data-theme="dark"]', '}', css) || extractBlock('data-theme="dark"', '}', css);

const themeVars = parseVars(themeBlock || '');
const darkVars = parseVars(darkBlock || '');

function pick(vars, name, fallback) {
  return vars[name] || fallback;
}

const checks = [
  ['color-text-primary', 'color-background'],
  ['color-text-secondary', 'color-background'],
  ['color-text-muted', 'color-background'],
  ['color-text-primary', 'color-surface'],
  ['color-text-secondary', 'color-surface'],
  ['color-text-muted', 'color-surface']
];

console.log('Light theme checks:');
for (const [a,b] of checks) {
  const A = pick(themeVars, a, null);
  const B = pick(themeVars, b, null);
  if (!A || !B) {
    console.log(`  - Missing vars for ${a} or ${b}`);
    continue;
  }
  const ratio = contrastRatio(A, B);
  console.log(`  - ${a} (${A}) on ${b} (${B}): ${ratio ? ratio.toFixed(2) : 'n/a'} ${ratio >= 4.5 ? '✓' : '✗'}`);
}

console.log('\nDark theme checks:');
for (const [a,b] of checks) {
  const A = pick(darkVars, a, themeVars[a]);
  const B = pick(darkVars, b, themeVars[b]);
  if (!A || !B) {
    console.log(`  - Missing vars for ${a} or ${b}`);
    continue;
  }
  const ratio = contrastRatio(A, B);
  console.log(`  - ${a} (${A}) on ${b} (${B}): ${ratio ? ratio.toFixed(2) : 'n/a'} ${ratio >= 4.5 ? '✓' : '✗'}`);
}

// Also print summary that suggests which variables may need adjustment

console.log('\nSummary suggestions:');
for (const [a,b] of checks) {
  const A_light = themeVars[a], B_light = themeVars[b];
  const ratioL = A_light && B_light ? contrastRatio(A_light, B_light) : null;
  const A_dark = darkVars[a] || themeVars[a], B_dark = darkVars[b] || themeVars[b];
  const ratioD = A_dark && B_dark ? contrastRatio(A_dark, B_dark) : null;
  if (ratioL && ratioL < 4.5) console.log(`  - Increase contrast for ${a} on ${b} in light theme (ratio ${ratioL.toFixed(2)})`);
  if (ratioD && ratioD < 4.5) console.log(`  - Increase contrast for ${a} on ${b} in dark theme (ratio ${ratioD.toFixed(2)})`);
}

console.log('\nAudit complete');
