# 0006 — Angular forms integration via CSS, with no dependency

**Status:** Accepted · **Date:** 2026-08-20

## Context

`NxInput` needs to look invalid when the control is invalid. Validity can come
from at least four places:

1. The application, which knows something the control does not.
2. `aria-invalid`, set by whatever owns the ARIA state.
3. Native constraint validation — `required`, `type="email"`, `pattern`.
4. Angular forms, reactive or template-driven.

The conventional approach is to inject `NgControl` with `{ optional: true }` and
derive validity from `control.invalid && control.touched`.

That has a real cost. Importing `NgControl` is a value import of
`@angular/forms`, so every consumer pays for the forms package whether or not
they use forms, and Noxra gains a third peer dependency that must be
Angular-ready before Noxra can be. It also couples Noxra to Angular's
`Observable`-based control status at exactly the moment Angular is developing a
signal-based forms API — which would mean writing the coupling twice.

## Decision

**Do not import `@angular/forms`.** Handle every source of validity in CSS:

```css
.nx-input[data-invalid],          /* explicit: the `invalid` input */
.nx-input[aria-invalid='true'],   /* whatever owns the ARIA state */
.nx-input:user-invalid,           /* native validation, post-interaction */
.nx-input.ng-invalid.ng-touched {
  /* Angular forms, via classes it emits */
  border-color: var(--nx-state-danger);
}
```

The fourth selector is the key: Angular forms **already** puts `ng-invalid`,
`ng-touched`, `ng-dirty` and friends on the native element. Noxra reads what is
already there rather than asking Angular for it.

`NxInput` therefore has one validity input, `invalid`, for the case where the
application owns the decision. It sets `aria-invalid` only when that input is
true, leaving the attribute free for others to own.

## Consequences

Good:

- Forms integration costs **zero bytes and zero dependencies**. Verified: the
  showcase's `input-page` chunk is 36 kB because that page imports
  `@angular/forms`, while every other page is under 4 kB. The library itself
  contributes none of it.
- Works identically with reactive forms, template-driven forms, native
  validation, and no forms at all.
- No `ControlValueAccessor`, so the native element keeps its own value and
  events. Nothing is intercepted, so nothing can be intercepted incorrectly.
- Immune to Angular's forms API evolving. Signal-based forms will still put
  classes on the element.
- `:user-invalid` gives better default behaviour than most implementations —
  the error appears after interaction, not on first paint.

Bad, and accepted:

- Depends on Angular's `ng-*` class names, which are undocumented-ish public
  behaviour. They have been stable since AngularJS and changing them would break
  most of the ecosystem, so the risk is low — and the failure mode is cosmetic
  (a missing border colour), not functional.
- Cannot express validity rules Angular expresses but CSS cannot, such as "only
  after submit". An application can add `[invalid]` for those.
- No automatic `aria-invalid` for Angular forms controls. Applications wanting
  it must bind it, which is arguably correct: Noxra should not silently own an
  ARIA attribute on an element it does not control.

## Alternatives rejected

**Inject `NgControl` optionally.** The conventional solution. Costs a peer
dependency for every consumer, couples to an API mid-evolution, and buys little
that the class hooks do not already provide.

**Implement `ControlValueAccessor`.** Much heavier: Noxra would intercept value
flow, and any bug in that interception breaks the consumer's form. There is no
reason to intercept a native input's value.

**A separate `@noxra/ui/forms` entry point.** Reasonable if the CSS approach
proves insufficient. Deferred until there is evidence it is.
