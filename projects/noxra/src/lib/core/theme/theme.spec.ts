import { TestBed } from '@angular/core/testing';

import { NOXRA_CONFIG } from '../noxra-config';
import { NxThemeService } from './theme';

describe('NxThemeService', () => {
  afterEach(() => {
    const root = document.documentElement;
    root.removeAttribute('data-nx-theme');
    root.removeAttribute('data-nx-theme-switching');
    root.removeAttribute('style');
  });

  it('applies the default theme on construction', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxThemeService);

    expect(service.theme()).toBe('void');
    expect(document.documentElement.getAttribute('data-nx-theme')).toBe('void');
  });

  it('honours a configured theme', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: NOXRA_CONFIG, useValue: { theme: 'neon' } }],
    });
    TestBed.inject(NxThemeService);

    expect(document.documentElement.getAttribute('data-nx-theme')).toBe('neon');
  });

  it('switches theme with a single attribute write', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxThemeService);

    service.setTheme('mono');

    expect(service.theme()).toBe('mono');
    expect(document.documentElement.getAttribute('data-nx-theme')).toBe('mono');
  });

  it('accepts an application-defined theme name', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxThemeService);

    service.setTheme('acme-corp');

    expect(document.documentElement.getAttribute('data-nx-theme')).toBe('acme-corp');
  });

  it('merges runtime token overrides onto the document element', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxThemeService);

    service.setTokens({ '--nx-accent': '#ff00ff' });
    service.setTokens({ '--nx-radius-md': '2px' });

    const style = document.documentElement.style;
    expect(style.getPropertyValue('--nx-accent')).toBe('#ff00ff');
    expect(style.getPropertyValue('--nx-radius-md')).toBe('2px');
    expect(service.hasOverrides()).toBe(true);
  });

  it('suppresses transitions across a theme swap, then restores them', async () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxThemeService);
    const root = document.documentElement;

    service.setTheme('neon');

    // A CSS transition whose value comes from a custom property stalls when
    // that property changes, pinning the old theme's colour. The attribute is
    // what disables transitions while the new values are committed.
    expect(root.hasAttribute('data-nx-theme-switching')).toBe(true);
    expect(root.getAttribute('data-nx-theme')).toBe('neon');

    // Restored on a timeout, not an animation frame: a hidden tab runs no
    // animation frames, so an rAF restore would leave the application with
    // transitions disabled forever.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(root.hasAttribute('data-nx-theme-switching')).toBe(false);
  });

  it('does not lose the restore when themes change in quick succession', async () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxThemeService);
    const root = document.documentElement;

    service.setTheme('neon');
    service.setTheme('mono');
    service.setTheme('light');

    expect(root.hasAttribute('data-nx-theme-switching')).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(root.hasAttribute('data-nx-theme-switching')).toBe(false);
    expect(root.getAttribute('data-nx-theme')).toBe('light');
  });

  it('suppresses transitions for runtime token overrides too', async () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxThemeService);
    const root = document.documentElement;

    service.setTokens({ '--nx-accent': '#ff00ff' });
    expect(root.hasAttribute('data-nx-theme-switching')).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(root.hasAttribute('data-nx-theme-switching')).toBe(false);
  });

  it('removes every override on reset', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxThemeService);

    service.setTokens({ '--nx-accent': '#ff00ff', '--nx-radius-md': '2px' });
    service.resetTokens();

    const style = document.documentElement.style;
    expect(style.getPropertyValue('--nx-accent')).toBe('');
    expect(style.getPropertyValue('--nx-radius-md')).toBe('');
    expect(service.hasOverrides()).toBe(false);
  });
});
