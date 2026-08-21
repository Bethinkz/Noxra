import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxAccordion, NxAccordionItem, NxAccordionPanel, NxAccordionTrigger } from './accordion';

/**
 * Browser-only. The accordion's entire single-open behaviour is the browser's
 * handling of a shared `name` on `<details>`. jsdom can only confirm the
 * attribute is written; whether it actually closes the sibling — which is the
 * whole reason Noxra writes no coordination code — needs a real engine.
 */

@Component({
  selector: 'nx-accordion-browser-host',
  imports: [NxAccordion, NxAccordionItem, NxAccordionTrigger, NxAccordionPanel],
  template: `
    <div nxAccordion [multiple]="multiple()">
      <details nxAccordionItem>
        <summary nxAccordionTrigger>One</summary>
        <div nxAccordionPanel>First</div>
      </details>
      <details nxAccordionItem>
        <summary nxAccordionTrigger>Two</summary>
        <div nxAccordionPanel>Second</div>
      </details>
    </div>
  `,
})
class AccordionBrowserHost {
  readonly multiple = signal(false);
}

describe('NxAccordion (browser)', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [AccordionBrowserHost] }).compileComponents();
    const fixture = TestBed.createComponent(AccordionBrowserHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      items: [...root.querySelectorAll<HTMLDetailsElement>('details')],
    };
  }

  afterEach(() => {
    for (const el of document.querySelectorAll('nx-accordion-browser-host')) {
      el.remove();
    }
  });

  it('closes the sibling when one opens', async () => {
    const { items } = await setup();

    items[0].open = true;
    items[1].open = true;
    // The browser enforces this from the shared `name` alone. If it ever
    // stopped, Noxra would silently become a multi-open accordion.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(items[1].open).toBe(true);
    expect(items[0].open).toBe(false);
  });

  it('lets both stay open when multiple is set', async () => {
    const { fixture, host, items } = await setup();

    host.multiple.set(true);
    await fixture.whenStable();

    items[0].open = true;
    items[1].open = true;
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(items[0].open).toBe(true);
    expect(items[1].open).toBe(true);
  });

  it('toggles from the summary, with no script involved', async () => {
    const { items } = await setup();

    items[0].querySelector('summary')!.click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(items[0].open).toBe(true);
  });
});
