# 0005 — Vitest, behaviour-level tests, contract checks in CI

**Status:** Accepted · **Date:** 2026-08-20

## Context

A UI library's tests have one job above all others: **detect breakage caused by
an Angular upgrade**. That is a different goal from an application's test suite,
and it implies different priorities. Coverage of every branch matters less than
covering the exact surfaces Angular touches — DOM output, host bindings, DI,
change detection, SSR.

Angular 22 ships Vitest as the default runner for new projects via
`@angular/build:unit-test`. Karma is gone.

## Decision

**Runner:** Vitest through `@angular/build:unit-test`, with jsdom. This is the
Angular-recommended stack, which matters more than familiarity — a runner
outside the supported path becomes an upgrade blocker itself.

**Level:** behaviour, through the public API. Mount components through a host
component with signal fields, so input changes travel the real binding path
rather than being poked onto an instance.

**What is worth testing.** In priority order:

1. Rendered DOM output, including the absence of unexpected nodes.
2. Inputs reflecting to the expected attributes and classes.
3. Disabled and loading behaving differently, and correctly.
4. Accessibility-relevant semantics — roles, ARIA, focusability.
5. That a component does **not** set state it does not own.
6. Service behaviour: theme application, motion resolution, token overrides.

**What is not.** No snapshot tests of markup — they fail on every cosmetic
change and teach people to re-record without reading. No coverage target. No
tests of private methods.

**Beyond unit tests.** Three checks in `npm run verify` catch classes of bug
unit tests cannot:

- `check:tokens` — CSS and TypeScript token contracts stay in sync, and no
  stylesheet references a token that does not exist.
- `check:package` — the published package shape and dependency graph are
  correct.
- `build:showcase` + `verify:ssr` — prerendering runs every route through
  server rendering at build time, then the built server bundle is booted and a
  per-request-rendered route is checked.

## Consequences

Good:

- On the supported path, so the runner does not become an upgrade blocker.
- Behaviour-level tests survive refactors and fail on real regressions. The
  suite already earned its keep: the button activation test caught that
  `stopImmediatePropagation()` does not stop a sibling Angular listener, which
  changed the implementation.
- SSR safety is verified by the build itself. A component that touches a
  browser global cannot be merged, because prerendering fails.
- The contract checks fail with actionable messages naming the exact file and
  token.

Bad, and accepted:

- jsdom is not a browser. It does not do layout, so `pointer-events: none`,
  focus rings and anything geometric are not testable there. Those need real
  browser tests, which this milestone does not have.
- No visual regression testing, so a theme change that ruins the look passes.

## Deferred

- **Browser-based tests** for focus behaviour, pointer interaction and layout.
  Vitest browser mode is the likely route.
- **Visual regression**, once the design is real enough to regress.
- **Accessibility assertions** with `axe-core` in CI.
- **Bundle size budgets** per component, to catch tree-shaking regressions.

## Alternatives rejected

**Karma + Jasmine.** Removed from Angular's supported path. Choosing it would
guarantee a future migration.

**Jest.** Works, but is not the Angular-recommended path and needs extra
configuration to handle Angular's ESM output.

**Testing internals directly.** Faster to write, and it locks in the
implementation — precisely wrong for a suite whose job is surviving upgrades.
