/**
 * Runs the browser-based test suite.
 *
 * Some of what Noxra promises is only true in a real browser, and jsdom cannot
 * see any of it: the top layer and focus trapping that `<dialog>` gives us,
 * whether `pointer-events: none` actually blocks a click, and whether a
 * transitioned property really lands on its new value after a theme swap.
 * Those are exactly the guarantees that would rot silently, so they get a
 * suite that runs where they are real.
 *
 * Playwright is installed without its bundled browsers - roughly 150MB we do
 * not need - so this points it at a Chrome that already exists. The Angular
 * builder reads `CHROME_BIN` and passes it through as Playwright's
 * `executablePath`.
 *
 * Run with `npm run test:browser`.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

/** Where a usable Chrome tends to live, per platform. */
const CANDIDATES = {
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env['LOCALAPPDATA']}\\Google\\Chrome\\Application\\chrome.exe`,
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome',
  ],
};

function resolveChrome() {
  const fromEnv = process.env['CHROME_BIN'];
  if (fromEnv) {
    if (!existsSync(fromEnv)) {
      console.error(`CHROME_BIN is set to "${fromEnv}", which does not exist.`);
      process.exit(1);
    }
    return fromEnv;
  }

  for (const candidate of CANDIDATES[process.platform] ?? []) {
    if (candidate && existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

const chrome = resolveChrome();

if (!chrome) {
  console.error(
    '\nNo Chrome found for the browser test suite.\n\n' +
      'Install Chrome, or set CHROME_BIN to an existing Chrome or Chromium\n' +
      'executable. Playwright is installed without its bundled browsers on\n' +
      'purpose, so it cannot fall back to one.\n',
  );
  process.exit(1);
}

console.log(`Browser tests using: ${chrome}\n`);

const result = spawnSync('npx ng run noxra:test-browser', {
  cwd: repoRoot,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, CHROME_BIN: chrome },
});

process.exit(result.status ?? 1);
