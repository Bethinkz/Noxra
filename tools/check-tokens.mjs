/**
 * Token contract parity check.
 *
 * Noxra's design tokens exist twice: as CSS custom properties in
 * `projects/noxra/src/styles`, and as a TypeScript union in
 * `core/tokens/token-names.ts`. Two sources of truth drift silently, so this
 * script makes drift a build failure.
 *
 * It enforces four invariants:
 *
 *   1. The structural tokens declared in `tokens.css` are exactly the
 *      structural groups in TypeScript.
 *   2. Every theme assigns exactly the theme-owned groups - no theme may
 *      forget a token and quietly inherit another theme's value.
 *   3. Every `var(--nx-*)` used anywhere in the library refers to a token that
 *      actually exists. This is what catches typos.
 *   4. Every private `--_nx-*` property a stylesheet uses is declared in that
 *      same stylesheet.
 *
 * Run with `npm run check:tokens`.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const stylesDir = join(repoRoot, 'projects/noxra/src/styles');
const tokenNamesFile = join(repoRoot, 'projects/noxra/src/lib/core/tokens/token-names.ts');

const failures = [];

function fail(message) {
  failures.push(message);
}

function rel(path) {
  return relative(repoRoot, path).replaceAll('\\', '/');
}

/** Every `.css` file under the styles directory. */
function cssFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...cssFiles(path));
    } else if (entry.name.endsWith('.css')) {
      found.push(path);
    }
  }
  return found.sort();
}

/** Custom properties *declared* in a stylesheet, e.g. `--nx-accent: red;`. */
function declaredProperties(css, prefix) {
  const pattern = new RegExp(`^\\s*(${prefix}[a-z0-9-]+)\\s*:`, 'gim');
  return new Set(Array.from(css.matchAll(pattern), (match) => match[1]));
}

/** Custom properties *referenced* in a stylesheet, e.g. `var(--nx-accent)`. */
function referencedProperties(css, prefix) {
  const pattern = new RegExp(`var\\(\\s*(${prefix}[a-z0-9-]+)`, 'gi');
  return new Set(Array.from(css.matchAll(pattern), (match) => match[1]));
}

function sorted(set) {
  return [...set].sort();
}

function difference(a, b) {
  return new Set([...a].filter((value) => !b.has(value)));
}

// ---------------------------------------------------------------- TypeScript

const tokenSource = readFileSync(tokenNamesFile, 'utf8');

const groupsStart = tokenSource.indexOf('export const NX_TOKEN_GROUPS');
const groupsEnd = tokenSource.indexOf('} as const satisfies', groupsStart);
if (groupsStart === -1 || groupsEnd === -1) {
  console.error(`Could not locate NX_TOKEN_GROUPS in ${rel(tokenNamesFile)}`);
  process.exit(1);
}

const groupsBlock = tokenSource.slice(groupsStart, groupsEnd);

/** @type {Map<string, string[]>} */
const groups = new Map();
for (const match of groupsBlock.matchAll(/(\w+)\s*:\s*\[([^\]]*)\]/g)) {
  const tokens = Array.from(match[2].matchAll(/'(--nx-[a-z0-9-]+)'/g), (m) => m[1]);
  groups.set(match[1], tokens);
}

if (groups.size === 0) {
  console.error(`Parsed zero token groups from ${rel(tokenNamesFile)}`);
  process.exit(1);
}

const ownedBlock = tokenSource.slice(tokenSource.indexOf('export const NX_THEME_OWNED_GROUPS'));
const themeOwnedGroups = Array.from(
  ownedBlock.slice(0, ownedBlock.indexOf(']')).matchAll(/'(\w+)'/g),
  (match) => match[1],
);

if (themeOwnedGroups.length === 0) {
  console.error(`Parsed zero theme-owned groups from ${rel(tokenNamesFile)}`);
  process.exit(1);
}

for (const group of themeOwnedGroups) {
  if (!groups.has(group)) {
    fail(`NX_THEME_OWNED_GROUPS names "${group}", which is not a token group.`);
  }
}

const themeOwnedTokens = new Set(themeOwnedGroups.flatMap((group) => groups.get(group) ?? []));
const structuralTokens = new Set(
  [...groups.entries()]
    .filter(([name]) => !themeOwnedGroups.includes(name))
    .flatMap(([, tokens]) => tokens),
);
const allTokens = new Set([...themeOwnedTokens, ...structuralTokens]);

// ------------------------------------------------------- 1. structural CSS

const tokensCss = readFileSync(join(stylesDir, 'tokens.css'), 'utf8');
const declaredStructural = declaredProperties(tokensCss, '--nx-');

for (const token of sorted(difference(structuralTokens, declaredStructural))) {
  fail(`${token} is in the TypeScript contract but not declared in styles/tokens.css`);
}
for (const token of sorted(difference(declaredStructural, structuralTokens))) {
  const hint = themeOwnedTokens.has(token)
    ? ' (it is a theme-owned token; it belongs in styles/themes/*.css)'
    : ' (add it to NX_TOKEN_GROUPS)';
  fail(`${token} is declared in styles/tokens.css but not in the TypeScript contract${hint}`);
}

// ------------------------------------------------------------- 2. each theme

const themesDir = join(stylesDir, 'themes');
const themeFiles = readdirSync(themesDir).filter((name) => name.endsWith('.css'));

if (themeFiles.length === 0) {
  fail('No theme stylesheets found in styles/themes.');
}

for (const themeFile of themeFiles) {
  const path = join(themesDir, themeFile);
  const declared = declaredProperties(readFileSync(path, 'utf8'), '--nx-');

  for (const token of sorted(difference(themeOwnedTokens, declared))) {
    fail(`${rel(path)} does not assign ${token}`);
  }
  for (const token of sorted(difference(declared, themeOwnedTokens))) {
    fail(`${rel(path)} assigns ${token}, which is not a theme-owned token`);
  }
}

// ------------------------------------------------------ 3 & 4. token usage

for (const path of cssFiles(stylesDir)) {
  const css = readFileSync(path, 'utf8');

  for (const token of sorted(referencedProperties(css, '--nx-'))) {
    if (!allTokens.has(token)) {
      fail(`${rel(path)} uses var(${token}), which is not in the token contract`);
    }
  }

  const privateDeclared = declaredProperties(css, '--_nx-');
  for (const token of sorted(referencedProperties(css, '--_nx-'))) {
    if (!privateDeclared.has(token)) {
      fail(`${rel(path)} uses var(${token}) but never declares it`);
    }
  }
}

// ------------------------------------------------------------------ report

if (failures.length > 0) {
  console.error(`\nToken contract check failed with ${failures.length} problem(s):\n`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  console.error('');
  process.exit(1);
}

console.log(
  `Token contract OK: ${allTokens.size} tokens ` +
    `(${structuralTokens.size} structural, ${themeOwnedTokens.size} theme-owned) ` +
    `across ${themeFiles.length} themes.`,
);
