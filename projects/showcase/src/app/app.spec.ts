import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';

describe('App shell', () => {
  it('renders navigation for every showcase section', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.nav-link'),
    ).map((link) => link.textContent?.trim());

    expect(labels).toEqual([
      'Foundation',
      'Tokens',
      'Motion',
      'Button',
      'Forms',
      'Card',
      'Badge',
      'Display',
      'Overlays',
    ]);
  });

  it('applies the configured Noxra theme to the document', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(document.documentElement.getAttribute('data-nx-theme')).toBe('void');
  });
});
