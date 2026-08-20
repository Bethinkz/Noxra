import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxButton } from './button';

/**
 * Browser-only. `pointer-events: none` is half of the button's activation
 * guard while loading, and it is a hit-testing behaviour — jsdom does no
 * layout, so the jsdom suite can only cover the keyboard half. Without this
 * file, the pointer half is asserted nowhere.
 */

@Component({
  selector: 'nx-button-browser-host',
  imports: [NxButton],
  template: `
    <button nxButton [loading]="loading()" (click)="clicks.set(clicks() + 1)">Save</button>
  `,
})
class ButtonBrowserHost {
  readonly loading = signal(false);
  readonly clicks = signal(0);
}

describe('NxButton (browser)', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [ButtonBrowserHost] }).compileComponents();
    const fixture = TestBed.createComponent(ButtonBrowserHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    return { fixture, host: fixture.componentInstance, button };
  }

  afterEach(() => {
    for (const el of document.querySelectorAll('nx-button-browser-host')) {
      el.remove();
    }
  });

  /** What the browser would actually dispatch a click to at this point. */
  function hitTestAtCentreOf(element: Element): Element | null {
    const box = element.getBoundingClientRect();
    return document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
  }

  it('is the hit-test target while idle', async () => {
    const { button } = await setup();

    expect(button.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(hitTestAtCentreOf(button)).toBe(button);
  });

  it('stops receiving pointer input while loading', async () => {
    const { fixture, host, button } = await setup();

    host.loading.set(true);
    await fixture.whenStable();

    expect(getComputedStyle(button).pointerEvents).toBe('none');

    // The real assertion: the browser would not dispatch a pointer click here
    // at all, which is why the guard does not depend on listener ordering.
    expect(hitTestAtCentreOf(button)).not.toBe(button);
  });

  it('takes pointer input again once loading ends', async () => {
    const { fixture, host, button } = await setup();

    host.loading.set(true);
    await fixture.whenStable();
    host.loading.set(false);
    await fixture.whenStable();

    expect(getComputedStyle(button).pointerEvents).not.toBe('none');
    expect(hitTestAtCentreOf(button)).toBe(button);
  });

  it('shows a focus ring only for keyboard focus', async () => {
    const { button } = await setup();

    // Programmatic focus is not `:focus-visible`, which is what keeps pointer
    // users from seeing a ring they did not ask for.
    button.focus();
    expect(button.matches(':focus')).toBe(true);
  });
});
