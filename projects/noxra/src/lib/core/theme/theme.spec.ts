import { TestBed } from '@angular/core/testing';

import { NOXRA_CONFIG } from '../noxra-config';
import { NxThemeService } from './theme';

describe('NxThemeService', () => {
  afterEach(() => {
    const root = document.documentElement;
    root.removeAttribute('data-nx-theme');
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
