import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxButton } from '../button/button';
import { NxTooltip } from './tooltip';

/**
 * Browser-only. The tooltip's entire positioning implementation is CSS anchor
 * positioning plus the Popover API, so jsdom - which has neither, and does no
 * layout - can only check that the right attributes get set. Whether the
 * bubble actually reaches the top layer and lands beside its trigger is only
 * observable here.
 */

@Component({
  selector: 'nx-tooltip-browser-host',
  imports: [NxButton, NxTooltip],
  template: `
    <div style="padding: 200px; display: flex; justify-content: center">
      <button nxButton nxTooltip="Save changes" tooltipPlacement="top">Save</button>
    </div>
  `,
})
class TooltipBrowserHost {}

describe('NxTooltip (browser)', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [TooltipBrowserHost] }).compileComponents();
    const fixture = TestBed.createComponent(TooltipBrowserHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    const trigger = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    return { fixture, trigger };
  }

  afterEach(() => {
    for (const el of document.querySelectorAll('nx-tooltip-browser-host, .nx-tooltip')) {
      el.remove();
    }
  });

  const bubble = () => document.querySelector<HTMLElement>('.nx-tooltip')!;

  it('supports the platform features it is built on', () => {
    // If any of these are false the component degrades rather than breaks, but
    // the assertions below would be measuring the fallback instead.
    expect('popover' in document.createElement('div')).toBe(true);
    expect(CSS.supports('position-area', 'block-start')).toBe(true);
    expect(CSS.supports('anchor-name', '--x')).toBe(true);
  });

  it('opens into the top layer', async () => {
    const { trigger } = await setup();

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await new Promise((resolve) => setTimeout(resolve, 100));

    // `:popover-open` only matches a popover the browser has actually shown,
    // which means it is in the top layer and escapes any overflow or stacking
    // context around the trigger.
    expect(bubble().matches(':popover-open')).toBe(true);
    expect(bubble().getBoundingClientRect().width).toBeGreaterThan(0);
  });

  it('positions itself above the trigger', async () => {
    const { trigger } = await setup();

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await new Promise((resolve) => setTimeout(resolve, 100));

    const tip = bubble().getBoundingClientRect();
    const anchor = trigger.getBoundingClientRect();

    // The real assertion: anchor positioning resolved and put the bubble
    // beside its trigger, with no JavaScript measuring anything.
    expect(tip.bottom).toBeLessThanOrEqual(anchor.top + 1);

    const tipCentre = tip.left + tip.width / 2;
    const anchorCentre = anchor.left + anchor.width / 2;
    expect(Math.abs(tipCentre - anchorCentre)).toBeLessThan(20);
  });

  it('closes again on mouseleave', async () => {
    const { trigger } = await setup();

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(bubble().matches(':popover-open')).toBe(true);

    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(bubble().matches(':popover-open')).toBe(false);
  });
});
