import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxBadge } from './badge';
import type { NxBadgeSize, NxBadgeVariant } from './badge.types';

@Component({
  selector: 'nx-badge-host',
  imports: [NxBadge],
  template: `<span nxBadge [variant]="variant()" [size]="size()">Live</span>`,
})
class BadgeHost {
  readonly variant = signal<NxBadgeVariant>('neutral');
  readonly size = signal<NxBadgeSize>('md');
}

describe('NxBadge', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [BadgeHost] }).compileComponents();
    const fixture = TestBed.createComponent(BadgeHost);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, badge: root.querySelector('span')! };
  }

  it('renders defaults', async () => {
    const { badge } = await setup();

    expect(badge.classList.contains('nx-badge')).toBe(true);
    expect(badge.getAttribute('data-variant')).toBe('neutral');
    expect(badge.getAttribute('data-size')).toBe('md');
  });

  it('is content, not a control', async () => {
    const { badge } = await setup();

    expect(badge.hasAttribute('tabindex')).toBe(false);
    expect(badge.hasAttribute('role')).toBe(false);
  });

  it('reflects variant and size', async () => {
    const { fixture, host, badge } = await setup();

    host.variant.set('accent');
    host.size.set('sm');
    await fixture.whenStable();

    expect(badge.getAttribute('data-variant')).toBe('accent');
    expect(badge.getAttribute('data-size')).toBe('sm');
  });
});
