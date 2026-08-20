/**
 * Motion vocabulary.
 *
 * These unions name the motion tokens rather than re-declaring their values;
 * the values live in `styles/tokens.css` so a theme or an application can
 * change them without a rebuild.
 */

/** Transition durations. Never use these for a looping animation. */
export type NxDuration = 'instant' | 'fast' | 'normal' | 'slow';

/** Easing curves. `enter`/`exit` are asymmetric on purpose. */
export type NxEasing = 'standard' | 'enter' | 'exit' | 'emphasized';

/** Travel distances for entrance/exit offsets. */
export type NxDistance = 'micro' | 'small' | 'medium';

/**
 * How an application resolves motion.
 *
 * - `system`  follow `prefers-reduced-motion` (default)
 * - `reduced` force reduced motion regardless of the OS setting
 * - `full`    opt out of reduced motion, e.g. behind a user preference
 */
export type NxMotionPreference = 'system' | 'reduced' | 'full';

/**
 * How much motion, when motion is on at all.
 *
 * A separate axis from {@link NxMotionPreference}, and the distinction
 * matters: intensity is taste, reduced motion is an accessibility requirement.
 * Reduced motion always wins, whatever the intensity.
 *
 * - `low`     shorter, smaller — motion that stays out of the way
 * - `medium`  the default
 * - `high`    longer, more travel — motion as part of the personality
 */
export type NxMotionIntensity = 'low' | 'medium' | 'high';
