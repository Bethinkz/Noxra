import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxBadge } from '@noxra/ui';

@Component({
  selector: 'app-badge-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxBadge],
  template: `
    <div class="page">
      <header>
        <h1 class="page-title">Badge</h1>
        <p class="page-lead">
          A small status label. Badges are content, not controls: no focus, no hover, no pressed
          state. A badge that needs to be clickable belongs inside a button.
        </p>
      </header>

      <section class="section">
        <h2 class="section-title">Variants</h2>
        <div class="row">
          @for (variant of variants; track variant) {
            <span nxBadge [variant]="variant">{{ variant }}</span>
          }
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Sizes</h2>
        <p class="section-note">
          Badge narrows the shared <code>NxSize</code> union rather than inventing its own
          vocabulary.
        </p>
        <div class="row">
          <span nxBadge size="sm">small</span>
          <span nxBadge size="md">medium</span>
          <span nxBadge variant="accent" size="sm">small</span>
          <span nxBadge variant="accent" size="md">medium</span>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">In context</h2>
        <div class="row">
          <span>Build 4821 <span nxBadge variant="accent">passing</span></span>
          <span>Build 4820 <span nxBadge variant="outline">skipped</span></span>
          <span>Build 4819 <span nxBadge>queued</span></span>
        </div>
      </section>
    </div>
  `,
})
export class BadgePage {
  protected readonly variants = ['neutral', 'accent', 'outline'] as const;
}
