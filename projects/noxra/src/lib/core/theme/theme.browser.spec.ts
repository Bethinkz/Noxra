import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxButton } from '../../components/button/button';
import { NxThemeService } from './theme';

/**
 * Browser-only regression for the theme-swap transition stall.
 *
 * A CSS transition whose value comes from a custom property pins the property
 * at the value it held when the transition began, so a themed
 * `background-color` keeps rendering the *previous* theme's colour after a
 * swap. `NxThemeService` suppresses transitions for the task it takes to land.
 *
 * jsdom can only assert that the suppression attribute goes on and comes off.
 * Whether the colour actually changes needs a browser that computes styles and
 * runs transitions, which is what this file is for — it is the only place the
 * original bug would be caught again.
 */

@Component({
  selector: 'nx-theme-browser-host',
  imports: [NxButton],
  template: `<button nxButton>Save</button>`,
})
class ThemeBrowserHost {}

function nextFrames(count = 3): Promise<void> {
  return new Promise((resolve) => {
    let remaining = count;
    const step = () => (remaining-- <= 0 ? resolve() : requestAnimationFrame(step));
    step();
  });
}

describe('NxThemeService (browser)', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [ThemeBrowserHost] }).compileComponents();
    const fixture = TestBed.createComponent(ThemeBrowserHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    return {
      fixture,
      service: TestBed.inject(NxThemeService),
      button: (fixture.nativeElement as HTMLElement).querySelector('button')!,
    };
  }

  afterEach(() => {
    for (const el of document.querySelectorAll('nx-theme-browser-host')) {
      el.remove();
    }
    const root = document.documentElement;
    root.removeAttribute('data-nx-theme');
    root.removeAttribute('data-nx-theme-switching');
    root.removeAttribute('style');
  });

  it('repaints transitioned properties across a theme swap', async () => {
    const { service, button } = await setup();

    service.setTheme('void');
    await nextFrames();
    const before = getComputedStyle(button).backgroundColor;

    service.setTheme('light');
    // Longer than any duration token, so a working transition has finished and
    // a stalled one has had every chance to catch up.
    await new Promise((resolve) => setTimeout(resolve, 600));
    const after = getComputedStyle(button).backgroundColor;

    // The exact colours belong to the themes; what matters is that the painted
    // value moved at all. Before the fix, `after` equalled `before`.
    expect(after).not.toBe(before);
  });

  it('leaves transitions working after the swap', async () => {
    const { service, button } = await setup();

    service.setTheme('neon');
    await new Promise((resolve) => setTimeout(resolve, 600));

    // The suppression must not linger, or the application silently loses every
    // transition it has.
    expect(document.documentElement.hasAttribute('data-nx-theme-switching')).toBe(false);
    expect(getComputedStyle(button).transitionDuration).not.toBe('0s');
  });

  it('applies runtime token overrides to painted output', async () => {
    const { service, button } = await setup();

    service.setTheme('void');
    await new Promise((resolve) => setTimeout(resolve, 600));

    service.setTokens({ '--nx-accent': 'rgb(255, 0, 255)' });
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(getComputedStyle(button).backgroundColor).toBe('rgb(255, 0, 255)');
  });
});
