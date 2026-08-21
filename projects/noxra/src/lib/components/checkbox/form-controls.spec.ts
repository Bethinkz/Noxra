import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxRadio } from '../radio/radio';
import { NxSlider } from '../slider/slider';
import { NxSwitch } from '../switch/switch';
import { NxCheckbox } from './checkbox';

/**
 * The native form controls share a shape — a directive that paints a real
 * input and declares no state of its own — so they share a spec. What matters
 * for all four is the same thing: that the element underneath is untouched.
 */

@Component({
  selector: 'nx-controls-host',
  imports: [NxCheckbox, NxRadio, NxSwitch, NxSlider],
  template: `
    <input type="checkbox" nxCheckbox [size]="size()" [invalid]="invalid()" />
    <input type="radio" name="plan" value="free" nxRadio />
    <input type="radio" name="plan" value="pro" nxRadio />
    <input type="checkbox" nxSwitch />
    <input type="range" nxSlider min="0" max="10" step="2" value="4" />
  `,
})
class ControlsHost {
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly invalid = signal(false);
}

describe('native form controls', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [ControlsHost] }).compileComponents();
    const fixture = TestBed.createComponent(ControlsHost);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      checkbox: root.querySelector<HTMLInputElement>('.nx-checkbox')!,
      radios: [...root.querySelectorAll<HTMLInputElement>('.nx-radio')],
      toggle: root.querySelector<HTMLInputElement>('.nx-switch')!,
      slider: root.querySelector<HTMLInputElement>('.nx-slider')!,
    };
  }

  it('keeps every element native', async () => {
    const { checkbox, radios, toggle, slider } = await setup();

    // The whole design rests on these still being real inputs.
    expect(checkbox.type).toBe('checkbox');
    expect(radios[0].type).toBe('radio');
    expect(toggle.type).toBe('checkbox');
    expect(slider.type).toBe('range');

    for (const el of [checkbox, ...radios, toggle, slider]) {
      expect(el.children.length).toBe(0);
    }
  });

  it('gives the switch a switch role over a real checkbox', async () => {
    const { toggle } = await setup();

    // The role changes how state is announced - "on"/"off" rather than
    // "checked" - while the element keeps checkbox behaviour and submission.
    expect(toggle.getAttribute('role')).toBe('switch');
    expect(toggle.type).toBe('checkbox');
  });

  it('leaves checked state entirely to the browser', async () => {
    const { checkbox, toggle } = await setup();

    expect(checkbox.checked).toBe(false);
    checkbox.click();
    expect(checkbox.checked).toBe(true);

    toggle.click();
    expect(toggle.checked).toBe(true);
  });

  it('supports the indeterminate state the platform provides', async () => {
    const { checkbox } = await setup();

    // A tri-state checkbox needs no Noxra API: `indeterminate` is a DOM
    // property, and the stylesheet matches `:indeterminate`.
    checkbox.indeterminate = true;
    expect(checkbox.indeterminate).toBe(true);
    expect(checkbox.matches(':indeterminate')).toBe(true);
  });

  it('groups radios by name without a group component', async () => {
    const { radios } = await setup();

    radios[0].click();
    expect(radios[0].checked).toBe(true);

    radios[1].click();
    // Exclusivity comes from the shared `name`, not from Noxra.
    expect(radios[0].checked).toBe(false);
    expect(radios[1].checked).toBe(true);
  });

  it('leaves range semantics to the element', async () => {
    const { slider } = await setup();

    expect(slider.min).toBe('0');
    expect(slider.max).toBe('10');
    expect(slider.step).toBe('2');
    expect(slider.value).toBe('4');
  });

  it('reflects size and explicit invalidity', async () => {
    const { fixture, host, checkbox } = await setup();

    expect(checkbox.getAttribute('data-size')).toBe('md');
    expect(checkbox.hasAttribute('aria-invalid')).toBe(false);

    host.size.set('lg');
    host.invalid.set(true);
    await fixture.whenStable();

    expect(checkbox.getAttribute('data-size')).toBe('lg');
    expect(checkbox.getAttribute('aria-invalid')).toBe('true');
  });

  it('does not intercept the native disabled property', async () => {
    const { checkbox, slider } = await setup();

    checkbox.disabled = true;
    slider.disabled = true;

    // None of these directives declares a `disabled` input, so binding it
    // reaches the DOM directly.
    expect(checkbox.disabled).toBe(true);
    expect(slider.disabled).toBe(true);
  });
});
