import { InjectionToken } from '@angular/core';

import type { NxMotionPreference } from './motion/motion.types';
import type { NxThemeName } from './theme/theme.types';

/** Application-level Noxra configuration. */
export interface NoxraConfig {
  /** Theme to apply at startup. Defaults to `'void'`. */
  readonly theme?: NxThemeName;

  /** How motion resolves. Defaults to `'system'`. */
  readonly motion?: NxMotionPreference;
}

/**
 * Configuration supplied via `provideNoxra`. Absent means "all defaults".
 *
 * This token lives apart from `provideNoxra` so the services can depend on the
 * configuration without depending on the provider that supplies it, which
 * would be a cycle.
 */
export const NOXRA_CONFIG = new InjectionToken<NoxraConfig>('NOXRA_CONFIG');
