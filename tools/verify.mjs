/**
 * `npm run verify` - the confidence gate.
 *
 * This is the command that decides whether Noxra supports a given Angular
 * version. Compatibility is a claim about *passing checks*, not about a
 * permissive semver range, so everything that could break on an Angular
 * upgrade runs here, in dependency order.
 *
 * Usage:
 *   npm run verify
 *   npm run verify -- --only=lint,test        run just these steps
 *   npm run verify -- --skip=format:check     run everything except these
 *   npm run verify -- --from=build:lib        resume from a step
 *   npm run verify -- --list                  show the pipeline
 *
 * The filters exist for iterating on a failure. CI always runs the full
 * pipeline.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

/**
 * Ordered because later steps consume earlier output: the showcase resolves
 * `@noxra/ui` from `dist/`, so the library must be built before anything
 * type-checks or tests against it.
 */
const STEPS = [
  ['format:check', 'Prettier formatting'],
  ['lint', 'ESLint - TypeScript and Angular templates'],
  ['check:tokens', 'Design token contract parity (CSS <-> TypeScript)'],
  ['build:lib', 'Library build - Angular Package Format'],
  ['typecheck', 'TypeScript project references'],
  ['test', 'Library unit tests'],
  ['test:showcase', 'Showcase unit tests'],
  ['check:package', 'Published package correctness'],
  ['build:showcase', 'Showcase build, including prerender (SSR at build time)'],
  ['verify:ssr', 'SSR server smoke test (SSR at request time)'],
];

// ------------------------------------------------------------------- args

const args = process.argv.slice(2);
const flag = (name) => {
  const match = args.find((arg) => arg.startsWith(`--${name}=`));
  return match
    ? match
        .slice(name.length + 3)
        .split(',')
        .filter(Boolean)
    : null;
};

if (args.includes('--list')) {
  console.log('\nverify pipeline:\n');
  for (const [name, description] of STEPS) {
    console.log(`  ${name.padEnd(16)} ${description}`);
  }
  console.log('');
  process.exit(0);
}

const only = flag('only');
const skip = new Set(flag('skip') ?? []);
const from = flag('from')?.[0];

let steps = STEPS;
if (from) {
  const index = steps.findIndex(([name]) => name === from);
  if (index === -1) {
    console.error(`Unknown step "${from}". Run with --list to see the pipeline.`);
    process.exit(1);
  }
  steps = steps.slice(index);
}
if (only) {
  const known = new Set(STEPS.map(([name]) => name));
  const unknown = only.filter((name) => !known.has(name));
  if (unknown.length > 0) {
    console.error(`Unknown step(s): ${unknown.join(', ')}. Run with --list.`);
    process.exit(1);
  }
  steps = steps.filter(([name]) => only.includes(name));
}
steps = steps.filter(([name]) => !skip.has(name));

// -------------------------------------------------------- engine advisory

const required = manifest.engines?.node;
const nodeCheck = spawnSync(
  process.execPath,
  ['-e', 'process.stdout.write(process.versions.node)'],
  { encoding: 'utf8' },
);
const nodeVersion = nodeCheck.stdout?.trim() || process.versions.node;

console.log(`\nNoxra verify - Node ${nodeVersion}, ${steps.length} step(s)\n`);

// ------------------------------------------------------------------- run

const results = [];
let failed = null;

for (const [name, description] of steps) {
  process.stdout.write(`\n── ${name} ─ ${description}\n\n`);

  const startedAt = Date.now();
  const result = spawnSync('npm', ['run', name], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: true,
  });
  const durationMs = Date.now() - startedAt;
  const ok = result.status === 0;

  results.push({ name, ok, durationMs });

  if (!ok) {
    failed = name;
    break;
  }
}

// ---------------------------------------------------------------- summary

const pad = Math.max(...results.map((result) => result.name.length), 12);

console.log('\n' + '─'.repeat(pad + 20));
for (const { name, ok, durationMs } of results) {
  const seconds = (durationMs / 1000).toFixed(1).padStart(6);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(pad)} ${seconds}s`);
}

const notRun = steps.length - results.length;
if (notRun > 0) {
  console.log(`\n${notRun} step(s) not run after the failure above.`);
}
console.log('─'.repeat(pad + 20));

if (failed) {
  console.error(`\nverify FAILED at "${failed}".`);

  if (required) {
    console.error(
      `\nIf the failure is the Angular CLI refusing to start, this workspace ` +
        `requires Node ${required} and is running ${nodeVersion}.`,
    );
  }

  console.error('');
  process.exit(1);
}

console.log('\nverify PASSED.\n');
