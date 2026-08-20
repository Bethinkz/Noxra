import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxBadge, NxButton, NxCard, NxCardBody, NxCardHeader } from '@noxra/ui';

@Component({
  selector: 'app-foundation-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxButton, NxBadge, NxCard, NxCardHeader, NxCardBody],
  template: `
    <div class="page">
      <header>
        <h1 class="page-title">Foundation</h1>
        <p class="page-lead">
          Architecture preview for Noxra. Styling here is placeholder: this milestone validates the
          token, motion and component architecture, not the visual identity.
        </p>
      </header>

      <section class="section">
        <h2 class="section-title">Predictable DOM</h2>
        <p class="section-note">
          Every component in this milestone is a directive on a native element, so the markup you
          write is the markup that renders. Inspect the button below — one element, no wrappers, no
          generated class hashes.
        </p>
        <div class="row">
          <button nxButton>Inspect me</button>
        </div>
        <pre class="code">&lt;button nxButton&gt;Inspect me&lt;/button&gt;</pre>
      </section>

      <section class="section">
        <h2 class="section-title">Composition</h2>
        <div class="row">
          <article nxCard style="max-inline-size: 340px">
            <header nxCardHeader>Deployment</header>
            <div nxCardBody>
              Sections are independent directives, so you keep control of the elements and the
              order.
              <span nxBadge variant="accent" style="margin-inline-start: 8px">live</span>
            </div>
          </article>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Runtime theming</h2>
        <p class="section-note">
          The theme and motion selectors in the sidebar write a single attribute on
          <code>&lt;html&gt;</code>. No stylesheet is swapped and nothing re-renders — every
          component reads semantic tokens, so a theme change is one attribute write.
        </p>
      </section>
    </div>
  `,
})
export class FoundationPage {}
