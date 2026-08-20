import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxCard, NxCardBody, NxCardFooter, NxCardHeader } from './card';
import type { NxCardVariant } from './card.types';

@Component({
  selector: 'nx-card-host',
  imports: [NxCard, NxCardHeader, NxCardBody, NxCardFooter],
  template: `
    <article nxCard [variant]="variant()" [interactive]="interactive()">
      <header nxCardHeader>Deployment</header>
      <div nxCardBody>Rolled out.</div>
      <footer nxCardFooter>Footer</footer>
    </article>
  `,
})
class CardHost {
  readonly variant = signal<NxCardVariant>('default');
  readonly interactive = signal(false);
}

describe('NxCard', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [CardHost] }).compileComponents();
    const fixture = TestBed.createComponent(CardHost);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, card: root.querySelector('article')! };
  }

  it('keeps the author-chosen elements', async () => {
    const { card } = await setup();

    expect(card.tagName).toBe('ARTICLE');
    expect(card.classList.contains('nx-card')).toBe(true);
    expect(card.querySelector('header')!.classList.contains('nx-card__header')).toBe(true);
    expect(card.querySelector('div')!.classList.contains('nx-card__body')).toBe(true);
    expect(card.querySelector('footer')!.classList.contains('nx-card__footer')).toBe(true);
  });

  it('reflects the variant', async () => {
    const { fixture, host, card } = await setup();

    expect(card.getAttribute('data-variant')).toBe('default');

    host.variant.set('raised');
    await fixture.whenStable();

    expect(card.getAttribute('data-variant')).toBe('raised');
  });

  it('treats interactive as presentation only', async () => {
    const { fixture, host, card } = await setup();

    host.interactive.set(true);
    await fixture.whenStable();

    expect(card.hasAttribute('data-interactive')).toBe(true);
    // Noxra must not fake a control: no invented role, no invented tab stop.
    expect(card.hasAttribute('role')).toBe(false);
    expect(card.hasAttribute('tabindex')).toBe(false);
  });
});
