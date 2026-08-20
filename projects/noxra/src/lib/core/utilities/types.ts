/**
 * Cross-component API vocabulary.
 *
 * Noxra keeps a single spelling for each concept so that both people and
 * coding agents can predict an API without reading its source. A component may
 * *narrow* one of these unions (see `NxBadgeSize`), but must not invent a
 * synonym for a concept that already lives here.
 *
 * See docs/component-guidelines.md.
 */

/** Standard control sizing. */
export type NxSize = 'sm' | 'md' | 'lg';

/** Layout axis for components that have one. */
export type NxOrientation = 'horizontal' | 'vertical';
