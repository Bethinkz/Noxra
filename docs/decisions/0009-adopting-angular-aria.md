# 0009 — Adopting Angular Aria, behind a secondary entry point

**Status:** Accepted · **Date:** 2026-08-21

## Context

[0004](0004-aria-and-cdk-strategy.md) set an escalation order — platform, then
public Angular APIs, then `@angular/aria`, then `@angular/cdk` — and said the
platform-versus-dependency call belonged to the components that needed it.

Those components have now arrived, and the platform won more often than
expected. Modal dialogs needed nothing: `<dialog>` supplies the top layer,
focus trapping, focus restoration, `inert` and Escape. Tooltips needed nothing:
the Popover API plus CSS anchor positioning place them, collision-aware,
without JavaScript. Accordions needed nothing: `<details>` with a shared `name`
is a single-open accordion, and browsers even expand a closed one for
find-in-page.

Tabs are where that runs out. There is no native tab widget, and the pattern is
not small: roving tabindex, arrow-key navigation that respects orientation
_and_ text direction, wrap-around, Home/End, typeahead, and `tab`/`tablist`/
`tabpanel` relationships wired in both directions. It is specified in detail by
WAI-ARIA and it is routinely got wrong — a tab list where every tab is a tab
stop is one of the most common accessibility defects on the web.

`@angular/aria` ships that behaviour as headless attribute directives
(`[ngTabs]`, `[ngTabList]`, `[ngTab]`, `[ngTabPanel]`), maintained by the
Angular team and released in lockstep with Angular. It peer-depends on
`@angular/cdk`, pinned exactly, so adopting one adopts both.

## Decision

**Adopt `@angular/aria` for composite widgets, behind the secondary entry point
`@noxra/ui/aria`.**

- `@angular/aria` and `@angular/cdk` are declared as **optional** peer
  dependencies. An application that never imports from `@noxra/ui/aria` never
  installs them and never pays for them.
- Noxra composes rather than re-exports. Each directive applies the Aria
  behaviour with `hostDirectives` and adds a class, so the consumer writes
  `nxTabList` and the rendered DOM is still exactly the element they wrote —
  the same property every other Noxra component has.
- **Aria owns behaviour and ARIA attributes; Noxra owns appearance.** The
  stylesheet sets no role and no `aria-*`, and keys off `data-selected` rather
  than `aria-selected`, so the two can never disagree about state.
- Inputs are forwarded through `hostDirectives` rather than re-declared, so
  there is no second copy of the API to drift.

This is the first secondary entry point, and it fires trigger 1 in
[0002](0002-entry-point-strategy.md) exactly as written: _a component needs a
dependency the rest of the library must not carry._

## Consequences

Good:

- Tabs get a correct, maintained implementation of a pattern that is hard to
  get right, instead of a worse copy.
- The main bundle is unchanged: still `@angular/core` and `@angular/common`
  only. Verified, not assumed — `npm run check:package` now reads _both_
  bundles and fails if the main one imports an optional peer, or if the
  optional peers are not marked optional.
- Neither dependency can delay a Noxra release: both ship the day Angular does,
  which is the test [0008](0008-motion-packaging-and-release-cadence.md) sets.
- Menu, Listbox and Combobox have somewhere to go, and the composition pattern
  is now established for them.

Bad, and accepted:

- A second entry point to build, document and version. It stays one version and
  one release train, so the compatibility matrix does not gain a dimension.
- Consumers of `@noxra/ui/aria` install two more packages. That is the point:
  the cost lands on the people using the feature.
- Noxra's API is now a thin layer over someone else's. If Aria's API changes,
  the forwarded inputs change with it. Acceptable, because the alternative is
  owning the behaviour, and Angular's team is better placed to.

## Alternatives rejected

**Write the tab behaviour in Noxra.** Roughly the amount of code that looks
small and is not. Reimplementing a WAI-ARIA pattern that Angular already ships,
in a library whose stated policy is to prefer what already exists, would
contradict the approach that has served every other component here.

**Put Tabs in the main entry point.** Simpler to build, and it would force
`@angular/aria` and `@angular/cdk` on every consumer including those who only
wanted a Button — exactly what [0004](0004-aria-and-cdk-strategy.md) said not
to do.

**One entry point per component** (`@noxra/ui/tabs`, `@noxra/ui/menu`, …).
Every one of them needs the same two dependencies, so splitting further
multiplies configuration without scoping anything additional.
