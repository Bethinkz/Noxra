import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxTooltip } from './tooltip';
import type { NxTooltipPlacement } from './tooltip.types';

@Component({
  selector: 'nx-tooltip-host',
  imports: [NxTooltip],
  template: ` <button [nxTooltip]="text()" [tooltipPlacement]="placement()">Save</button> `,
})
class TooltipHost {
  readonly text = signal('Save changes');
  readonly placement = signal<NxTooltipPlacement>('top');
}

/** jsdom has no Popover API; the directive only needs it to not explode. */
function stubPopover(): void {
  const proto = HTMLElement.prototype as HTMLElement & {
    showPopover?: () => void;
    hidePopover?: () => void;
  };
  proto.showPopover ??= function showPopover(this: HTMLElement) {
    this.setAttribute('data-open', '');
  };
  proto.hidePopover ??= function hidePopover(this: HTMLElement) {
    this.removeAttribute('data-open');
  };
}

describe('NxTooltip', () => {
  beforeEach(() => stubPopover());

  afterEach(() => {
    for (const bubble of document.querySelectorAll('.nx-tooltip')) {
      bubble.remove();
    }
  });

  async function setup() {
    await TestBed.configureTestingModule({ imports: [TooltipHost] }).compileComponents();
    const fixture = TestBed.createComponent(TooltipHost);
    await fixture.whenStable();

    const trigger = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    return { fixture, host: fixture.componentInstance, trigger };
  }

  const bubble = () => document.querySelector<HTMLElement>('.nx-tooltip');

  it('adds no DOM until it is needed', async () => {
    await setup();

    // A tooltip that is never hovered should cost nothing.
    expect(bubble()).toBeNull();
  });

  it('creates a described bubble on hover', async () => {
    const { trigger } = await setup();

    trigger.dispatchEvent(new MouseEvent('mouseenter'));

    const tip = bubble()!;
    expect(tip).toBeTruthy();
    expect(tip.getAttribute('role')).toBe('tooltip');
    expect(tip.textContent).toBe('Save changes');
    expect(tip.getAttribute('popover')).toBe('manual');

    // Described, not named: the trigger keeps its own accessible name.
    expect(trigger.getAttribute('aria-describedby')).toBe(tip.id);
  });

  it('opens on focus, not only on hover', async () => {
    const { trigger } = await setup();

    // A tooltip reachable only by pointer is invisible to keyboard users.
    trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    expect(bubble()).toBeTruthy();
  });

  it('reuses the same bubble across shows', async () => {
    const { trigger } = await setup();

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    const first = bubble();
    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    trigger.dispatchEvent(new MouseEvent('mouseenter'));

    expect(document.querySelectorAll('.nx-tooltip').length).toBe(1);
    expect(bubble()).toBe(first);
  });

  it('links the anchor to the trigger', async () => {
    const { trigger } = await setup();

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    const tip = bubble()!;

    // This pairing is the whole positioning mechanism.
    expect(trigger.style.getPropertyValue('anchor-name')).toBe(`--${tip.id}`);
    expect(tip.style.getPropertyValue('position-anchor')).toBe(`--${tip.id}`);
  });

  it('tracks text and placement changes', async () => {
    const { fixture, host, trigger } = await setup();

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    expect(bubble()!.getAttribute('data-placement')).toBe('top');

    host.text.set('Publish changes');
    host.placement.set('bottom');
    await fixture.whenStable();

    expect(bubble()!.textContent).toBe('Publish changes');
    expect(bubble()!.getAttribute('data-placement')).toBe('bottom');
  });

  it('stays silent when there is nothing to describe', async () => {
    const { fixture, host, trigger } = await setup();

    host.text.set('');
    await fixture.whenStable();
    trigger.dispatchEvent(new MouseEvent('mouseenter'));

    expect(bubble()).toBeNull();
  });

  it('removes its bubble when the trigger is destroyed', async () => {
    const { fixture, trigger } = await setup();

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    expect(bubble()).toBeTruthy();

    // The bubble lives on `document.body`, so nothing else would collect it.
    fixture.destroy();

    expect(bubble()).toBeNull();
  });
});
