# Primitives

Low-level, reusable **behaviour** — focus management, dismissal, roving
tabindex, overlay positioning, typeahead. The things several components will
need and that neither the platform nor Angular already provides.

## This directory is intentionally empty

The foundation components (Button, Input, Card, Badge, Spinner) needed nothing
here, and inventing a primitive before a second caller exists is how libraries
grow abstractions nobody wants:

- **Variant / size → class binding** repeats across Button, Badge and Card. It
  is three lines of `input()` plus a host binding. Three honest duplications
  read better than one indirection, so it stays duplicated.
- **Disabled state** is `:disabled` in CSS and the native attribute in the DOM.
  There is nothing to abstract.
- **Press and focus affordances** are `:active` and `:focus-visible`.
- **Reduced motion** is handled centrally by the motion tokens.

The boundary is declared now so that the _first_ real primitive has an obvious
home, and so nothing infrastructural leaks into `components/` in the meantime.

## Admission criteria

A primitive belongs here when all of the following hold.

1. It is behaviour, not appearance. Appearance belongs in `styles/`.
2. At least two components need it, or one component needs it and a second is
   specified. "We will probably want this" is not a caller.
3. The platform does not already provide it. Prefer `:focus-visible`,
   `inert`, `popover`, `dialog`, `:user-invalid` and friends.
4. Angular does not already provide it, and neither does `@angular/aria` or
   `@angular/cdk` — see `docs/decisions/0004-aria-and-cdk-strategy.md`.
5. It has no opinion about how it looks and emits no DOM of its own.

Expected first residents, once the components that need them exist: dismissal
(outside pointer / Escape), roving focus for composite widgets, and an overlay
positioning primitive for Dialog, Popover and Select.
