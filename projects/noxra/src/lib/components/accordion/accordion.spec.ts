import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxBreadcrumb, NxBreadcrumbItem, NxBreadcrumbList } from '../breadcrumb/breadcrumb';
import { NxAccordion, NxAccordionItem, NxAccordionPanel, NxAccordionTrigger } from './accordion';

@Component({
  selector: 'nx-accordion-host',
  imports: [
    NxAccordion,
    NxAccordionItem,
    NxAccordionPanel,
    NxAccordionTrigger,
    NxBreadcrumb,
    NxBreadcrumbList,
    NxBreadcrumbItem,
  ],
  template: `
    <div nxAccordion [multiple]="multiple()">
      <details nxAccordionItem>
        <summary nxAccordionTrigger>Shipping</summary>
        <div nxAccordionPanel>Ships in 2-3 days.</div>
      </details>
      <details nxAccordionItem>
        <summary nxAccordionTrigger>Returns</summary>
        <div nxAccordionPanel>30 days.</div>
      </details>
    </div>

    <div id="second" nxAccordion>
      <details nxAccordionItem><summary nxAccordionTrigger>Other</summary></details>
    </div>

    <details id="lone" nxAccordionItem><summary nxAccordionTrigger>Standalone</summary></details>

    <nav nxBreadcrumb>
      <ol nxBreadcrumbList>
        <li nxBreadcrumbItem><a href="/">Home</a></li>
        <li nxBreadcrumbItem><span aria-current="page">Noxra</span></li>
      </ol>
    </nav>

    <nav id="named" nxBreadcrumb aria-label="You are here">
      <ol nxBreadcrumbList></ol>
    </nav>
  `,
})
class AccordionHost {
  readonly multiple = signal(false);
}

describe('NxAccordion', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [AccordionHost] }).compileComponents();
    const fixture = TestBed.createComponent(AccordionHost);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      items: [...root.querySelectorAll<HTMLDetailsElement>('.nx-accordion:not(#second) > details')],
      root,
    };
  }

  it('uses real disclosures', async () => {
    const { items } = await setup();

    // <details> already opens, closes, announces its state, is keyboard
    // operable and is expanded by find-in-page. None of that is Noxra's.
    expect(items[0].tagName).toBe('DETAILS');
    expect(items[0].querySelector('summary')).toBeTruthy();
  });

  it('makes a group exclusive with a shared name', async () => {
    const { items } = await setup();

    // Exclusivity is the browser's, driven entirely by matching `name`.
    expect(items[0].getAttribute('name')).toBeTruthy();
    expect(items[0].getAttribute('name')).toBe(items[1].getAttribute('name'));
  });

  it('gives separate accordions separate names', async () => {
    const { items, root } = await setup();
    const other = root.querySelector<HTMLDetailsElement>('#second > details')!;

    // Two accordions on one page must not close each other's items.
    expect(other.getAttribute('name')).not.toBe(items[0].getAttribute('name'));
  });

  it('drops the shared name when several may be open', async () => {
    const { fixture, host, items } = await setup();

    host.multiple.set(true);
    await fixture.whenStable();

    // Allowing multiple open is the absence of a shared name, not extra logic.
    expect(items[0].hasAttribute('name')).toBe(false);
  });

  it('works as a standalone disclosure outside any group', async () => {
    const { root } = await setup();
    const lone = root.querySelector<HTMLDetailsElement>('#lone')!;

    expect(lone.hasAttribute('name')).toBe(false);
    expect(lone.classList.contains('nx-accordion__item')).toBe(true);
  });
});

describe('NxBreadcrumb', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [AccordionHost] }).compileComponents();
    const fixture = TestBed.createComponent(AccordionHost);
    await fixture.whenStable();
    return { root: fixture.nativeElement as HTMLElement };
  }

  it('labels the navigation landmark', async () => {
    const { root } = await setup();

    // A <nav> with no name is an unhelpful landmark, and every breadcrumb's
    // name is the same word.
    expect(root.querySelector('nav.nx-breadcrumb')!.getAttribute('aria-label')).toBe('Breadcrumb');
  });

  it('never overrides an author-supplied label', async () => {
    const { root } = await setup();

    expect(root.querySelector('#named')!.getAttribute('aria-label')).toBe('You are here');
  });

  it('keeps the list ordered and the separators out of the tree', async () => {
    const { root } = await setup();

    // An <ol> because the order carries meaning; separators are CSS, so a
    // screen reader does not read a chevron between every crumb.
    expect(root.querySelector('.nx-breadcrumb__list')!.tagName).toBe('OL');
    expect(root.querySelector('[aria-current="page"]')!.textContent).toBe('Noxra');
  });
});
