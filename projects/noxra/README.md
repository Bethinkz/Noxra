# @noxra/ui

Angular-native UI library and design system.

> **Early development.** Not published to npm. The API is unstable and the
> visual design is placeholder. See the
> [workspace README](https://github.com/noxra/noxra) for status.

## Install

```bash
npm install @noxra/ui
```

Peer dependencies: `@angular/common` and `@angular/core` at `^22.0.0`.

## Set up

Import the stylesheet once, at the application level:

```json
// angular.json
"styles": ["@noxra/ui/styles/noxra.css", "src/styles.css"]
```

That is the only required step. The default dark theme binds to `:root`, so a
themed application needs no providers.

Add `provideNoxra()` only to choose a non-default theme or motion policy:

```ts
import { provideNoxra } from '@noxra/ui';

bootstrapApplication(App, {
  providers: [provideNoxra({ theme: 'neon', motion: 'system' })],
});
```

## Use

Components are directives on native elements. The markup you write is the
markup that renders.

```ts
import { NxBadge, NxButton, NxCard, NxCardBody, NxCardHeader, NxInput } from '@noxra/ui';
```

```html
<button nxButton>Save</button>
<button nxButton variant="outline" size="sm">Cancel</button>
<button nxButton [loading]="saving()">Publish</button>

<input nxInput placeholder="Email" />
<input nxInput [invalid]="true" />

<article nxCard>
  <header nxCardHeader>Deployment <span nxBadge variant="accent">live</span></header>
  <div nxCardBody>Rolled out to 3 regions.</div>
</article>

<span nxSpinner></span>
```

## Theming

Themes assign values to semantic tokens. Switching one is a single attribute
write on `<html>` — no stylesheet swap, no re-render.

```ts
const theme = inject(NxThemeService);
theme.setTheme('mono');
theme.setTokens({ '--nx-accent': '#ff4dff' });
```

Built-in themes: `void` (default dark), `mono`, `neon`, `light`. A custom theme
is a CSS rule assigning the theme-owned tokens under `[data-nx-theme='name']`.

## Stylesheets

Every file is published individually, so you can ship only what you use:

```css
@import '@noxra/ui/styles/tokens.css';
@import '@noxra/ui/styles/themes/void.css';
@import '@noxra/ui/styles/base.css';
@import '@noxra/ui/styles/components/button.css';
```

## Notes

- Zoneless and signal-based. No `zone.js` dependency.
- SSR and hydration safe.
- One runtime dependency (`tslib`). Notably **not** `@angular/forms` — invalid
  styling hooks into the classes Angular forms already emits.
- No Tailwind or CSS framework required.

## Licence

MIT
