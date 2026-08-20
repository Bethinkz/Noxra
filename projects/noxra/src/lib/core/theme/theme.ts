import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

import { NOXRA_CONFIG } from '../noxra-config';
import type { NxTokenOverrides } from '../tokens/token-names';
import { NX_DEFAULT_THEME, type NxThemeName } from './theme.types';

/** Attribute the active theme is published on. */
const THEME_ATTRIBUTE = 'data-nx-theme';

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
  private readonly config = inject(NOXRA_CONFIG, { optional: true });

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

    const root = this.document.documentElement;
    for (const token of Object.keys(previous)) {
      root.style.removeProperty(token);
    }
  }

  private applyTheme(): void {
    this.document.documentElement.setAttribute(THEME_ATTRIBUTE, this.currentTheme());
  }

  private applyOverrides(): void {
    const root = this.document.documentElement;
    for (const [token, value] of Object.entries(this.currentOverrides())) {
      root.style.setProperty(token, value);
    }
  }
}
