/**
 * Built-in Noxra themes.
 *
 * The `(string & {})` member keeps autocomplete for the built-ins while still
 * accepting an application's own theme name — a custom theme is just a CSS
 * rule that assigns the visual tokens under `[data-nx-theme='my-theme']`, so
 * Noxra has no reason to reject names it does not know.
 */
export type NxThemeName = 'void' | 'mono' | 'neon' | 'light' | (string & {});

/** Themes Noxra ships stylesheets for. */
export const NX_BUILT_IN_THEMES = ['void', 'mono', 'neon', 'light'] as const;

/** The theme applied when an application does not choose one. */
export const NX_DEFAULT_THEME = 'void';
