# 0007 — Components are directives on native elements

**Status:** Accepted · **Date:** 2026-08-20

## Context

A UI library has to choose what a "component" is. The common approach wraps
native elements in custom elements:

```html
<nx-button variant="solid">Save</nx-button>
```

which renders something like

```html
<nx-button variant="solid" _nghost-abc>
  <button class="nx-button-inner" _ngcontent-abc>
    <span class="nx-button-label" _ngcontent-abc>Save</span>
  </button>
</nx-button>
```

Three elements plus encapsulation attributes where the author wrote one
concept. That structure then has to be documented, worked around in CSS, and
targeted carefully in tests.

## Decision

**Noxra components are directives applied to native elements, and add no DOM.**

```html
<button nxButton variant="outline">Save</button>
```

renders

```html
<button class="nx-button nx-button--enabled" data-variant="outline" data-size="md">Save</button>
```

Every foundation component follows this: `button[nxButton]`,
`input[nxInput]`, `[nxCard]`, `[nxBadge]`, `[nxSpinner]`. Even the button's
loading indicator is a `::before` pseudo-element, so a loading button is still
exactly one node.

Selectors are constrained to the elements a component actually supports —
`input[nxInput], textarea[nxInput], select[nxInput]`, not bare `[nxInput]` — so
the directive cannot be applied where its guarantees do not hold.

**This rule has a boundary.** A component is correct when it genuinely owns DOM
the consumer cannot reasonably write: a Dialog's backdrop and positioning
container, a Select's listbox. The test is whether the consumer _could_
reasonably write the markup themselves. For a button, they obviously can.

## Consequences

Good:

- **Accessibility mostly comes free.** A real `<button>` handles focus,
  activation, `form` participation, and assistive-technology semantics. Noxra
  does not re-implement any of it, so it cannot re-implement it wrongly.
- **The inspector shows your markup.** Debugging is straightforward.
- **CSS overrides are ordinary CSS.** No encapsulation attributes to work
  around.
- **E2E selectors are stable**, because they target the element the author
  wrote.
- **The author keeps element choice.** `nxCard` works on `<article>`,
  `<section>`, `<div>` or `<button>` — which is what makes the interactive card
  a real button instead of a div with a role bolted on.
- Smaller DOM, and less work per render.

Bad, and accepted:

- **Directives cannot have `styleUrl`.** This forces global CSS — see
  [0001](0001-styling-architecture.md). It is the largest consequence of this
  decision.
- **The consumer must pick the right element.** `<div nxButton>` does not match
  the selector, which is deliberate; but nothing stops a consumer from choosing
  `<a nxButton>` where a `<button>` was meant. Constrained selectors limit this,
  documentation handles the rest.
- **No content projection**, so a directive cannot restructure what it is given.
  Fine for these components; the reason Dialog will be a component.
- **Attribute-based state is more verbose to bind** than a single input driving
  an internal template.

## Alternatives rejected

**Wrapper components (`<nx-button>`).** Extra DOM, encapsulation attributes,
harder overrides, and the wrapper still has to forward every native attribute,
event and ARIA property to the inner element — forwarding that is never quite
complete.

**Both, per component.** Two APIs for one concept, and consumers would have to
learn which components are which. Consistency is worth more.

**Web components / custom elements.** Would give framework portability, at the
cost of the Angular-native signal and DI integration that is the point of
Noxra, plus meaningful SSR and hydration complexity.

## Outcome (2026-08-20)

The rule held further than expected, and its own example was wrong.

Dialog was named above as a case that would need a component, for "a Dialog's
backdrop and positioning container". It needed neither. The native `<dialog>`
supplies the backdrop as a pseudo-element and the top layer as positioning, so
`NxDialog` is a directive that emits no DOM at all. Tooltip, not predicted here,
turned out to need the Popover API plus CSS anchor positioning — also no
positioning container.

The two components that did cross the boundary crossed it for a different
reason than DOM complexity:

- **Alert** renders a dialog the consumer never writes, because the whole point
  of an imperative `confirm()` is that the call site is one line of TypeScript.
- **Tooltip** creates its bubble, because a tooltip has no element to attach
  its text to.

So the useful test is not "is this markup complicated" but **"would the
consumer write this markup at all?"** Both create exactly one element, lazily,
and neither restructures what it was given.
