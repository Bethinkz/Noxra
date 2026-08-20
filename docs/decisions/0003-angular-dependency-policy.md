# 0003 — Minimal dependencies, public Angular APIs only

**Status:** Accepted · **Date:** 2026-08-20

## Context

Noxra's central promise is fast Angular adoption: when a new stable Angular
lands, Noxra should be able to verify and support it almost immediately.

The two things that reliably prevent that are:

1. **Private Angular APIs.** `ɵ`-prefixed symbols carry no compatibility
   guarantee and change between minors, usually without a migration.
2. **Third-party dependencies.** Every dependency that touches Angular must
   itself be updated before Noxra can be. Noxra's adoption speed is bounded by
   its slowest dependency.

## Decision

**Peer dependencies.** `@angular/common` and `@angular/core`, ranged at
`^22.0.0` — one major, the one actually tested. The range widens only after
`npm run verify` passes on a new version in CI.

**Runtime dependencies.** `tslib` only.

**Private APIs.** None. No `ɵ`-prefixed import anywhere, and no reliance on
undocumented Angular DOM output — no assumptions about generated attributes,
attribute ordering, or comment-node placement.

**Adding a dependency** requires an ADR answering: what breaks without it, what
it costs consumers in bytes, whether it would delay an Angular upgrade, and
what happens if it becomes unmaintained.

**Enforcement is automated.** `npm run check:package` reads the built bundle and
fails if it imports anything that is not a declared peer or `tslib`. It also
explicitly rejects `@angular/forms`, `@angular/cdk`, `@angular/aria` and
`@angular/animations`, so any of those becoming a dependency has to be a
deliberate act that updates the check.

## Consequences

Good:

- Nothing outside Angular itself can block an Angular upgrade.
- Consumers install one small package.
- The "no private APIs" rule is trivially auditable, and the dependency rule is
  machine-checked rather than remembered.
- A narrow peer range means npm warns loudly on an untested combination instead
  of letting it fail at runtime.

Bad, and accepted:

- Noxra reimplements small things other libraries get from a dependency. Where
  the platform provides it, this is cheap. Where it does not — focus trapping,
  overlay positioning — it will not be, which is what
  [0004](0004-aria-and-cdk-strategy.md) is for.
- A narrow peer range means consumers on a newer Angular see a peer warning
  until Noxra ships an update. That is the intended signal: it is honest about
  what has been tested.

## Alternatives rejected

**Wide peer range (`>=20`).** Removes the warning by removing the information.
It converts a maintainer's optimism into a user's runtime error.

**Depend on `@angular/cdk` broadly.** CDK is high quality and Google-maintained,
so it updates promptly — but taking it as a blanket dependency means every
consumer pays for it whether or not they use a component that needs it. Scope
it to the components that genuinely need it instead.

**Vendor small pieces of CDK.** Copying code means inheriting its bugs without
its fixes.
