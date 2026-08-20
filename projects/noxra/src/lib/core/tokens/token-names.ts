/**
 * The Noxra token contract, mirrored in TypeScript.
 *
 * This is the single TypeScript source of truth for token names. Parity with
 * the CSS in `src/styles` is enforced by `tools/check-tokens.mjs`, which fails
 * the build if a token is declared in one place and not the other, or if a
 * theme forgets to assign a visual token.
 *
 * The grouping is not cosmetic: it encodes *ownership*.
 *   - Structural groups are declared once, in `styles/tokens.css`.
 *   - Visual groups are declared by every theme, in `styles/themes/*.css`.
 */

export const NX_TOKEN_GROUPS = {
  // ---------------------------------------------------------------- visual
  surface: [
    '--nx-surface-base',
    '--nx-surface-sunken',
    '--nx-surface-raised',
    '--nx-surface-overlay',
    '--nx-surface-inverse',
  ],
  content: [
    '--nx-content-primary',
    '--nx-content-secondary',
    '--nx-content-tertiary',
    '--nx-content-disabled',
    '--nx-content-inverse',
    '--nx-content-on-accent',
  ],
  border: ['--nx-border-subtle', '--nx-border-default', '--nx-border-strong'],
  accent: [
    '--nx-accent',
    '--nx-accent-hover',
    '--nx-accent-active',
    '--nx-accent-subtle',
    '--nx-accent-muted',
  ],
  state: [
    '--nx-state-hover',
    '--nx-state-active',
    '--nx-state-selected',
    '--nx-state-focus-ring',
    '--nx-state-disabled-opacity',
    '--nx-state-danger',
    '--nx-state-success',
    '--nx-state-warning',
    '--nx-state-info',
  ],
  shadow: ['--nx-shadow-none', '--nx-shadow-sm', '--nx-shadow-md', '--nx-shadow-lg'],

  // ------------------------------------------------------------ structural
  radius: [
    '--nx-radius-none',
    '--nx-radius-sm',
    '--nx-radius-md',
    '--nx-radius-lg',
    '--nx-radius-full',
  ],
  space: [
    '--nx-space-0',
    '--nx-space-1',
    '--nx-space-2',
    '--nx-space-3',
    '--nx-space-4',
    '--nx-space-5',
    '--nx-space-6',
    '--nx-space-8',
  ],
  typography: [
    '--nx-font-sans',
    '--nx-font-mono',
    '--nx-font-size-xs',
    '--nx-font-size-sm',
    '--nx-font-size-md',
    '--nx-font-size-lg',
    '--nx-font-size-xl',
    '--nx-font-size-2xl',
    '--nx-font-weight-regular',
    '--nx-font-weight-medium',
    '--nx-font-weight-semibold',
    '--nx-line-height-tight',
    '--nx-line-height-normal',
    '--nx-letter-spacing-tight',
    '--nx-letter-spacing-normal',
    '--nx-letter-spacing-wide',
  ],
  focus: ['--nx-focus-ring-width', '--nx-focus-ring-offset'],
  motion: [
    '--nx-duration-instant',
    '--nx-duration-fast',
    '--nx-duration-normal',
    '--nx-duration-slow',
    '--nx-duration-loop',
    '--nx-easing-standard',
    '--nx-easing-enter',
    '--nx-easing-exit',
    '--nx-easing-emphasized',
    '--nx-easing-loop',
    '--nx-distance-micro',
    '--nx-distance-small',
    '--nx-distance-medium',
    '--nx-scale-enter',
    '--nx-scale-press',
  ],
  zIndex: [
    '--nx-z-base',
    '--nx-z-dropdown',
    '--nx-z-sticky',
    '--nx-z-overlay',
    '--nx-z-modal',
    '--nx-z-popover',
    '--nx-z-toast',
    '--nx-z-tooltip',
  ],
} as const satisfies Record<string, readonly `--nx-${string}`[]>;

/** Name of a token group, e.g. `'surface'`. */
export type NxTokenGroupName = keyof typeof NX_TOKEN_GROUPS;

/** Any token in the contract, e.g. `'--nx-surface-base'`. */
export type NxTokenName = (typeof NX_TOKEN_GROUPS)[NxTokenGroupName][number];

/**
 * Groups a theme is responsible for assigning. Everything else is structural
 * and is declared once by `styles/tokens.css`.
 */
export const NX_THEME_OWNED_GROUPS = [
  'surface',
  'content',
  'border',
  'accent',
  'state',
  'shadow',
] as const satisfies readonly NxTokenGroupName[];

/** Every token name in the contract, flattened. */
export const NX_TOKEN_NAMES: readonly NxTokenName[] = Object.values(NX_TOKEN_GROUPS).flat();

/** A partial set of runtime token overrides, as accepted by `NxThemeService`. */
export type NxTokenOverrides = Partial<Record<NxTokenName, string>>;
