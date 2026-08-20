import {
  DOCUMENT,
  DestroyRef,
  Injectable,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

import { NOXRA_CONFIG } from '../noxra-config';
import type { NxMotionPreference } from './motion.types';

/** Attribute the resolved motion preference is published on. */
const MOTION_ATTRIBUTE = 'data-nx-motion';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Tracks and overrides the motion preference.
 *
 * Noxra's CSS already honours `prefers-reduced-motion` on its own — every
 * animation reads a motion token, and the tokens collapse under the media
 * query. This service exists for the two things CSS cannot do: let an
 * application *override* the system setting in either direction, and expose
 * the resolved answer to TypeScript for JS-driven motion.
 *
 * SSR: `matchMedia` is only reachable from `afterNextRender`, which never runs
 * on the server, and it is read from `DOCUMENT.defaultView` rather than the
 * `window` global. On the server `systemPrefersReduced` is `false`, which
 * matches the CSS — the server cannot know the user's setting either, so the
 * media query is what corrects it on the client without a hydration mismatch.
 */
@Injectable({ providedIn: 'root' })
export class NxMotionService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly config = inject(NOXRA_CONFIG, { optional: true });

  private readonly currentPreference = signal<NxMotionPreference>(this.config?.motion ?? 'system');
  private readonly systemReduced = signal(false);

  /** The application's motion preference. */
  readonly preference = this.currentPreference.asReadonly();

  /** Whether the OS reports a reduced-motion preference. Always `false` on the server. */
  readonly systemPrefersReduced = this.systemReduced.asReadonly();

  /**
   * The resolved answer: whether motion should be reduced right now.
   *
   * Only needed for motion driven from TypeScript. CSS-driven motion is
   * already handled by the motion tokens.
   */
  readonly reduced = computed(() => {
    const preference = this.currentPreference();
    return preference === 'reduced' || (preference === 'system' && this.systemReduced());
  });

  constructor() {
    this.applyPreference();

    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view?.matchMedia) {
        return;
      }

      const query = view.matchMedia(REDUCED_MOTION_QUERY);
      this.systemReduced.set(query.matches);

      const onChange = (event: MediaQueryListEvent) => this.systemReduced.set(event.matches);
      query.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
    });
  }

  /** Override how motion is resolved. */
  setPreference(preference: NxMotionPreference): void {
    this.currentPreference.set(preference);
    this.applyPreference();
  }

  private applyPreference(): void {
    const root = this.document.documentElement;
    const preference = this.currentPreference();

    // `system` is the absence of an override, so the media query stays in charge.
    if (preference === 'system') {
      root.removeAttribute(MOTION_ATTRIBUTE);
    } else {
      root.setAttribute(MOTION_ATTRIBUTE, preference);
    }
  }
}
