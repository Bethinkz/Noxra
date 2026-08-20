# 0001 — Global token-driven CSS, no view encapsulation

**Status:** Accepted · **Date:** 2026-08-20

## Context

Noxra needs a styling approach that supports runtime theming through CSS custom
properties, imposes no CSS framework on consumers, keeps DOM output predictable,
and lets consumers override styles without fighting the framework.

Angular's default is view-encapsulated component styles, which emit
`_ngcontent-*` attributes and scope selectors automatically. That is a good
default for applications. It is a poor fit here for a specific reason: Noxra's
components are directives on native elements (see
[0007](0007-directive-first-components.md)), and **directives cannot carry
`styleUrl` at all**. Only components can.

## Decision

All Noxra styling ships as **global, class-based, token-driven plain CSS**,
published alongside the library and imported by the consumer.

- Source lives in `projects/noxra/src/styles/`.
- The published tree at `dist/noxra/styles/` has an **identical layout**, so
  relative `@import` paths resolve the same in both.
- Component stylesheets are at `styles/components/<name>.css` — not colocated
  with their TypeScript.
- Consumers import `@noxra/ui/styles/noxra.css`, or compose from the
  individually published files.
- Plain CSS. No SCSS, no preprocessing, no build step.

## Consequences

Good:

- Overriding a Noxra style is ordinary CSS. No `::ng-deep`, no encapsulation
  attributes, no specificity war.
- Themes restyle everything through token values without reaching into any
  component.
- No per-component style injection at runtime, and no duplicated style blocks.
- The published CSS is a real, documented, individually importable artefact.
  An application can ship one theme and four components if that is all it uses.
- Consumers get plain CSS, so their toolchain needs nothing.

Bad, and accepted:

- **Styles are global.** A consumer can collide with `.nx-button`. Mitigated by
  the `nx-` prefix and by treating class names as public API.
- **Component CSS is not colocated with its TypeScript.** This is the real cost.
  Colocation would mean the source and published trees diverge, which would
  break the `@import` paths or require a build step to rewrite them. Stable
  paths won. The stylesheet is named in a comment at the top of every component
  file so the link is one search away.
- Consumers must remember to import the stylesheet. Without it, components are
  unstyled but still functional and accessible.

## Alternatives rejected

**View-encapsulated component styles.** Not available to directives at all, so
this would have forced every component to become a component — which would have
cost the predictable-DOM property that motivates the whole architecture.

**SCSS with a compile step.** Would have allowed colocated partials compiled
into one output file, giving both colocation and stable published paths. Real
ergonomic benefit, but it adds a preprocessing step, a dependency, and a source
tree that no longer matches what ships. Not worth it while the CSS is this
simple. If the stylesheet grows to the point where the duplication hurts, this
is the decision to revisit first.

**CSS-in-JS / constructable stylesheets.** Runtime cost, SSR complexity, and it
would make consumer overrides harder rather than easier.

**Tailwind.** Rejected as a dependency outright. Noxra must work without it.
Tailwind users can consume Noxra normally, since the tokens are plain custom
properties.
