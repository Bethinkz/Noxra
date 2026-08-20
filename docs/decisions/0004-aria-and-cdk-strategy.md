# 0004 — Platform → Angular Aria → CDK, in that order

**Status:** Accepted · **Date:** 2026-08-20

## Context

Complex widgets — Select, Combobox, Dialog, Menu, Tabs, Tooltip — need
behaviour the platform does not fully provide: focus trapping, roving tabindex,
overlay positioning, typeahead, live regions.

Three sources exist, with genuinely different costs:

- **The web platform.** `:focus-visible`, `:user-invalid`, `inert`, `popover`,
  `<dialog>`, anchor positioning. Free, no dependency, no Angular coupling —
  but browser support varies and some of it is recent.
- **`@angular/aria`.** Official, focused on accessibility primitives, small,
  and versioned in lockstep with Angular.
- **`@angular/cdk`.** Official, mature, much broader, and correspondingly
  larger. Also versioned with Angular.

None of these is currently used: the foundation components are native elements
whose accessibility the browser already handles.

## Decision

Evaluate in this order, and take the first that genuinely solves the problem:

1. **The web platform.** If a modern CSS or HTML feature does it and support is
   adequate for Angular's browser support policy, use it. This is why the
   invalid state uses `:user-invalid` and focus uses `:focus-visible`.
2. **Public Angular APIs.** `HOST_TAG_NAME`, `afterNextRender`, `DOCUMENT`.
3. **`@angular/aria`**, for accessibility behaviour the platform lacks. This is
   the expected home for roving focus and list navigation.
4. **`@angular/cdk`**, only for genuinely complex behaviour that would be
   irresponsible to reimplement. Overlay positioning is the archetype: it is a
   deep problem with many edge cases, and CDK has solved it properly.
5. **A small internal Noxra utility**, when the need is narrow and the
   alternatives are disproportionate.

Neither Aria nor CDK becomes a blanket dependency. When one is needed, it is an
**optional peer dependency scoped to a secondary entry point** for the
components that require it — which is precisely the trigger for splitting an
entry point under [0002](0002-entry-point-strategy.md).

`npm run check:package` fails if either appears in the main bundle, so this
cannot happen by accident.

## Consequences

Good:

- Consumers using only Button, Input, Card and Badge never download overlay
  machinery.
- Both preferred escalations are Google-maintained and Angular-versioned, so
  neither delays an Angular upgrade the way a community dependency would.
- Preferring the platform keeps the DOM and the bundle small, and tends to
  produce better accessibility than a reimplementation.

Bad, and accepted:

- Judgement is required per component, and reasonable people will disagree
  about where a case sits. The component spec template forces the question to
  be answered in writing before implementation.
- Optional peer dependencies are a slightly rougher install experience for the
  components that need them.

## Notes

**Do not reimplement CDK Overlay.** If a component needs anchored, collision-
aware, scroll-aware positioning, use CDK. The one exception worth testing first
is CSS anchor positioning plus the popover API, which may make a large part of
this unnecessary — that evaluation belongs in the Dialog/Popover milestone.

**Do not reimplement focus trapping** without a very good reason. It is much
harder than it looks.

**Do reimplement trivia.** A visually-hidden class is nine lines of CSS; taking
a dependency for it would be absurd. That is why `NxVisuallyHidden` exists.
