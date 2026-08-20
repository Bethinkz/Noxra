# Noxra

An Angular-native UI library and design system.

> **Early development.** This repository contains a foundation and a first
> visual pass: architecture, a design-token system, a motion system, five
> components and a verification pipeline. It is not published to npm and the
> API is unstable. Do not use it in production.

## What it is

Noxra is a UI library built for Angular rather than adapted to it.

- **Angular 22**, zoneless, signal-based APIs, no `zone.js` anywhere.
- **Directive-first.** Components enhance native elements and add no DOM.
  `<button nxButton>` renders one `<button>`.
- **Semantic design tokens.** Components consume token names; themes assign
  values. Four themes ship, and a custom theme is just a CSS rule.
- **Motion as a system.** Every animation reads a token, so reduced motion is
  handled in one place instead of in every component.
- **SSR-safe by construction**, and verified — the showcase prerenders every
  route on each build.
- **Two peer dependencies and one runtime dependency**, enforced by a check
  that reads the built bundle. Dialogs, alerts and tooltips are built on the
  native `<dialog>`, the Popover API and CSS anchor positioning, so even the
  overlays need no positioning library.
- **No Tailwind, no CSS framework, no build step** for consumers.

## Status

| Area                        | State                                                       |
| --------------------------- | ----------------------------------------------------------- |
| Workspace, build, packaging | Working                                                     |
| Design tokens and theming   | 86 tokens, 4 themes, contract + WCAG AA enforced            |
| Motion system               | Tokens, reduced-motion, looping motion                      |
| Components                  | Button, Input, Card, Badge, Spinner, Dialog, Alert, Tooltip |
| Tests                       | 84 specs: jsdom, browser, SSR                               |
| SSR                         | Prerender + per-request rendering, both verified            |
| CI                          | GitHub Actions, with an Angular version matrix              |
| Visual design               | Real palette, type scale and motion values                  |
| Published to npm            | No                                                          |

## Requirements

Node `^22.22.3 || ^24.15.0 || >=26.0.0`. Angular 22's CLI refuses to start
below this — it is a hard error, not a warning. `.nvmrc` pins a known-good
version.

## Getting started

```bash
nvm use
npm install
npm run build:lib
npm start
```

The showcase runs at `http://localhost:4200`. `build:lib` is needed first
because the showcase resolves `@noxra/ui` from `dist/`, exactly as a real
consumer would.

## Commands

| Command                  | What it does                                              |
| ------------------------ | --------------------------------------------------------- |
| `npm start`              | Serve the showcase with hot reload                        |
| `npm run watch:lib`      | Rebuild the library on change (run alongside `npm start`) |
| `npm run build:lib`      | Build `@noxra/ui` in Angular Package Format               |
| `npm run build:showcase` | Build the showcase, including SSR prerendering            |
| `npm run build`          | Both of the above                                         |
| `npm test`               | Library unit tests                                        |
| `npm run test:watch`     | Library tests in watch mode                               |
| `npm run test:showcase`  | Showcase unit tests                                       |
| `npm run test:browser`   | Browser tests — real DOM behaviour jsdom cannot see       |
| `npm run typecheck`      | TypeScript project references                             |
| `npm run lint`           | ESLint, including Angular template rules                  |
| `npm run format`         | Prettier, write                                           |
| `npm run check:tokens`   | Design token contract parity (CSS ↔ TypeScript)           |
| `npm run check:contrast` | WCAG AA contrast across every theme                       |
| `npm run check:package`  | Published package shape and dependency graph              |
| `npm run verify:ssr`     | Boot the built SSR server and check rendered output       |
| **`npm run verify`**     | **Everything above, in order. The confidence gate.**      |

`verify` supports `--list`, `--only=`, `--skip=` and `--from=` for iterating on
a failure. CI always runs it whole.

## Project structure

```
noxra/
├─ projects/
│  ├─ noxra/                    the @noxra/ui library
│  │  └─ src/
│  │     ├─ public-api.ts       the entire public surface, listed explicitly
│  │     ├─ lib/
│  │     │  ├─ core/            tokens, theme, motion, a11y, utilities
│  │     │  ├─ primitives/      reusable behaviour (empty, deliberately)
│  │     │  └─ components/      button, input, card, badge, spinner
│  │     └─ styles/             published CSS: tokens, themes, base, components
│  └─ showcase/                 development playground and first consumer (SSR)
├─ docs/                        architecture, tokens, motion, compatibility
│  └─ decisions/                ADRs
├─ tools/                       verification scripts
└─ .github/workflows/           CI
```

## Using it (once published)

```ts
import { NxButton, NxCard, provideNoxra } from '@noxra/ui';
```

```json
// angular.json
"styles": ["@noxra/ui/styles/noxra.css", "src/styles.css"]
```

That is all that is required — the default theme binds to `:root`, so a themed
application needs no providers. Add `provideNoxra()` only to choose a
non-default theme or motion policy:

```ts
bootstrapApplication(App, {
  providers: [provideNoxra({ theme: 'neon' })],
});
```

```html
<button nxButton>Save</button>
<button nxButton variant="outline" size="sm">Cancel</button>
<button nxButton [loading]="saving()">Publish</button>

<input nxInput placeholder="Email" />

<article nxCard>
  <header nxCardHeader>Deployment <span nxBadge variant="accent">live</span></header>
  <div nxCardBody>Rolled out to 3 regions.</div>
</article>
```

## Documentation

| Document                                                  | Contents                                         |
| --------------------------------------------------------- | ------------------------------------------------ |
| [architecture.md](docs/architecture.md)                   | Structure, boundaries, DOM philosophy, SSR rules |
| [design-tokens.md](docs/design-tokens.md)                 | Token contract, themes, runtime overrides        |
| [motion.md](docs/motion.md)                               | Motion tokens and reduced motion                 |
| [angular-compatibility.md](docs/angular-compatibility.md) | Version support policy and CI matrix             |
| [component-guidelines.md](docs/component-guidelines.md)   | API conventions                                  |
| [component-template.md](docs/component-template.md)       | Spec template for new components                 |
| [contributing.md](docs/contributing.md)                   | Setup and workflow                               |
| [decisions/](docs/decisions/)                             | ADRs                                             |

## Not in this milestone

Data Table, Date Picker, Calendar, Tree, Select, Combobox, Command Palette,
file upload, charts, overlays and dialogs. Also motion choreography: the
motion _system_ is in place, but entrance and exit sequences only become real
once there are overlays to sequence. The architecture exists so those can be
built correctly, not quickly.

## Licence

MIT
