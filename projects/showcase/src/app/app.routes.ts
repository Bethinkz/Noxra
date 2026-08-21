import type { Routes } from '@angular/router';

/**
 * Every page is lazily loaded. The showcase is a playground, but it is also
 * the first consumer of Noxra, so it is built the way a real application would
 * be - which is what makes it useful as a tree-shaking canary.
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Foundation - Noxra',
    loadComponent: () => import('./pages/foundation-page').then((m) => m.FoundationPage),
  },
  {
    path: 'tokens',
    title: 'Tokens - Noxra',
    loadComponent: () => import('./pages/tokens-page').then((m) => m.TokensPage),
  },
  {
    path: 'motion',
    title: 'Motion - Noxra',
    loadComponent: () => import('./pages/motion-page').then((m) => m.MotionPage),
  },
  {
    // Spike, deliberately not in the sidebar: reachable at /motion-spike for
    // experimentation, but not a product section. See motion-spike-page.ts.
    path: 'motion-spike',
    title: 'Motion spike - Noxra',
    loadComponent: () => import('./pages/motion-spike-page').then((m) => m.MotionSpikePage),
  },
  {
    path: 'button',
    title: 'Button - Noxra',
    loadComponent: () => import('./pages/button-page').then((m) => m.ButtonPage),
  },
  {
    path: 'input',
    title: 'Input - Noxra',
    loadComponent: () => import('./pages/input-page').then((m) => m.InputPage),
  },
  {
    path: 'card',
    title: 'Card - Noxra',
    loadComponent: () => import('./pages/card-page').then((m) => m.CardPage),
  },
  {
    path: 'display',
    title: 'Display - Noxra',
    loadComponent: () => import('./pages/display-page').then((m) => m.DisplayPage),
  },
  {
    path: 'overlays',
    title: 'Overlays - Noxra',
    loadComponent: () => import('./pages/dialog-page').then((m) => m.DialogPage),
  },
  {
    path: 'badge',
    title: 'Badge - Noxra',
    loadComponent: () => import('./pages/badge-page').then((m) => m.BadgePage),
  },
];
