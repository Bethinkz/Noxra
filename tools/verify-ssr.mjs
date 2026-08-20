/**
 * SSR smoke test against the built showcase server.
 *
 * The production showcase build already prerenders every static route, which
 * means a component that touches a browser global fails the build. This script
 * covers the other half: that the server bundle actually boots, and that the
 * per-request render path produces real Noxra markup.
 *
 * Requires `npm run build:showcase` first. Run with `npm run verify:ssr`.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const serverEntry = join(repoRoot, 'dist/showcase/server/server.mjs');
const port = Number(process.env['NOXRA_SSR_PORT'] ?? 4123);
// Angular's SSRF protection validates the Host header against the build's
// `security.allowedHosts`. `localhost` is trusted by default; `127.0.0.1` is not.
const origin = `http://localhost:${port}`;
const startupTimeoutMs = 60_000;

if (!existsSync(serverEntry)) {
  console.error('dist/showcase/server/server.mjs is missing. Run `npm run build:showcase` first.');
  process.exit(1);
}

/**
 * Checks run against server-rendered HTML. Each asserts something that would
 * silently break if a component stopped being SSR-safe.
 */
const checks = [
  {
    path: '/',
    // Prerendered at build time, then served by the Node server.
    expect: [
      ['theme attribute is server-rendered', /<html[^>]*data-nx-theme="void"/],
      ['button directive applied server-side', /class="nx-button/],
      ['no unresolved token syntax leaked into markup', /^(?!.*\{\{).*$/s],
    ],
  },
  {
    path: '/motion',
    // RenderMode.Server: this one is rendered per request, on demand.
    expect: [
      ['theme attribute is server-rendered', /<html[^>]*data-nx-theme="void"/],
      ['spinner rendered server-side', /class="nx-spinner"/],
      ['spinner exposes its status role', /role="status"/],
      ['motion preference resolved on the server', /motion is (reduced|full)/],
    ],
  },
];

const child = spawn(process.execPath, [serverEntry], {
  cwd: repoRoot,
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
const captureOutput = (chunk) => {
  // Keep only the tail: a rejecting server can produce megabytes of noise.
  serverOutput = (serverOutput + chunk).slice(-4000);
};
child.stdout.on('data', captureOutput);
child.stderr.on('data', captureOutput);

let exited = false;
child.on('exit', (code) => {
  exited = true;
  if (code !== 0 && code !== null) {
    console.error(`SSR server exited early with code ${code}:\n${serverOutput}`);
  }
});

function shutdown() {
  if (!exited) {
    child.kill();
  }
}

process.on('exit', shutdown);
process.on('SIGINT', () => {
  shutdown();
  process.exit(130);
});

async function waitForServer() {
  const deadline = Date.now() + startupTimeoutMs;

  while (Date.now() < deadline) {
    if (exited) {
      throw new Error(`SSR server exited before becoming ready:\n${serverOutput}`);
    }

    try {
      // Any HTTP response means it is listening. A non-2xx status is a real
      // finding, so let the checks below report it instead of timing out here.
      await fetch(origin, { signal: AbortSignal.timeout(2000) });
      return;
    } catch {
      // Not listening yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`SSR server did not become ready within ${startupTimeoutMs}ms:\n${serverOutput}`);
}

const failures = [];

try {
  await waitForServer();

  for (const check of checks) {
    const response = await fetch(`${origin}${check.path}`, { signal: AbortSignal.timeout(20_000) });

    if (!response.ok) {
      failures.push(`GET ${check.path} responded ${response.status}`);
      continue;
    }

    const html = await response.text();

    for (const [description, pattern] of check.expect) {
      if (!pattern.test(html)) {
        failures.push(`GET ${check.path}: ${description}`);
      }
    }
  }
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  shutdown();
}

if (failures.length > 0) {
  console.error(`\nSSR verification failed with ${failures.length} problem(s):\n`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  console.error('');
  process.exit(1);
}

console.log(`SSR OK: ${checks.length} routes server-rendered with correct Noxra markup.`);
