import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxBadge, NxButton, NxCard, NxCardBody, NxCardHeader } from '@noxra/ui';

interface TypeStep {
  readonly token: string;
  readonly size: string;
  readonly sample: string;
}

interface PaletteEntry {
  readonly token: string;
  readonly role: string;
}

@Component({
  selector: 'app-foundation-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxButton, NxBadge, NxCard, NxCardHeader, NxCardBody],
  template: `
    <div class="page">
      <header>
        <h1 class="page-title">Foundation</h1>
        <p class="page-lead">
          Noxra is dark by default, restrained by default, and native by default. Near-black
          surfaces, a neutral grey ramp, and one neon accent that stays rare enough to mean
          something.
        </p>
      </header>

      <section class="section">
        <h2 class="section-title">Type scale</h2>
        <p class="section-note">
          Flat where controls live — 12, 14, 16 — and open above it. Interface text wants small
          predictable steps; headings want obvious ones. One scale trying to do both is why so many
          systems end up with weak headings.
        </p>
        <div>
          @for (step of typeScale; track step.token) {
            <div class="type-row">
              <span class="type-meta">{{ step.token }} · {{ step.size }}</span>
              <span
                class="type-sample"
                [style.font-size]="'var(--nx-font-size-' + step.token + ')'"
              >
                {{ step.sample }}
              </span>
            </div>
          }
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Palette</h2>
        <p class="section-note">
          Two values here are lighter than taste alone would make them.
          <code>--nx-content-tertiary</code> holds 4.5:1 because it carries real text, and
          <code>--nx-border-strong</code> holds 3:1 because it draws the boundary of form controls,
          which WCAG treats as information. <code>npm run check:contrast</code> fails the build if
          either drifts.
        </p>
        <div class="palette">
          @for (entry of palette; track entry.token) {
            <div class="palette-chip" [style.background]="'var(' + entry.token + ')'">
              <span
                class="palette-name"
                [style.color]="entry.token === '--nx-accent' ? 'var(--nx-content-on-accent)' : null"
              >
                {{ entry.token.replace('--nx-', '') }}
              </span>
              <span
                class="palette-role"
                [style.color]="entry.token === '--nx-accent' ? 'var(--nx-content-on-accent)' : null"
              >
                {{ entry.role }}
              </span>
            </div>
          }
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Predictable DOM</h2>
        <p class="section-note">
          Every component in this milestone is a directive on a native element, so the markup you
          write is the markup that renders. Inspect the button below — one element, no wrappers, no
          generated class hashes.
        </p>
        <div class="row">
          <button nxButton>Inspect me</button>
          <button nxButton variant="outline">Outline</button>
          <button nxButton variant="ghost">Ghost</button>
        </div>
        <pre class="code">&lt;button nxButton&gt;Inspect me&lt;/button&gt;</pre>
      </section>

      <section class="section">
        <h2 class="section-title">Composition</h2>
        <div class="row">
          <article nxCard style="max-inline-size: 360px">
            <header nxCardHeader>
              Deployment
              <span nxBadge variant="accent" size="sm" style="margin-inline-start: 8px">live</span>
            </header>
            <div nxCardBody>
              Sections are independent directives, so you keep control of the elements and the
              order.
            </div>
          </article>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Runtime theming</h2>
        <p class="section-note">
          The theme selector in the sidebar writes a single attribute on
          <code>&lt;html&gt;</code>. No stylesheet is swapped and nothing re-renders — every
          component reads semantic tokens, so a theme change is one attribute write. Try
          <strong>mono</strong> to see the accent disappear entirely, and <strong>light</strong> to
          see it invert.
        </p>
      </section>
    </div>
  `,
})
export class FoundationPage {
  protected readonly typeScale: readonly TypeStep[] = [
    { token: '2xl', size: '32px', sample: 'Motion-first interfaces' },
    { token: 'xl', size: '24px', sample: 'Motion-first interfaces' },
    { token: 'lg', size: '20px', sample: 'Motion-first interfaces' },
    { token: 'md', size: '16px', sample: 'The quick brown fox jumps over the lazy dog' },
    { token: 'sm', size: '14px', sample: 'The quick brown fox jumps over the lazy dog' },
    { token: 'xs', size: '12px', sample: 'The quick brown fox jumps over the lazy dog' },
  ];

  protected readonly palette: readonly PaletteEntry[] = [
    { token: '--nx-surface-base', role: 'page' },
    { token: '--nx-surface-raised', role: 'cards, inputs' },
    { token: '--nx-surface-overlay', role: 'dialogs, menus' },
    { token: '--nx-accent', role: 'used sparingly' },
  ];
}
