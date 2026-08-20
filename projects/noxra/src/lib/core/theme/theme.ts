import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

import { NOXRA_CONFIG } from '../noxra-config';
import type { NxTokenOverrides } from '../tokens/token-names';
import { NX_DEFAULT_THEME, type NxThemeName } from './theme.types';

/** Attribute the active theme is published on. */
const THEME_ATTRIBUTE = 'data-nx-theme';

/** Set for a single frame while a swap lands. See `styles/base.css`. */
const SWITCHING_ATTRIBUTE = 'data-nx-theme-switching';

/**
 * Applies and tracks the active Noxra theme.
 *
 * A theme is nothing more than a set of CSS custom property values selected by
 * `[data-nx-theme]`, so switching themes is one attribute write — no
 * stylesheet swap, no re-render, no flash.
 *
 * SSR: the attribute is written synchronously from the constructor rather than
 * from an `effect`, because effects are scheduled and could be flushed after
 * the server has already serialised the document. Writing through the injected
 * `DOCUMENT` keeps this correct on the server and in the browser, and never
 * touches a browser global.
 */
@Injectable({ providedIn: 'root' })
export class NxThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly config = inject(NOXRA_CONFIG, { optional: true });

  private restoreHandle: ReturnType<typeof setTimeout> | undefined;

  private readonly currentTheme = signal<NxThemeName>(this.config?.theme ?? NX_DEFAULT_THEME);
  private readonly currentOverrides = signal<NxTokenOverrides>({});

  /** The active theme name. */
  readonly theme = this.currentTheme.asReadonly();

  /** Token values currently overridden at runtime. */
  readonly overrides = this.currentOverrides.asReadonly();

  /** Whether any runtime token override is in effect. */
  readonly hasOverrides = computed(() => Object.keys(this.currentOverrides()).length > 0);

  constructor() {
    this.applyTheme();
    this.applyOverrides();
  }

  /** Switch the active theme. */
  setTheme(theme: NxThemeName): void {
    this.currentTheme.set(theme);
    this.applyTheme();
  }

  /**
   * Override individual tokens at runtime, merging with any existing
   * overrides. Values are written as inline custom properties on the document
   * element, so they win over every stylesheet-declared theme.
   */
  setTokens(overrides: NxTokenOverrides): void {
    this.currentOverrides.update((current) => ({ ...current, ...overrides }));
    this.applyOverrides();
  }

  /** Remove every runtime token override. */
  resetTokens(): void {
    const previous = this.currentOverrides();
    this.currentOverrides.set({});

    this.commit((root) => {
      for (const token of Object.keys(previous)) {
        root.style.removeProperty(token);
      }
    });
  }

  private applyTheme(): void {
    this.commit((root) => root.setAttribute(THEME_ATTRIBUTE, this.currentTheme()));
  }

  private applyOverrides(): void {
    this.commit((root) => {
      for (const [token, value] of Object.entries(this.currentOverrides())) {
        root.style.setProperty(token, value);
      }
    });
  }

  /**
   * Applies a token change with transitions suppressed while it lands.
   *
   * A CSS transition whose value derives from a custom property stalls when
   * that property changes - the browser keeps the property pinned at the value
   * it held when the transition started. Without this, a themed
   * `background-color` keeps rendering the previous theme's colour until
   * something unrelated invalidates it.
   *
   * The restore is a timeout rather than `requestAnimationFrame` on purpose.
   * A hidden or backgrounded tab does not run animation frames, so an rAF
   * restore never fires there and the application is left with transitions
   * disabled forever - which is exactly what happens when a theme follows the
   * system colour scheme and it changes while the tab is in the background.
   * Timeouts are throttled in the background, but they do run.
   *
   * Forcing layout before scheduling the restore is what makes the timeout
   * safe: the new values are already the current computed values by then, so
   * re-enabling transitions cannot start one retroactively.
   */
  private commit(write: (root: HTMLElement) => void): void {
    const root = this.document.documentElement;

    // Nothing transitions during server rendering.
    if (!this.isBrowser) {
      write(root);
      return;
    }

    root.setAttribute(SWITCHING_ATTRIBUTE, '');
    write(root);

    // Commit the new values while transitions are still suppressed.
    void root.offsetHeight;

    // A rapid second change restarts the window rather than ending it early.
    clearTimeout(this.restoreHandle);
    this.restoreHandle = setTimeout(() => root.removeAttribute(SWITCHING_ATTRIBUTE), 0);
  }
}
