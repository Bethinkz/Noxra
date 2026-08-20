import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxButton } from '@noxra/ui';

@Component({
  selector: 'app-button-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxButton],
  template: `
    <div class="page">
      <header>
        <h1 class="page-title">Button</h1>
        <p class="page-lead">
          A directive on a native <code>&lt;button&gt;</code> or <code>&lt;a&gt;</code>. No wrapper
          element, and the loading indicator is a pseudo-element, so a Noxra button is exactly one
          DOM node.
        </p>
      </header>

      <section class="section">
        <h2 class="section-title">Variants</h2>
        <div class="row">
          <button nxButton>Solid</button>
          <button nxButton variant="outline">Outline</button>
          <button nxButton variant="ghost">Ghost</button>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Sizes</h2>
        <div class="row">
          <button nxButton size="sm">Small</button>
          <button nxButton size="md">Medium</button>
          <button nxButton size="lg">Large</button>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Disabled</h2>
        <p class="section-note">
          Uses the native <code>disabled</code> attribute, so the browser's own semantics apply and
          the control leaves the tab order. Tab through this row to confirm.
        </p>
        <div class="row">
          <button nxButton disabled>Solid</button>
          <button nxButton variant="outline" disabled>Outline</button>
          <button nxButton variant="ghost" disabled>Ghost</button>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Loading</h2>
        <p class="section-note">
          Deliberately different from disabled: a busy button keeps <code>aria-busy</code> and stays
          focusable, so focus is not thrown to the document mid-interaction. Activation is
          suppressed by blocking pointer events and cancelling Enter/Space.
        </p>
        <div class="row">
          <button nxButton [loading]="loading()" (click)="run()">
            {{ loading() ? 'Saving' : 'Save' }}
          </button>
          <button nxButton variant="outline" loading>Outline</button>
          <button nxButton variant="ghost" size="lg" loading>Ghost large</button>
        </div>
        <p class="section-note">Clicks registered: {{ clicks() }}</p>
      </section>

      <section class="section">
        <h2 class="section-title">Anchors</h2>
        <p class="section-note">
          An anchor has no native disabled state, so it falls back to <code>aria-disabled</code>
          plus removal from the tab order.
        </p>
        <div class="row">
          <a nxButton href="https://angular.dev" variant="outline">Link button</a>
          <a nxButton href="https://angular.dev" variant="outline" disabled>Disabled link</a>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Focus</h2>
        <p class="section-note">
          Focus rings come from <code>:focus-visible</code> and the focus tokens — keyboard users
          see a ring, pointer users do not.
        </p>
        <div class="row">
          <button nxButton>Tab to me</button>
          <button nxButton variant="outline">Then me</button>
          <button nxButton variant="ghost">And me</button>
        </div>
      </section>
    </div>
  `,
})
export class ButtonPage {
  protected readonly loading = signal(false);
  protected readonly clicks = signal(0);

  protected run(): void {
    this.clicks.update((count) => count + 1);
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1200);
  }
}
