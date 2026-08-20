import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxButton } from './button';
import type { NxButtonVariant } from './button.types';

@Component({
  selector: 'nx-button-host',
  imports: [NxButton],
  template: `
    <button
      nxButton
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
      [loading]="loading()"
      (click)="clicks.set(clicks() + 1)"
    >
      Save
    </button>
    <a nxButton href="/docs" [disabled]="anchorDisabled()">Docs</a>
  `,
})
class ButtonHost {
  readonly variant = signal<NxButtonVariant>('solid');
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly anchorDisabled = signal(false);
  readonly clicks = signal(0);
}

describe('NxButton', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [ButtonHost] }).compileComponents();
    const fixture = TestBed.createComponent(ButtonHost);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      button: root.querySelector('button')!,
      anchor: root.querySelector('a')!,
    };
  }

  it('enhances the native element without adding DOM', async () => {
    const { button } = await setup();

    expect(button.tagName).toBe('BUTTON');
    expect(button.classList.contains('nx-button')).toBe(true);
    // The label is the only child: no wrapper, no generated span.
    expect(button.children.length).toBe(0);
    expect(button.textContent?.trim()).toBe('Save');
  });

  it('reflects variant and size as data attributes', async () => {
    const { fixture, host, button } = await setup();

    expect(button.getAttribute('data-variant')).toBe('solid');
    expect(button.getAttribute('data-size')).toBe('md');

    host.variant.set('ghost');
    host.size.set('lg');
    await fixture.whenStable();

    expect(button.getAttribute('data-variant')).toBe('ghost');
    expect(button.getAttribute('data-size')).toBe('lg');
  });

  it('uses native disabled semantics on a button', async () => {
    const { fixture, host, button } = await setup();

    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.classList.contains('nx-button--enabled')).toBe(true);

    host.disabled.set(true);
    await fixture.whenStable();

    expect(button.hasAttribute('disabled')).toBe(true);
    // Native disabled is sufficient; no redundant ARIA.
    expect(button.hasAttribute('aria-disabled')).toBe(false);
    expect(button.classList.contains('nx-button--enabled')).toBe(false);
  });

  it('keeps a loading button focusable and marks it busy', async () => {
    const { fixture, host, button } = await setup();

    host.loading.set(true);
    await fixture.whenStable();

    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('data-loading')).toBe(true);
    // Crucially NOT natively disabled, so focus is not lost mid-interaction.
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.classList.contains('nx-button--enabled')).toBe(false);
  });

  it('leaves activation untouched while enabled', async () => {
    const { fixture, host, button } = await setup();

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    button.dispatchEvent(click);
    await fixture.whenStable();

    expect(click.defaultPrevented).toBe(false);
    expect(host.clicks()).toBe(1);
  });

  it('cancels keyboard activation while loading', async () => {
    const { fixture, host, button } = await setup();

    host.loading.set(true);
    await fixture.whenStable();

    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      button.dispatchEvent(event);
      // Cancelling keydown is what stops the browser producing a click at all.
      expect(event.defaultPrevented, `key "${key}"`).toBe(true);
    }
  });

  it('does not trap other keys while loading', async () => {
    const { fixture, host, button } = await setup();

    host.loading.set(true);
    await fixture.whenStable();

    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    button.dispatchEvent(tab);

    expect(tab.defaultPrevented).toBe(false);
  });

  it('cancels the default action and containment of a busy click', async () => {
    const { fixture, host, button } = await setup();

    host.loading.set(true);
    await fixture.whenStable();

    let reachedAncestor = false;
    const onAncestor = () => {
      reachedAncestor = true;
    };
    document.addEventListener('click', onAncestor);

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    button.dispatchEvent(click);
    await fixture.whenStable();

    document.removeEventListener('click', onAncestor);

    expect(click.defaultPrevented).toBe(true);
    expect(reachedAncestor).toBe(false);
  });

  it('falls back to ARIA semantics on an anchor', async () => {
    const { fixture, host, anchor } = await setup();

    expect(anchor.hasAttribute('aria-disabled')).toBe(false);
    expect(anchor.hasAttribute('tabindex')).toBe(false);

    host.anchorDisabled.set(true);
    await fixture.whenStable();

    // An anchor has no native disabled state.
    expect(anchor.hasAttribute('disabled')).toBe(false);
    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    expect(anchor.getAttribute('tabindex')).toBe('-1');
  });
});
