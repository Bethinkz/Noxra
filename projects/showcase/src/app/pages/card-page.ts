import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxBadge, NxButton, NxCard, NxCardBody, NxCardFooter, NxCardHeader } from '@noxra/ui';

@Component({
  selector: 'app-card-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxCard, NxCardHeader, NxCardBody, NxCardFooter, NxButton, NxBadge],
  template: `
    <div class="page">
      <header>
        <h1 class="page-title">Card</h1>
        <p class="page-lead">
          A surface applied to whatever element you already needed. Sections are separate directives
          rather than named slots, so you choose the elements and the order.
        </p>
      </header>

      <section class="section">
        <h2 class="section-title">Variants</h2>
        <div class="row" style="align-items: start">
          @for (variant of variants; track variant) {
            <article nxCard [variant]="variant" style="inline-size: 240px">
              <header nxCardHeader>{{ variant }}</header>
              <div nxCardBody>Surface treatment driven entirely by tokens.</div>
            </article>
          }
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Composition</h2>
        <div class="row" style="align-items: start">
          <article nxCard style="inline-size: 320px">
            <header nxCardHeader>
              Release 0.1
              <span nxBadge variant="accent" size="sm" style="margin-inline-start: 8px">draft</span>
            </header>
            <div nxCardBody>Header, body and footer are independent and all optional.</div>
            <footer nxCardFooter>
              <button nxButton size="sm">Publish</button>
              <button nxButton size="sm" variant="ghost">Discard</button>
            </footer>
          </article>

          <div nxCard style="inline-size: 240px">
            <div nxCardBody>Body only — nothing is required.</div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Interactive</h2>
        <p class="section-note">
          <code>interactive</code> is presentation only. For a genuinely activatable card, put
          <code>nxCard</code> on a <code>&lt;button&gt;</code> and get real semantics instead of a
          div pretending to be a control — tab to the second card to see the difference.
        </p>
        <div class="row" style="align-items: start">
          <div nxCard interactive style="inline-size: 240px">
            <div nxCardBody>Hover me. Not focusable — it is a div.</div>
          </div>

          <button nxCard interactive type="button" style="inline-size: 240px; text-align: start">
            <span nxCardBody style="display: block">Hover or tab to me. A real button.</span>
          </button>
        </div>
      </section>
    </div>
  `,
})
export class CardPage {
  protected readonly variants = ['default', 'outlined', 'raised'] as const;
}
