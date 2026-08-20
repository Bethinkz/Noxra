import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxInput } from './input';

@Component({
  selector: 'nx-input-host',
  imports: [NxInput],
  template: `
    <input nxInput [size]="size()" [invalid]="invalid()" [disabled]="disabled()" />
    <textarea nxInput></textarea>
  `,
})
class InputHost {
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly invalid = signal(false);
  readonly disabled = signal(false);
}

describe('NxInput', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [InputHost] }).compileComponents();
    const fixture = TestBed.createComponent(InputHost);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      input: root.querySelector('input')!,
      textarea: root.querySelector('textarea')!,
    };
  }

  it('styles the native control in place', async () => {
    const { input, textarea } = await setup();

    expect(input.classList.contains('nx-input')).toBe(true);
    expect(textarea.classList.contains('nx-input')).toBe(true);
    expect(input.getAttribute('data-size')).toBe('md');
  });

  it('reflects size changes', async () => {
    const { fixture, host, input } = await setup();

    host.size.set('lg');
    await fixture.whenStable();

    expect(input.getAttribute('data-size')).toBe('lg');
  });

  it('exposes explicit invalidity to assistive technology', async () => {
    const { fixture, host, input } = await setup();

    expect(input.hasAttribute('data-invalid')).toBe(false);
    expect(input.hasAttribute('aria-invalid')).toBe(false);

    host.invalid.set(true);
    await fixture.whenStable();

    expect(input.hasAttribute('data-invalid')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('leaves aria-invalid alone when validity is not Noxra-owned', async () => {
    const { fixture, host, input } = await setup();

    // Something else (Angular forms, app code) owns the ARIA state.
    input.setAttribute('aria-invalid', 'true');

    host.invalid.set(false);
    await fixture.whenStable();

    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('does not intercept the native disabled property', async () => {
    const { fixture, host, input } = await setup();

    host.disabled.set(true);
    await fixture.whenStable();

    // `disabled` is bound straight to the DOM: Noxra declares no such input.
    expect(input.disabled).toBe(true);
  });
});
