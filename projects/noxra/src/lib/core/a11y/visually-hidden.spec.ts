import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxVisuallyHidden } from './visually-hidden';

@Component({
  selector: 'nx-vh-host',
  imports: [NxVisuallyHidden],
  template: `<span nxVisuallyHidden>Loading results</span>`,
})
class VisuallyHiddenHost {}

describe('NxVisuallyHidden', () => {
  it('hides visually while keeping the text in the accessibility tree', async () => {
    await TestBed.configureTestingModule({ imports: [VisuallyHiddenHost] }).compileComponents();
    const fixture = TestBed.createComponent(VisuallyHiddenHost);
    await fixture.whenStable();

    const span = (fixture.nativeElement as HTMLElement).querySelector('span')!;

    expect(span.classList.contains('nx-visually-hidden')).toBe(true);
    // Not hidden from assistive technology.
    expect(span.hasAttribute('aria-hidden')).toBe(false);
    expect(span.textContent).toBe('Loading results');
  });
});
