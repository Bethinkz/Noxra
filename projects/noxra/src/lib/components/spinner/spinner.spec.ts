import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxSpinner } from './spinner';

@Component({
  selector: 'nx-spinner-host',
  imports: [NxSpinner],
  template: `<span nxSpinner [size]="size()" [label]="label()"></span>`,
})
class SpinnerHost {
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly label = signal('Loading');
}

describe('NxSpinner', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [SpinnerHost] }).compileComponents();
    const fixture = TestBed.createComponent(SpinnerHost);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, spinner: root.querySelector('span')! };
  }

  it('announces itself as a status region', async () => {
    const { spinner } = await setup();

    expect(spinner.classList.contains('nx-spinner')).toBe(true);
    expect(spinner.getAttribute('role')).toBe('status');
    expect(spinner.getAttribute('aria-label')).toBe('Loading');
  });

  it('drops the label when a visible one names the region', async () => {
    const { fixture, host, spinner } = await setup();

    host.label.set('');
    await fixture.whenStable();

    expect(spinner.hasAttribute('aria-label')).toBe(false);
  });

  it('reflects size', async () => {
    const { fixture, host, spinner } = await setup();

    host.size.set('lg');
    await fixture.whenStable();

    expect(spinner.getAttribute('data-size')).toBe('lg');
  });
});
