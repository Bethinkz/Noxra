# Architecture

Noxra is an Angular-native UI library and design system. This document explains
how it is put together and, more importantly, why.

Status: **foundation, with a first visual pass**. The architecture below is
real and enforced. The palette, type scale and motion values are real and
contrast-checked; what is still absent is choreography — the entrance and exit
motion that only arrives with overlays.

## The shape of the thing

```
projects/noxra/src/
├─ public-api.ts            the entire public TypeScript surface, listed explicitly
├─ lib/
│  ├─ core/                 framework-wide infrastructure
│  │  ├─ tokens/            the design token contract, mirrored in TypeScript
│  │  ├─ theme/             theme application and runtime overrides
│  │  ├─ motion/            motion vocabulary and preference resolution
│  │  ├─ a11y/              accessibility helpers the platform lacks
│  │  └─ utilities/         shared API vocabulary (NxSize, NxOrientation)
│  ├─ primitives/           reusable behaviour (currently empty, deliberately)
│  └─ components/           public UI components
└─ styles/                  the published CSS: tokens, themes, base, components
```

`projects/showcase/` is a development playground and the library's first
consumer. `tools/` holds the verification scripts. `docs/decisions/` holds ADRs
for choices that would be expensive to reverse.

## Dependency boundaries

Dependencies point in one direction only:

```
components  ──>  primitives  ──>  core
```

- **`core`** knows nothing about any component. If a component needs
  infrastructure, the infrastructure moves to `core` rather than the component
  growing a private copy.
- **`primitives`** may use `core`. It must not know which components exist.
- **`components`** may use both. Components must not import each other. Two
  components needing the same behaviour is the signal to create a primitive,
  not to cross-import.
- **`styles`** depends on the token contract and nothing else. No stylesheet
  may reference a `--nx-*` property that is not a declared token; this is
  enforced by `npm run check:tokens`.

## Public versus internal API

`public-api.ts` enumerates every exported symbol explicitly. There is no
`export *` from a barrel that might widen the surface by accident.

Anything not listed there is internal, even if a deep import can reach it. The
package's `exports` map means a deep import into `@noxra/ui/lib/...` fails at
resolution time rather than silently binding a consumer to a private symbol.

Two conventions make the boundary visible in CSS too:

- `--nx-*` is a public token. Consumers may read and override it.
- `--_nx-*` is a component-private property. It may change in any release.

## Component philosophy

Noxra components are **directives on native elements**, not components that
generate markup. Every component in this milestone — Button, Input, Card, Badge,
Spinner — adds exactly zero DOM nodes.

```html
<button nxButton variant="outline">Save</button>
```

renders

```html
<button class="nx-button nx-button--enabled" data-variant="outline" data-size="md">Save</button>
```

That is the whole output. See
[0007-directive-first-components.md](decisions/0007-directive-first-components.md)
for the reasoning and the cases where this rule stops applying.

The API vocabulary is shared and small: `variant`, `size`, `disabled`,
`loading`, `orientation`, `value`, `open` mean the same thing everywhere. See
[component-guidelines.md](component-guidelines.md).

## DOM philosophy

The markup you write is the markup that renders. This is a constraint Noxra
accepts costs for, because it buys:

- **Debuggability** — the inspector shows your markup, not a generated tree.
- **Overridability** — plain global classes, no `::ng-deep`, no encapsulation
  attributes to fight.
- **Accessibility** — a real `<button>` already handles focus, activation,
  form participation and assistive-technology semantics. Noxra does not
  re-implement any of it.
- **Testability** — E2E selectors target the element the author wrote.
- **Size** — no wrapper elements, and no per-component style injection.

State is published as `data-*` attributes (`data-variant`, `data-size`,
`data-loading`) rather than modifier classes, because attributes are
self-describing in the inspector and are stable selectors for CSS and tests.

## Styling architecture

Noxra ships plain CSS with no build step and no framework dependency. Because
components are directives, they cannot carry view-encapsulated styles, so all
styling is global, class-based and token-driven.

