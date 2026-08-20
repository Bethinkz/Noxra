/**
 * WCAG contrast check across every Noxra theme.
 *
 * A dark-first design system with a neon accent is exactly the shape that
 * fails contrast quietly: bright accents look legible on black and are not,
 * muted "tertiary" greys drift below 4.5:1, and a light theme built by
 * inverting a dark one usually breaks somewhere. Eyeballing does not catch it,
 * so every foreground/background pair Noxra actually renders is asserted here.
 *
 * Alpha is composited, not ignored: an accent badge is accent-coloured text on
 * a 12%-alpha accent fill over a raised surface, and only the composited
 * result tells the truth.
 *
 * Thresholds follow WCAG 2.1:
 *   4.5:1  normal text                         (1.4.3 AA)
 *   3:1    large text, and non-text UI          (1.4.3 / 1.4.11)
 *
 * Disabled content is intentionally absent - WCAG exempts it, and requiring
 * contrast there would defeat the affordance.
 *
 * Run with `npm run check:contrast`, or `--verbose` for the full table.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const stylesDir = join(repoRoot, 'projects/noxra/src/styles');
const themesDir = join(stylesDir, 'themes');

const verbose = process.argv.includes('--verbose');

const TEXT = 4.5;
const UI = 3;

/**
 * Every pair Noxra actually renders.
 *
 * `on` is a backdrop stack, composited left over right, so a translucent fill
 * is measured against what is really behind it.
 */
const PAIRS = [
  // Body and heading text on each surface.
  ['--nx-content-primary', ['--nx-surface-base'], TEXT],
  ['--nx-content-primary', ['--nx-surface-sunken'], TEXT],
  ['--nx-content-primary', ['--nx-surface-raised'], TEXT],
  ['--nx-content-primary', ['--nx-surface-overlay'], TEXT],
  ['--nx-content-secondary', ['--nx-surface-base'], TEXT],
  ['--nx-content-secondary', ['--nx-surface-raised'], TEXT],
  ['--nx-content-tertiary', ['--nx-surface-base'], TEXT],
  ['--nx-content-tertiary', ['--nx-surface-raised'], TEXT],

  // Inverted surfaces.
  ['--nx-content-inverse', ['--nx-surface-inverse'], TEXT],

  // Solid accent controls: the button label on its own background.
  ['--nx-content-on-accent', ['--nx-accent'], TEXT],
  ['--nx-content-on-accent', ['--nx-accent-hover'], TEXT],
  ['--nx-content-on-accent', ['--nx-accent-active'], TEXT],

  // Accent used as text, including the badge's translucent fill.
  ['--nx-accent', ['--nx-surface-base'], TEXT],
  ['--nx-accent', ['--nx-accent-subtle', '--nx-surface-raised'], TEXT],

  // Status colours used as text or as a meaningful border.
  ['--nx-state-danger', ['--nx-surface-base'], TEXT],
  ['--nx-state-danger', ['--nx-surface-raised'], TEXT],
  ['--nx-state-success', ['--nx-surface-base'], TEXT],
  ['--nx-state-warning', ['--nx-surface-base'], TEXT],
  ['--nx-state-info', ['--nx-surface-base'], TEXT],

  // Non-text UI: the focus ring and emphasis borders must be perceivable.
  ['--nx-state-focus-ring', ['--nx-surface-base'], UI],
  ['--nx-state-focus-ring', ['--nx-surface-raised'], UI],
  ['--nx-border-strong', ['--nx-surface-base'], UI],
  ['--nx-border-strong', ['--nx-surface-raised'], UI],
];

// ------------------------------------------------------------------ parsing

