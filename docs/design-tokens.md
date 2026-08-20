# Design tokens

Noxra's design tokens are CSS custom properties. Components consume semantic
token names; themes assign values to those names. No component ever names a
colour.

Values in this milestone are placeholder. The **contract** is the deliverable.

## Semantic, not literal

A component must never reach for a literal value or a component-scoped colour:

```css
/* No. */
--button-black: #000;
--dialog-gray: #181818;

/* Yes. */
--nx-surface-base;
--nx-surface-raised;
--nx-content-primary;
--nx-border-default;
--nx-accent;
```

The test is whether a token still makes sense in a light theme. `--nx-surface-raised`
does. `--button-black` does not.

## Ownership

Tokens fall into two ownership classes, and the split is enforced.

**Structural** tokens are declared once, in `styles/tokens.css`. They do not
change between themes.

| Group        | Examples                                          |
| ------------ | ------------------------------------------------- |
| `radius`     | `--nx-radius-sm`, `--nx-radius-full`              |
| `space`      | `--nx-space-1` … `--nx-space-8`                   |
| `typography` | `--nx-font-sans`, `--nx-font-size-md`             |
| `focus`      | `--nx-focus-ring-width`, `--nx-focus-ring-offset` |
| `motion`     | `--nx-duration-fast`, `--nx-easing-enter`         |
| `zIndex`     | `--nx-z-modal`, `--nx-z-tooltip`                  |

**Theme-owned** tokens are assigned by every theme, in `styles/themes/*.css`.

| Group     | Examples                                         |
| --------- | ------------------------------------------------ |
| `surface` | `--nx-surface-base`, `--nx-surface-raised`       |
| `content` | `--nx-content-primary`, `--nx-content-on-accent` |
| `border`  | `--nx-border-subtle`, `--nx-border-strong`       |
| `accent`  | `--nx-accent`, `--nx-accent-hover`               |
| `state`   | `--nx-state-hover`, `--nx-state-danger`          |
| `shadow`  | `--nx-shadow-sm`, `--nx-shadow-lg`               |

A theme must assign **every** theme-owned token. Partial themes are rejected,
because a missing token would silently inherit another theme's value and
produce a bug that only appears in one colour scheme.

## Two sources of truth, kept honest

The contract exists as CSS (`styles/`) and as TypeScript
(`lib/core/tokens/token-names.ts`). Duplication like this normally rots, so
`npm run check:tokens` makes drift a build failure. It enforces:

1. The structural tokens in `tokens.css` are exactly the structural groups in
   TypeScript.
2. Every theme assigns exactly the theme-owned groups — no more, no fewer.
3. Every `var(--nx-*)` anywhere in the library refers to a real token. This is
   what catches typos.
4. Every private `--_nx-*` property a stylesheet uses is declared in that same
   stylesheet.

Currently: **86 tokens** — 54 structural, 32 theme-owned — across 4 themes.

## Public and private properties

- `--nx-*` is public. Override it freely.
- `--_nx-*` is component-private. It exists so a component can express internal
  relationships (`--_nx-button-height` driving padding and font size together)
  without inventing public API. It may change in any release.

There is deliberately no per-component public token layer yet
(`--nx-button-height` and friends). It is a real feature, but it is a public
API surface that would need to be supported forever, so it waits until there is
evidence of what people actually need to override.

## Themes

Four ship today, all as pure token assignments — no component knows any of them
exists.

| Theme   | Selector                      | Purpose                                       |
| ------- | ----------------------------- | --------------------------------------------- |
| `void`  | `:root, [data-nx-theme=void]` | Default dark theme                            |
| `mono`  | `[data-nx-theme=mono]`        | Pure monochrome; accent resolves to grey      |
| `neon`  | `[data-nx-theme=neon]`        | Higher-intensity accent, accent-tinted shadow |
| `light` | `[data-nx-theme=light]`       | Proves the contract is not dark-only          |

Void binds to `:root` as well as its own attribute, so **importing the
stylesheet is enough** — a themed application needs no providers and no
JavaScript. Each theme also sets `color-scheme`, so native controls and
scrollbars match.

## Switching themes at runtime

A theme change is one attribute write on `<html>`. No stylesheet swap, no
re-render, no flash.

Transitions are suppressed for the single task it takes to land, because a CSS
transition reading a custom property stalls when that property changes — see
[motion.md](motion.md#theme-switching-and-transitions). `NxThemeService` does
this for you; applications changing `data-nx-theme` by hand need to do it
themselves.

```ts
import { NxThemeService } from '@noxra/ui';

const theme = inject(NxThemeService);
theme.setTheme('neon');
theme.theme(); // signal: 'neon'
```

Or at bootstrap, which also means the server-rendered HTML already carries the
right theme:

```ts
bootstrapApplication(App, {
  providers: [provideNoxra({ theme: 'neon' })],
});
```

## Custom themes

A custom theme is a CSS rule. There is nothing to register.

```css
[data-nx-theme='acme'] {
  color-scheme: dark;

  --nx-surface-base: #0a0a12;
  /* … every theme-owned token … */
}
```

```ts
theme.setTheme('acme');
```

`NxThemeName` is `'void' | 'mono' | 'neon' | 'light' | (string & {})`, which
keeps autocomplete for the built-ins while accepting any name — Noxra has no
reason to reject a theme it does not ship.

## Runtime overrides

For per-user or per-tenant tweaks, override individual tokens. Values are
written as inline custom properties on `<html>`, so they beat every stylesheet.

```ts
theme.setTokens({ '--nx-accent': '#ff4dff', '--nx-radius-md': '2px' });
theme.resetTokens();
```

`NxTokenOverrides` is `Partial<Record<NxTokenName, string>>`, so a typo in a
token name is a compile error.

## Consuming the stylesheet

Everything at once:

```json
"styles": ["@noxra/ui/styles/noxra.css", "src/styles.css"]
```

Or compose. Every file is published individually, which is how an application
ships only the themes and components it uses:

```css
@import '@noxra/ui/styles/tokens.css';
@import '@noxra/ui/styles/themes/void.css';
@import '@noxra/ui/styles/base.css';
@import '@noxra/ui/styles/components/button.css';
```

## Adding a token

1. Add it to the right group in `lib/core/tokens/token-names.ts`.
2. Declare it in `styles/tokens.css` (structural) or in **every** theme
   (theme-owned).
3. Run `npm run check:tokens`.

The check will tell you precisely what is missing and where.

## Contrast is enforced, not reviewed

`npm run check:contrast` asserts every foreground/background pair Noxra
actually renders, in every theme, against WCAG 2.1 — 4.5:1 for text, 3:1 for
non-text UI. Translucent fills are composited, not ignored, so an accent badge
is measured as accent text on a 12%-alpha accent fill over the surface behind
it.

This is not ceremony. Building this milestone, it caught the light theme's
accent at 3.10:1 as text, tertiary text below threshold in every theme, and
`--nx-border-strong` at 1.89:1 while being the border that identifies a form
control. Two tokens are consequently lighter than taste alone would make them:

- `--nx-content-tertiary` holds 4.5:1, because it carries real text.
- `--nx-border-strong` holds 3:1, because WCAG 1.4.11 treats a control's
  boundary as information. `--nx-border-subtle` and `--nx-border-default` are
  decorative and stay quiet.

Disabled content is deliberately not checked — WCAG exempts it, and requiring
contrast there would defeat the affordance.