The source tree under `styles/` and the published tree under
`dist/noxra/styles/` are **identical in layout**, so relative `@import` paths
work unchanged in both. That is why component stylesheets live in
`styles/components/` rather than beside their TypeScript.

See [0001-styling-architecture.md](decisions/0001-styling-architecture.md) and
[design-tokens.md](design-tokens.md).

## Why Angular-native

Noxra is not a framework-agnostic core with an Angular wrapper. Being
Angular-native means using what Angular already provides instead of
reimplementing it:

- **Signal inputs** (`input()`, `computed()`) rather than setters and manual
  change notification.
- **Zoneless by default.** Angular 22 ships zoneless, and Noxra has no
  `zone.js` dependency and no `NgZone` usage. Nothing in the library depends on
  Zone patching for correctness.
- **`HOST_TAG_NAME`** to detect whether the host is a `<button>` or an `<a>`,
  instead of reading `nativeElement.tagName`. It is public API, resolved at
  injection time, and correct under SSR without touching the DOM.
- **`provideNoxra()`** following Angular's `provideX` convention, returning
  `EnvironmentProviders`.
- **`DOCUMENT` injection** rather than the `document` global.
- **`afterNextRender()`** for browser-only work, rather than a platform check
  the author has to remember.

No `ɵ`-prefixed or otherwise private Angular API is used anywhere. See
[angular-compatibility.md](angular-compatibility.md).

## SSR and hydration

Every component and service must work under CSR, SSR and hydration. The rules:

1. **No browser globals at module scope.** Not `window`, `document`,
   `localStorage`, `sessionStorage` or `navigator`.
2. **No browser access in constructors.** Constructors run on the server.
3. **Reach the DOM through `DOCUMENT`.** `document.defaultView` instead of
   `window`.
4. **Browser-only work goes in `afterNextRender()`**, which never runs on the
   server, so no platform check is needed at the call site. For work triggered
   on demand rather than at render time — `NxThemeService.setTheme()` can be
   called at any moment — guard with `isPlatformBrowser` instead; there is no
   render callback to hang it on.
5. **Server and client must agree on initial output.** `NxMotionService`
   reports `systemPrefersReduced === false` on the server because the server
   genuinely cannot know — and the CSS media query corrects the appearance on
   the client without a hydration mismatch, because reduced motion is expressed
   in tokens rather than in DOM.

This is verified, not asserted. The showcase production build prerenders every
static route, so a component that touches a browser global fails the build;
`npm run verify:ssr` then boots the real server bundle and checks a
per-request-rendered route.

## Dependency policy

In order of preference:

1. Web platform APIs — `:focus-visible`, `:user-invalid`, `popover`, `inert`,
   `matchMedia`, CSS custom properties.
2. Public Angular APIs.
3. `@angular/aria`, when it provides behaviour the platform does not.
4. `@angular/cdk`, only for genuinely complex behaviour such as overlay
   positioning.
5. A small internal Noxra utility.
6. A third-party dependency — requires an ADR.

The shipped package currently has exactly one runtime dependency, `tslib`, and
two peer dependencies, `@angular/common` and `@angular/core`. Notably it does
**not** depend on `@angular/forms`, despite Input integrating with Angular
forms — see [0006-forms-integration.md](decisions/0006-forms-integration.md).

`npm run check:package` asserts this: it reads the built bundle and fails if it
imports anything that is not a declared peer or `tslib`.

Noxra does not require Tailwind and never will. Tailwind users can consume
Noxra normally; the tokens are plain CSS custom properties.

## What is deliberately not here

- **`primitives/` is empty.** The foundation components needed nothing in it,
  and a primitive without two callers is speculation. The boundary and its
  admission criteria are documented in
  [`lib/primitives/README.md`](../projects/noxra/src/lib/primitives/README.md).
- **No base component class.** Button, Badge and Card each declare their own
  `variant` and `size` inputs. Three small duplications read better than one
  inheritance chain.
- **No ID generation utility.** Nothing needs one yet. Dialog and Tooltip will.
- **No secondary entry points.** See
  [0002-entry-point-strategy.md](decisions/0002-entry-point-strategy.md).
