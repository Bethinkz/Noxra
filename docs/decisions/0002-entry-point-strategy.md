# 0002 — Single entry point, structured for splitting later

**Status:** Accepted · **Date:** 2026-08-20

## Context

Angular libraries can publish secondary entry points — `@noxra/ui/button`,
`@noxra/ui/dialog`, `@noxra/ui/tokens`. Each one is a directory with its own
`ng-package.json`, its own bundle, and its own place in the `exports` map.

They are attractive early because they look like they help tree shaking. Mostly
they do not: modern bundlers already drop unused exports from a single FESM
bundle when `sideEffects: false` is set.

## Decision

Ship **one entry point**, `@noxra/ui`, plus published stylesheet paths under
`@noxra/ui/styles/*`.

Structure the library so splitting later is mechanical rather than a rewrite:

- Clear internal boundaries — `core/`, `primitives/`, `components/` — with
  dependencies pointing one way only.
- No cross-imports between components.
- `public-api.ts` lists every export explicitly, so the surface of a future
  entry point can be read off the file.
- `sideEffects: false`, so tree shaking works today.

## Consequences

Good:

- One bundle to build, test, version and document.
- Consumers have one import path to remember, and coding agents have one to get
  right.
- Tree shaking already works: the showcase's `input-page` chunk is 36 kB
  because _it_ imports `@angular/forms`, while pages that do not are under 4 kB.
- No `ng-package.json` proliferation, and no risk of an accidental cross-entry
  import producing a duplicated bundle.

Bad, and accepted:

- Consumers cannot express "I only depend on Button" at the import path level.
  Bundlers make this mostly cosmetic.
- Splitting later is a breaking change for anyone who deep-imports — but deep
  imports are already blocked by the `exports` map, so in practice it is not.

## When to revisit

Split when one of these is actually true, not before:

1. A component needs a dependency the rest of the library must not carry — a
   Dialog needing `@angular/cdk` overlay is the likely first case. A secondary
   entry point can scope that peer dependency to the people who use it.
2. The bundle grows large enough that per-entry-point builds meaningfully
   improve build or test times.
3. Measured evidence that tree shaking is failing for real consumers.

`@noxra/ui/tokens` is the most plausible first split, since design tooling may
want the token contract without pulling in Angular at all.

## Alternatives rejected

**Entry point per component from day one.** Real cost — build complexity, more
config files, more ways to get the `exports` map wrong — for a benefit bundlers
already provide. This is the premature-generality trap the architecture is
explicitly trying to avoid.

**No entry points, one giant module.** Already what this is, minus the
boundaries. The boundaries are the part worth having.
