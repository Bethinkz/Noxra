/**
 * Package correctness check for the built `@noxra/ui` package.
 *
 * Angular Package Format compliance is easy to break by accident and hard to
 * notice until someone installs the package, so the shape of `dist/noxra` is
 * asserted here rather than reviewed by eye.
 *
 * The dependency assertions are the important ones: they are how Noxra's
 * "minimal dependencies" and "zero forms coupling" claims stay true rather
 * than aspirational.
 *
 * Requires `npm run build:lib` first. Run with `npm run check:package`.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const distDir = join(repoRoot, 'dist/noxra');

const failures = [];
const fail = (message) => failures.push(message);

if (!existsSync(distDir)) {
  console.error('dist/noxra does not exist. Run `npm run build:lib` first.');
  process.exit(1);
}

// ------------------------------------------------------------- manifest

const manifestPath = join(distDir, 'package.json');
if (!existsSync(manifestPath)) {
  console.error('dist/noxra/package.json is missing.');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

if (manifest.name !== '@noxra/ui') {
  fail(`package name is "${manifest.name}", expected "@noxra/ui"`);
}

if (manifest.sideEffects !== false) {
  fail('sideEffects must be false so bundlers can drop unused components');
}

if (manifest.type !== 'module') {
  fail(`type must be "module", found "${manifest.type}"`);
}

// ------------------------------------------------------------ entry points

const requiredExports = ['.', './package.json', './styles/*'];
for (const entry of requiredExports) {
  if (!manifest.exports?.[entry]) {
    fail(`exports is missing "${entry}"`);
  }
}

if (!manifest.exports?.['.']?.types) {
  fail('the main entry point does not expose "types"');
}

const requiredFiles = ['fesm2022/noxra-ui.mjs', 'types/noxra-ui.d.ts'];
for (const file of requiredFiles) {
  if (!existsSync(join(distDir, file))) {
    fail(`missing build output: ${file}`);
  }
}

// -------------------------------------------------------------- stylesheets

const requiredStyles = [
  'styles/noxra.css',
  'styles/tokens.css',
  'styles/base.css',
  'styles/themes/void.css',
  'styles/themes/mono.css',
  'styles/themes/neon.css',
  'styles/themes/light.css',
  'styles/components/button.css',
  'styles/components/input.css',
  'styles/components/card.css',
  'styles/components/badge.css',
  'styles/components/spinner.css',
  'styles/components/dialog.css',
  'styles/components/alert.css',
  'styles/components/tooltip.css',
];

for (const file of requiredStyles) {
  if (!existsSync(join(distDir, file))) {
    fail(`missing published stylesheet: ${file}`);
  }
}

// Every `@import` in the barrel must resolve inside the published package.
const barrelPath = join(distDir, 'styles/noxra.css');
if (existsSync(barrelPath)) {
  // Strip comments first: the barrel documents the consumer-facing
  // `@import '@noxra/ui/styles/noxra.css'` form, which is not a real import.
  const barrel = readFileSync(barrelPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const imports = Array.from(barrel.matchAll(/@import\s+'([^']+)'/g), (match) => match[1]);

  if (imports.length === 0) {
    fail('styles/noxra.css imports nothing');
  }

  for (const specifier of imports) {
    if (!existsSync(join(distDir, 'styles', specifier))) {
      fail(`styles/noxra.css imports "${specifier}", which is not published`);
    }
  }
}

// ------------------------------------------------------------ dependencies

const peers = manifest.peerDependencies ?? {};
for (const peer of ['@angular/common', '@angular/core']) {
  if (!peers[peer]) {
    fail(`${peer} must be a peer dependency`);
  }
}

for (const name of Object.keys(manifest.dependencies ?? {})) {
  if (name !== 'tslib') {
    fail(`unexpected runtime dependency "${name}" - Noxra ships only tslib`);
  }
}

/**
 * Imports the published bundle actually makes. Each of these would be a real
 * cost to every consumer, so each needs a deliberate decision rather than an
 * accidental import.
 */
const forbiddenImports = ['@angular/forms', '@angular/cdk', '@angular/aria', '@angular/animations'];

const bundlePath = join(distDir, 'fesm2022/noxra-ui.mjs');
if (existsSync(bundlePath)) {
  const bundle = readFileSync(bundlePath, 'utf8');
  const imported = new Set(
    Array.from(bundle.matchAll(/from\s+'([^']+)'/g), (match) => match[1]).filter(
      (specifier) => !specifier.startsWith('.'),
    ),
  );

  for (const specifier of forbiddenImports) {
    if (imported.has(specifier)) {
      fail(`the bundle imports ${specifier}; that must be a deliberate, documented decision`);
    }
  }

  for (const specifier of imported) {
    const allowed = specifier in peers || specifier === 'tslib';
    if (!allowed) {
      fail(`the bundle imports "${specifier}", which is neither a peer dependency nor tslib`);
    }
  }
}

// ------------------------------------------------------------------ report

if (failures.length > 0) {
  console.error(`\nPackage check failed with ${failures.length} problem(s):\n`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  console.error('');
  process.exit(1);
}

console.log(`Package OK: @noxra/ui@${manifest.version} (${requiredStyles.length} stylesheets).`);
