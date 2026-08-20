# Angular compatibility

Noxra's goal is to support each new stable Angular release as close to release
day as practical, and to be honest about which versions have actually been
tested.

## Current status

|                              |                                                              |
| ---------------------------- | ------------------------------------------------------------ |
| **Built and tested against** | Angular **22.1.x**                                           |
| **Declared peer range**      | `^22.0.0` for `@angular/common` and `@angular/core`          |
| **TypeScript**               | `~6.0.x`                                                     |
| **Node**                     | `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0`                       |
| **Change detection**         | Zoneless. No `zone.js` dependency anywhere in the workspace. |
| **Test runner**              | Vitest via `@angular/build:unit-test`                        |

Angular 21 and Angular 23 are **not** claimed. Not because they are known to
fail, but because they have not been run through `npm run verify`, and an
untested claim is worse than no claim.

## The principle

> Compatibility is a claim about passing checks, not about a permissive semver
> range.

A wide peer range with no CI behind it converts a maintainer's optimism into a
user's runtime error. Noxra widens its peer range only after `npm run verify`
passes on the new version, in CI, on a real matrix job.

## What makes fast adoption possible

The reason Noxra can validate a new Angular quickly is that it has very little
attack surface for Angular to break.

**No private APIs.** No `ɵ`-prefixed import, anywhere. Private APIs are exactly
what breaks silently between minors.

**No undocumented DOM assumptions.** The library never inspects Angular's
generated markup, never relies on attribute ordering, and never depends on
comment-node placement. The host element's tag name comes from the public
`HOST_TAG_NAME` token rather than from reading `nativeElement.tagName`.

**Almost no dependencies.** One runtime dependency (`tslib`) and two peers.
Every third-party dependency is a package that must itself be Angular-22-ready
before Noxra can be; each one you do not have is a release you do not have to
wait for. `npm run check:package` enforces this by reading the built bundle and
failing on any import that is not a declared peer or `tslib`.

**Zoneless-first.** Nothing depends on `NgZone` or Zone patching for
correctness. Change detection strategy shifts are among the largest Angular
migrations; Noxra is already on the far side of that one.

**Directive-first components.** Less generated DOM means fewer places for a
compiler change to alter output.

**CSS-based motion.** No dependency on `@angular/animations`, so animation
package changes cannot affect Noxra.

## What must be true before claiming a version

Every one of these, on the version in question:

1. `npm run build:lib` — library builds in Angular Package Format, partial
   compilation mode.
2. `npm run typecheck` — TypeScript project references compile.
3. `npm run test` and `npm run test:showcase` — unit tests pass.
4. `npm run check:tokens` — the token contract is intact.
5. `npm run check:contrast` — every theme still meets WCAG AA.
6. `npm run check:package` — package shape and dependency graph are correct.
7. `npm run build:showcase` — the showcase builds **and prerenders**, which
   runs every route through server rendering.
8. `npm run verify:ssr` — the built SSR server boots and renders per request.
9. `npm run lint` — including Angular template rules.

`npm run verify` runs all of it in dependency order. That command is the gate.

## Support policy

| Track        | Meaning                                                                        | CI                                                      |
| ------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| **Current**  | The latest stable Angular. Fully supported.                                    | Every push and PR; must pass.                           |
| **Previous** | The preceding major. Supported while it is in Angular's active support window. | Scheduled; must pass before the peer range mentions it. |
| **Next**     | `@angular/*@next` — prereleases and release candidates.                        | Scheduled and manual; **allowed to fail.**              |

The `next` job exists to give early warning, not to gate merges. A red `next`
job is information about the future, not a broken build — which is why it is
`continue-on-error`. When it goes red, that is the signal to start work, well
before the stable release lands.

## CI matrix

`.github/workflows/ci.yml` has two jobs:

- **`verify`** — the gate. Runs the full pipeline on the pinned Angular from
  the lockfile, on every push and pull request. Required for merge.
- **`angular-matrix`** — runs the same pipeline against other Angular versions.
  Scheduled weekly and manually dispatchable, since prereleases move too often
  to run per-PR. It currently holds a single `next` entry marked
  `experimental: true`, which makes it `continue-on-error`.

The matrix is the extension point: supporting another version is one entry in
`strategy.matrix.include`, not a new job. Drop `experimental` and the version
becomes a gate. `previous` is deliberately absent until it has actually been
made to pass — Noxra does not list a version it has not run.

## Adopting a new Angular version

1. Add the version to `angular-matrix` as an `experimental` entry, run the job,
   and read the failures.
2. Update dependencies with `ng update @angular/core @angular/cli`, which runs
   Angular's own migration schematics.
3. Fix what `npm run verify` reports.
4. Widen the peer range in `projects/noxra/package.json` **only now**.
5. Add the version to the CI matrix so it stays tested.
6. Record anything surprising in `docs/decisions/`.

## Migrations

If a Noxra release requires a consumer code change, it ships with a migration
schematic runnable via `ng update @noxra/ui`. Noxra is young enough that none
exist yet, but the packaging is already correct for adding them.

Deprecations get one full major of overlap: deprecated in N, removed in N+1, and
the deprecation carries the replacement in its message.

## Notes from the current version

Things worth knowing, discovered while building against Angular 22.1.x.

**`allowedHosts` defaults to empty, which denies everything.** The application
schematic generates `security.allowedHosts: []`, and Angular's SSR host
validation treats that as an allowlist with nothing on it — the built server
rejects every request, including from `localhost`. This is secure-by-default and
intentional, but it means the showcase must name its hosts explicitly. Any
deployment must do the same.

**`tsc -b` needs an explicit `rootDir` under TypeScript 6.** The generated
project tsconfigs set `outDir` without `rootDir`, which TS 6.0 reports as
TS5011. Angular's own builders do not use `tsc -b`, so the schematic default is
fine for them; the workspace tsconfigs here set `rootDir: "src"` so
`npm run typecheck` works.

**Host listeners type `$event` as `Event`.** With
`typeCheckHostBindings: true`, a host listener bound to `keydown` receives
`Event`, not `KeyboardEvent`, so handlers narrow the type themselves rather
than widening the binding with `$any`.

**`stopImmediatePropagation()` does not stop a sibling Angular listener.**
Angular dispatches multiple listeners on the same element itself. A directive
host listener runs _before_ a consumer's `(click)` on the same element, but
calling `stopImmediatePropagation()` there does **not** prevent the consumer's
handler from running. Any guard built on that ordering would be silently
unreliable — which is why `NxButton` prevents the event from being generated
(pointer-events plus a `keydown` guard) rather than trying to stop one that
already exists.
