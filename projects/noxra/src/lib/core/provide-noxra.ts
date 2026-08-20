import {
  type EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { NxMotionService } from './motion/motion';
import { NOXRA_CONFIG, type NoxraConfig } from './noxra-config';
import { NxThemeService } from './theme/theme';

/**
 * Configure Noxra for an application.
 *
 * Calling this is **optional**. The default theme also binds to `:root`, so
 * importing the stylesheet is enough to get a working, themed application with
 * no providers at all. Use `provideNoxra` when you want a non-default theme or
 * motion policy applied at startup:
 *
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [provideNoxra({ theme: 'neon' })],
 * });
 * ```
 *
 * The app initializer exists so the chosen configuration reaches the document
 * during bootstrap — including on the server, so server-rendered HTML already
 * carries the right theme — rather than lazily, whenever some component
 * happens to inject the services.
 */
export function provideNoxra(config: NoxraConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NOXRA_CONFIG, useValue: config },
    provideAppInitializer(() => {
      // Constructing the services is what applies the configuration.
      inject(NxThemeService);
      inject(NxMotionService);
    }),
  ]);
}
