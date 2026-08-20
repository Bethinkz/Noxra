# Contributing

Noxra is in early development. The architecture is settled; the visual design
is not.

## Setup

Node `^22.22.3 || ^24.15.0 || >=26.0.0` — Angular 22's CLI refuses to start
below that, and it is not a soft warning. `.nvmrc` pins a known-good version.

```bash
nvm use && npm install
```

Then build the library once, because the showcase resolves `@noxra/ui` from
`dist/`:

```bash
npm run build:lib
```

## Working on the library

Run two terminals:

```bash
npm run watch:lib
```

```bash
npm start
```

The showcase reads library **stylesheets** straight from source, so CSS changes
appear on save without a library rebuild. TypeScript changes need
`watch:lib` to republish `dist/`.

## Before you push

```bash
npm run verify
```

This is the gate. It runs formatting, lint, the token contract check, the
library build, typecheck, both test suites, the package check, the showcase
build with prerendering, and the SSR smoke test — in that order, because later
steps consume earlier output.

While iterating, narrow it:

```bash
npm run verify -- --list
npm run verify -- --only=lint,test
npm run verify -- --from=build:lib
```

## Adding a component

1. **Write the spec first.** Copy [component-template.md](component-template.md)
   to `docs/specs/<component>.md` and answer every heading. The template exists
   because accessibility, SSR and DOM decisions are cheap to make deliberately
   and expensive to discover late.
2. Read [component-guidelines.md](component-guidelines.md).
3. Create `projects/noxra/src/lib/components/<name>/` with `<name>.ts`,
   `<name>.types.ts` if there are exported unions, and `<name>.spec.ts`.
   Do not create a file just to match the shape.
4. Add the stylesheet at `projects/noxra/src/styles/components/<name>.css` and
   `@import` it from `styles/noxra.css`.
5. Export it from `public-api.ts`.
6. Add it to `check-package.mjs`'s `requiredStyles` list.
7. Add a showcase page and a route.
8. `npm run verify`.

## Rules that are enforced, not suggested

These fail the build, so it is worth knowing them up front:

- **No hard-coded colours, durations or easings.** Use tokens.
  `check:tokens` fails on any `var(--nx-*)` that is not a declared token.
- **Every theme assigns every theme-owned token.** A partial theme is rejected.
- **No `prefers-reduced-motion` media query in a component.** That is the
  motion tokens' job.
- **No new runtime dependency.** `check:package` fails on any bundle import
  that is not a declared peer or `tslib`.
- **No private Angular API.** Nothing `ɵ`-prefixed.
- **No browser global outside `afterNextRender()`.** Prerendering fails the
  build if you slip.
- **Selector prefixes.** `nx` in the library, `app` in the showcase. ESLint
  enforces both.

## Decisions

Significant architectural choices get an ADR in [decisions/](decisions/).
Read [decisions/README.md](decisions/README.md) for what qualifies — the bar is
"would be expensive to reverse", not "was hard to decide".

Records are immutable. To change a decision, add one that supersedes it.

## Commits

Group by meaningful milestone. A commit should leave `npm run verify` passing.

## Angular upgrades

See [angular-compatibility.md](angular-compatibility.md). The short version: do
not widen the peer range until CI is green on the new version. Compatibility is
a claim about passing checks, not about a semver range.
