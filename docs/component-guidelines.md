# Component guidelines

Consistency is a feature. A developer — or a coding agent — who has used one
Noxra component should be able to predict the next one without reading its
source.

## Directive or component?

**Default to a directive on a native element.** Use a component only when the
component genuinely owns DOM the consumer cannot reasonably write.

| Situation                                     | Choice                        | Example                |
| --------------------------------------------- | ----------------------------- | ---------------------- |
| Enhancing an existing native element          | Directive, attribute selector | `button[nxButton]`     |
| Element choice belongs to the author          | Directive                     | `[nxCard]`             |
| Component owns non-trivial internal structure | Component, element selector   | a future `<nx-dialog>` |

If a "component" would render a single element with a class on it, it is a
directive.

## Selectors

- Directives: `camelCase` attribute, `nx` prefix — `nxButton`, `nxCardHeader`.
- Components: `kebab-case` element, `nx-` prefix — `nx-dialog`.
- Constrain the selector to the elements the component actually supports:
  `input[nxInput], textarea[nxInput], select[nxInput]`, not `[nxInput]`. A
  selector that is too broad lets a consumer apply the directive somewhere its
  accessibility guarantees do not hold.

Both rules are enforced by ESLint.

## Shared vocabulary

Do not invent a synonym for a concept that already exists.

| Concept          | Name          | Type                              |
| ---------------- | ------------- | --------------------------------- |
| Visual treatment | `variant`     | Component-specific union          |
| Control size     | `size`        | `NxSize` = `'sm' \| 'md' \| 'lg'` |
| Non-interactive  | `disabled`    | `boolean` via `booleanAttribute`  |
| Busy             | `loading`     | `boolean` via `booleanAttribute`  |
| Layout axis      | `orientation` | `NxOrientation`                   |
| Current value    | `value`       | Component-specific                |
| Expanded         | `open`        | `boolean`                         |

A component may **narrow** a shared union, and should say so in the type:

```ts
/** Badges only come in two sizes. */
export type NxBadgeSize = Extract<NxSize, 'sm' | 'md'>;
```

`variant` is intentionally per-component: a button's `ghost` and a card's
`raised` are not the same axis, and forcing them into one union would be a
false abstraction.

## Inputs

Signal inputs, always. `readonly`, no setters.

```ts
readonly variant = input<NxButtonVariant>('solid');
readonly size = input<NxSize>('md');
readonly disabled = input(false, { transform: booleanAttribute });
```

- Boolean inputs use `booleanAttribute`, so `<button nxButton disabled>` works
  as well as `[disabled]="true"`.
- Every input has a default. No input is required unless it genuinely cannot be
  defaulted.
- Literal unions over `string`. Autocomplete and compile errors beat runtime
  surprises.
- Derived state is a `computed()`, never a field updated by hand.

## Host bindings

State goes on `data-*` attributes; behavioural class names stay classes.

```ts
host: {
  'class': 'nx-button',
  '[class.nx-button--enabled]': 'enabled()',
  '[attr.data-variant]': 'variant()',
  '[attr.data-size]': 'size()',
  '[attr.data-loading]': 'loading() ? "" : null',
}
```

- Boolean state is a **present-or-absent** attribute: `'' : null`, never
  `"true" : "false"`. `[data-loading]` reads better in CSS and the inspector.
- Return `null` to remove an attribute, so Noxra never leaves an attribute
  behind that another actor might own.
- `--enabled` exists so stylesheets do not repeat
  `:not(:disabled):not([aria-disabled='true'])` on every interactive rule.

## Accessibility

**Use the platform first.** If native HTML solves it, do not add ARIA. A
disabled `<button>` needs the `disabled` attribute, not
`role` plus `aria-disabled` plus a keyboard handler.

Rules that have already earned their place:

- **Never fake a control.** `nxCard interactive` adds hover affordance and
  deliberately does _not_ add `tabindex` or `role`. If the whole card should
  activate, put `nxCard` on a `<button>`.
- **`disabled` and `loading` are different states.** `disabled` uses native
  semantics and leaves the tab order. `loading` uses `aria-disabled` and
  `aria-busy` and **stays focusable**, because moving focus to the document
  mid-interaction loses the user's place.
- **Suppress activation by preventing the event, not by stopping it.** Angular
  dispatches sibling listeners on one element itself, so
  `stopImmediatePropagation()` in a host listener does not stop a consumer's
  `(click)` on the same element. Block pointer activation with
  `pointer-events: none` and keyboard activation by cancelling `keydown`.
- **Focus is `:focus-visible`**, styled with the focus tokens. Never remove an
  outline without replacing it.
- **Do not set an ARIA attribute you do not own.** `NxInput` sets
  `aria-invalid` only when its own `invalid` input is true, so Angular forms or
  application code can own it otherwise.

## Styling

Component stylesheets live in `projects/noxra/src/styles/components/<name>.css`
— not beside the TypeScript. The source and published trees must stay
identical so relative `@import` paths work in both.

- Consume `--nx-*` tokens only. Never a literal colour, duration or easing.
- Component internals use `--_nx-<component>-<thing>` and are private.
- One root class per component (`.nx-button`), with state expressed through
  attribute selectors.
- No `!important`. No `::ng-deep`. No element selectors outside the component's
  own class scope. The sole sanctioned `!important` in the library is the
  theme-swap transition suppression in `base.css`, which has to outrank
  transitions declared by the consuming application and is active for one task
  — see [motion.md](motion.md#theme-switching-and-transitions).
- No `prefers-reduced-motion` media query — that is the tokens' job.

## File layout

```
components/button/
├─ button.ts          the directive
├─ button.types.ts    exported unions, when there are any
└─ button.spec.ts     tests
```

Add `button.html` only if a template is large enough to justify leaving the
decorator. Do not create a file to satisfy the shape — an empty
`button.types.ts` is worse than no file.

Small sub-directives (`NxCardHeader`, `NxCardBody`, `NxCardFooter`) live in
their parent's file while they stay trivial. Split them out when one grows past
roughly 40 lines.

## Public API

Every export is listed explicitly in `public-api.ts`. Nothing reaches consumers
by accident.

## Tests

Test observable behaviour, not implementation. The specs that matter are the
ones that would catch an Angular upgrade breaking something:

- The element renders and adds no unexpected DOM.
- Inputs reflect to the expected attributes.
- Disabled and loading behave differently, and correctly.
- Accessibility-relevant attributes are present or absent as designed.
- The component does not set state it does not own.

Mount through a host component with signal fields, so input changes go through
the real binding path:

```ts
@Component({
  selector: 'nx-button-host',
  imports: [NxButton],
  template: `<button nxButton [variant]="variant()">Save</button>`,
})
class ButtonHost {
  readonly variant = signal<NxButtonVariant>('solid');
}
```

Use `await fixture.whenStable()` rather than `detectChanges()`; the workspace is
zoneless.

## Checklist

- [ ] Directive on a native element, unless a component is genuinely required
- [ ] Selector constrained to supported elements, `nx` prefixed
- [ ] Signal inputs, all defaulted, `booleanAttribute` for booleans
- [ ] Shared vocabulary — no invented synonyms
- [ ] State on `data-*`, present-or-absent for booleans
- [ ] Native semantics before ARIA
- [ ] Stylesheet in `styles/components/`, tokens only, no media queries
- [ ] Nothing touches a browser global outside `afterNextRender()`
- [ ] Exported from `public-api.ts`
- [ ] Specs cover DOM output, states and accessibility semantics
- [ ] `npm run verify` passes
