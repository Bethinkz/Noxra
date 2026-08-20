# Component specification template

Fill this in **before** writing a component. It exists so that a human or a
coding agent produces the same shape of component every time, and so the
decisions that are easy to get wrong — accessibility, SSR, DOM output — are made
deliberately rather than discovered late.

Copy everything below into `docs/specs/<component>.md`, answer every heading,
then implement. "N/A" is a valid answer; a blank is not.

Read [component-guidelines.md](component-guidelines.md) first — this template
assumes those conventions.

---

## `<ComponentName>`

### Purpose

One or two sentences. What problem does this solve, and for whom?

State what it is **not**. Scope creep in a UI component usually enters here.

### Prior art

Which existing components did you look at, and what did you deliberately do
differently? Noxra studies other libraries and copies none of them.

### DOM strategy

- Directive or component? Justify anything that is not a directive.
- Selector, and which elements it is constrained to.
- Exact rendered output for the default case. Write the HTML.
- Any element Noxra adds, and why the consumer cannot reasonably write it.
- Sub-directives, if any.

### API

```ts
// Inputs, with types and defaults.
readonly variant = input<NxThingVariant>('default');
readonly size = input<NxSize>('md');
readonly disabled = input(false, { transform: booleanAttribute });

// Outputs.
readonly opened = output<void>();

// Exported types.
export type NxThingVariant = 'default' | '...';
```

- Which names come from the shared vocabulary?
- Does anything narrow a shared union? Say so in the type.
- Is any name new? Justify it, or rename it.

### States

Every state, and how each is expressed in the DOM.

| State    | Trigger          | DOM expression                | Notes           |
| -------- | ---------------- | ----------------------------- | --------------- |
| default  | —                | —                             |                 |
| hover    | `:hover`         | —                             |                 |
| focus    | `:focus-visible` | focus ring tokens             |                 |
| disabled | `disabled` input | native `disabled`             |                 |
| loading  | `loading` input  | `aria-busy`, `[data-loading]` | stays focusable |
| invalid  |                  |                               |                 |

### Variants

Each variant, what it means, and which tokens differ. If two variants differ
only by a colour, ask whether they should be one variant plus a token override.

### Accessibility

- What does native HTML already provide here? Use that first.
- Role — native or explicit? An explicit role needs a reason.
- Accessible name: where does it come from?
- ARIA attributes set, and **who owns each one**. Do not set an attribute the
  application or Angular forms might also own.
- Does anything need `@angular/aria` or `@angular/cdk`? See
  [0004-aria-and-cdk-strategy.md](decisions/0004-aria-and-cdk-strategy.md).
- Which WAI-ARIA Authoring Practices pattern applies, if any?

### Keyboard behaviour

| Key    | Behaviour |
| ------ | --------- |
| Tab    |           |
| Enter  |           |
| Space  |           |
| Escape |           |
| Arrows |           |

Also state: what must **not** be trapped, and what happens to focus when the
component's state changes.

### Tokens

Every token consumed, by group. Any token this component needs that does not
exist yet — adding one is a contract change, so say why the existing tokens are
insufficient.

Private `--_nx-*` properties and what they express.

### Motion

- What animates, and on which state change?
- Which duration, easing, distance and scale tokens?
- Anything looping? If so, it uses `--nx-duration-loop` / `--nx-easing-loop`.
- Confirm: **no `prefers-reduced-motion` media query in the component.**
- What does this look like with motion reduced? It must remain fully usable.

### SSR considerations

- Any browser global? If so, it belongs in `afterNextRender()`.
- Does server and client initial output match? If not, why is that safe?
- Anything that would break hydration — measurement, portals, generated IDs?
- Does it need to render meaningfully before hydration?

### Tests

List the specs. Prioritise what would catch an Angular upgrade breaking
something.

- [ ] Renders and adds no unexpected DOM
- [ ] Each input reflects to the expected attribute
- [ ] Disabled behaves correctly, using native semantics where available
- [ ] Loading is distinct from disabled
- [ ] Keyboard interaction
- [ ] Accessibility attributes present/absent as designed
- [ ] Does not set state it does not own

### Examples

The three or four snippets that should appear in the docs and showcase — the
default case, the common variants, and the one people will get wrong.

```html
<button nxThing>Default</button>
```

### Open questions

Anything deferred, and what would resolve it. Better recorded here than
discovered by a consumer.
