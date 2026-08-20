import { RenderMode, type ServerRoute } from '@angular/ssr';

/**
 * Render modes are chosen to exercise both SSR paths in CI.
 *
 * Prerendering runs every page through server rendering at build time, so a
 * component that touches a browser global fails the build rather than a user's
 * first request. The motion page additionally renders per-request, which keeps
 * the runtime server path covered too - and is the honest choice for a page
 * whose content depends on the visitor's own motion preference.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'motion', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender },
];
