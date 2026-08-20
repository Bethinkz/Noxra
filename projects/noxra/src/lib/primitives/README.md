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

## Check Angular Aria before writing anything here

`@angular/aria` ships headless behaviour for accordion, combobox, grid,
listbox, menu, tabs, toolbar and tree, plus `ListNavigation`, `ListSelection`,
`ListTypeahead`, `ListFocus`, `GridFocus` and `KeyboardEventManager` — each
behind its own entry point, each with a testing harness, maintained by the
Angular team and released in lockstep with Angular.

That covers most of what this directory was originally expected to hold.
Building a Noxra version of any of it would be reimplementation, not
architecture. See
[docs/decisions/0004-aria-and-cdk-strategy.md](../../../../../docs/decisions/0004-aria-and-cdk-strategy.md).

What is plausibly left is behaviour that is genuinely Noxra's own: dismissal
policy (outside pointer / Escape) shared across overlays, and whatever glue the
DOM philosophy demands that a general-purpose library would not provide.
