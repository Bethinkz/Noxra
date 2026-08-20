# 0008 — Motion stays in the core package, on one version

**Status:** Accepted · **Date:** 2026-08-20

## Context

Noxra's headline differentiator is supporting each new stable Angular release as
close to release day as practical. Anything that can delay a core release
therefore threatens the entire product position, not just one feature.

Motion is the most plausible place for such a delay to appear. The concern
raised was concrete: animation libraries lag new framework versions, sometimes
by three to four months, and application developers could be building against
the core long before that. Should motion be split onto its own version so the
core can ship on day zero regardless?

The premise deserves checking before the conclusion is accepted.

| Package                                 | Angular peer range                       | Can it lag Angular?                                               |
| --------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| `@angular/animations`                   | `@angular/core: 22.1.3` — pinned exactly | No. It _is_ Angular, released the same day.                       |
| `@angular/cdk`                          | `^22.0.0 \|\| ^23.0.0`                   | No. It ships day-0 and pre-declares the next major.               |
| `gsap`                                  | none                                     | No. It has no peer dependencies and does not know Angular exists. |
| A third-party `ngx-*` animation wrapper | `^22.0.0`                                | **Yes.** This is the real risk.                                   |

The lag is not a property of animation. It is a property of **Angular-specific
third-party packages**. Noxra's bundle currently imports exactly
`@angular/core` and `@angular/common`; its entire motion implementation is CSS
custom properties plus a 95-line service with no dependencies at all.

So today there is nothing to split, and the thing that would cause the lag is a
dependency choice, not a packaging choice.

## Decision

**Motion stays in `@noxra/ui`, on the same version as everything else.**

The guarantee that a lagging dependency cannot block a core release comes from
three rules, in this order:

**1. Core may not depend on anything carrying an Angular peer range.**
Already mechanically enforced: `tools/check-package.mjs` reads the built bundle
and fails on any import that is not a declared peer dependency or `tslib`. That
is an allowlist, not a denylist, so core cannot acquire a lagging dependency by
accident — only by someone editing `peerDependencies`, which is visible in
review.

**2. When motion needs JavaScript, prefer things that structurally cannot lag.**
In order: the Web Animations API and CSS (native, no version at all); Angular's
own built-ins such as `animate.enter` / `animate.leave` (ship with Angular);
framework-agnostic libraries with no peer dependencies. Reach for an
Angular-specific package only with an ADR explaining why the first three do not
work.

**3. Separate the two things currently called "motion".** The useful boundary
is not _motion versus core_, it is:

- **Motion system** — tokens, reduced-motion resolution, the transitions on
  components. Zero dependencies, always in core, always shippable on day zero.
  This is what makes components feel right; a Noxra without it is not Noxra.
- **Motion choreography** — orchestrated enter/exit, FLIP, shared-element
  transitions, spring physics. This is the only place a dependency would ever
  appear, and it goes behind the secondary entry point `@noxra/ui/motion` when
  it is built — same package, same version, tree-shakeable, with any dependency
  declared as an _optional_ peer scoped to that entry point.

Under rule 3, an unsupported choreography dependency costs one entry point, not
the release.

## Promotion triggers

Split into a separately versioned `@noxra/motion` package only when at least
one of these is actually true — not in anticipation:

1. Choreography genuinely requires a dependency with an Angular peer range, and
   rules 1–2 have been exhausted.
2. Motion needs a materially different release cadence from core, evidenced by
   real releases rather than an expectation of them.
3. A consumer can demonstrate that the entry point is not being tree-shaken.

Record the trigger in a superseding ADR when it fires.

## Consequences

Good:

- One version, one changelog, one compatibility claim. The support matrix stays
  one-dimensional: Noxra × Angular.
- The token contract stays in one place. Motion tokens are consumed by
  components, so splitting motion out would force either duplication of the
  contract or a third shared package.
- Day-0 shipping is already guaranteed by an automated check rather than by
  discipline.
- Motion stays a first-class feature rather than an optional add-on, which is
  what the product claims it is.

Bad, and accepted:

- If a lagging dependency ever does become unavoidable, the split will be more
  work then than doing it now. The promotion triggers exist so that decision is
  quick rather than re-litigated, and rules 1–2 make the case unlikely.
- Consumers cannot pin motion independently of core. No one has asked to, and
  the entry point gives them the bundle-size outcome they would actually want.

## Alternatives rejected

**Separate `@noxra/motion` package now.** Turns the compatibility matrix
two-dimensional — `@noxra/ui` × `@noxra/motion` × Angular. Noxra's position is
that compatibility is a claim backed by passing checks, so more dimensions mean
more CI combinations that must genuinely be run. It makes the day-0 claim
_harder_ to make honestly, which is the opposite of the intent. It also splits
the token contract, which is the trap
[0002](0002-entry-point-strategy.md) already warns about.

**Secondary entry point now.** Correct eventually, premature today: there is no
choreography code to put in it and no dependency to isolate. An entry point
holding a 95-line dependency-free service is structure without benefit. It also
would not solve the stated problem on its own — one entry point still means one
version and one release train.

**Independent versioning without splitting the package.** Not expressible in
npm, and it would make `ng update` and the peer range incoherent.
