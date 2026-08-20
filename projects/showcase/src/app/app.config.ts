import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideNoxra } from '@noxra/ui';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(),

    // Noxra needs no providers to work - the default theme binds to `:root`.
    // This is here so the showcase exercises the configured path, and so the
    // server-rendered HTML already carries `data-nx-theme`.
    provideNoxra({ theme: 'void', motion: 'system' }),
  ],
};