/** All `--nx-*: value;` declarations in a stylesheet, last one winning. */
function declarations(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const found = new Map();
  for (const match of withoutComments.matchAll(/(--nx-[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    found.set(match[1], match[2].trim());
  }
  return found;
}

function parseColor(raw) {
  const value = raw.trim();

  const hex = /^#([0-9a-f]{3,8})$/i.exec(value);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      digits = [...digits].map((d) => d + d).join('');
    }
    const channel = (i) => parseInt(digits.slice(i * 2, i * 2 + 2), 16);
    return {
      r: channel(0),
      g: channel(1),
      b: channel(2),
      a: digits.length === 8 ? channel(3) / 255 : 1,
    };
  }

  // rgb(r g b / a%) and the legacy rgb(r, g, b, a) form.
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(value);
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) {
      return null;
    }
    const alpha = parts[3] ?? '1';
    return {
      r: Number(parts[0]),
      g: Number(parts[1]),
      b: Number(parts[2]),
      a: alpha.endsWith('%') ? Number(alpha.slice(0, -1)) / 100 : Number(alpha),
    };
  }

  return null;
}

/** Follows `var(--nx-x)` chains until a literal colour is reached. */
function resolve(token, tokens, seen = new Set()) {
  if (seen.has(token)) {
    return null;
  }
  seen.add(token);

  const raw = tokens.get(token);
  if (!raw) {
    return null;
  }

  const reference = /^var\(\s*(--nx-[a-z0-9-]+)\s*\)$/i.exec(raw.trim());
  if (reference) {
    return resolve(reference[1], tokens, seen);
  }

  return parseColor(raw);
}

// ------------------------------------------------------------------- colour

/** Composite `over` (which may be translucent) onto opaque `under`. */
function composite(over, under) {
  const a = over.a;
  return {
    r: over.r * a + under.r * (1 - a),
    g: over.g * a + under.g * (1 - a),
    b: over.b * a + under.b * (1 - a),
    a: 1,
  };
}

function relativeLuminance({ r, g, b }) {
  const channel = (value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

/** Flattens a backdrop stack into one opaque colour. */
function flatten(stack, tokens) {
  let result = null;
  for (const token of [...stack].reverse()) {
    const colour = resolve(token, tokens);
    if (!colour) {
      return null;
    }
    result = result ? composite(colour, result) : colour;
  }
  return result;
}

// -------------------------------------------------------------------- check

const structural = declarations(readFileSync(join(stylesDir, 'tokens.css'), 'utf8'));
const themeFiles = readdirSync(themesDir).filter((name) => name.endsWith('.css'));

const failures = [];
const rows = [];

for (const file of themeFiles) {
  const theme = file.replace(/\.css$/, '');
  const tokens = new Map([
    ...structural,
    ...declarations(readFileSync(join(themesDir, file), 'utf8')),
  ]);

  for (const [foreground, backdrop, required] of PAIRS) {
    const fgRaw = resolve(foreground, tokens);
    const bg = flatten(backdrop, tokens);

    if (!fgRaw || !bg) {
      failures.push(`${theme}: could not resolve ${foreground} on ${backdrop.join(' over ')}`);
      continue;
    }

    // Translucent foreground text is measured composited too.
    const fg = fgRaw.a < 1 ? composite(fgRaw, bg) : fgRaw;

    const ratio = contrastRatio(fg, bg);
    const ok = ratio >= required;
    rows.push({ theme, foreground, backdrop, ratio, required, ok });

    if (!ok) {
      failures.push(
        `${theme}: ${foreground} on ${backdrop.join(' over ')} is ` +
          `${ratio.toFixed(2)}:1, needs ${required}:1`,
      );
    }
  }
}

if (verbose) {
  const fgWidth = Math.max(...rows.map((row) => row.foreground.length));
  let current = '';
  for (const row of rows) {
    if (row.theme !== current) {
      current = row.theme;
      console.log(`\n${current}`);
    }
    console.log(
      `  ${row.ok ? ' ' : '!'} ${row.foreground.padEnd(fgWidth)} on ` +
        `${row.backdrop.join(' over ').padEnd(42)} ` +
        `${row.ratio.toFixed(2).padStart(6)}:1  (needs ${row.required})`,
    );
  }
  console.log('');
}

if (failures.length > 0) {
  console.error(`\nContrast check failed with ${failures.length} problem(s):\n`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  console.error('\nRun with --verbose to see every pair.\n');
  process.exit(1);
}

console.log(`Contrast OK: ${rows.length} pairs across ${themeFiles.length} themes meet WCAG AA.`);
