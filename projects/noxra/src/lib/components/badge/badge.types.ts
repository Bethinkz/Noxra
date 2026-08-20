import type { NxSize } from '../../core/utilities/types';

/** Visual treatment of a badge. */
export type NxBadgeVariant = 'neutral' | 'accent' | 'outline';

/**
 * Badges only come in two sizes. Narrowing `NxSize` rather than declaring a
 * fresh union keeps the shared vocabulary intact and makes the relationship
 * explicit to anyone reading the type.
 */
export type NxBadgeSize = Extract<NxSize, 'sm' | 'md'>;
