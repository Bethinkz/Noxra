import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NxInput } from '@noxra/ui';

@Component({
  selector: 'app-input-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxInput, ReactiveFormsModule],
  template: `
    <div class="page">
      <header>
        <h1 class="page-title">Input</h1>
        <p class="page-lead">
          A directive on a native form control. Noxra does not wrap it, does not implement
          <code>ControlValueAccessor</code> and does not import <code>&#64;angular/forms</code> — so
          the element keeps its own value, validity and events.
        </p>
      </header>

      <section class="section">
        <h2 class="section-title">Sizes</h2>
        <div class="stack">
          <label>
            <span class="field-label">Small</span>
            <input nxInput size="sm" placeholder="sm" />
          </label>
          <label>
            <span class="field-label">Medium</span>
            <input nxInput placeholder="md" />
          </label>
          <label>
            <span class="field-label">Large</span>
            <input nxInput size="lg" placeholder="lg" />
          </label>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">States</h2>
        <div class="stack">
          <label>
            <span class="field-label">Disabled</span>
            <input nxInput placeholder="Disabled" disabled />
          </label>
          <label>
            <span class="field-label">Explicitly invalid</span>
            <input nxInput [invalid]="true" value="not-an-email" />
          </label>
          <label>
            <span class="field-label">Textarea</span>
            <textarea nxInput placeholder="Multi-line"></textarea>
          </label>
          <label>
            <span class="field-label">Select</span>
            <select nxInput>
              <option>Void</option>
              <option>Mono</option>
              <option>Neon</option>
            </select>
          </label>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Native constraint validation</h2>
        <p class="section-note">
          Nothing Angular here. The invalid style comes from <code>:user-invalid</code>, so it
          appears only after you have actually interacted with the field.
        </p>
        <div class="stack">
          <label>
            <span class="field-label">Email (type something invalid, then blur)</span>
            <input nxInput type="email" required placeholder="you&#64;example.com" />
          </label>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Angular forms, with zero coupling</h2>
        <p class="section-note">
          This field is a reactive <code>FormControl</code>. Noxra styles it by matching the
          <code>.ng-invalid.ng-touched</code> classes Angular already emits — which is why forms
          integration costs no dependency and no adapter. Touch the field and leave it empty.
        </p>
        <div class="stack">
          <label>
            <span class="field-label">Project name (required)</span>
            <input nxInput [formControl]="name" placeholder="Required" />
          </label>
          <p class="section-note">status: {{ name.status }} · touched: {{ name.touched }}</p>
        </div>
      </section>
    </div>
  `,
})
export class InputPage {
  protected readonly name = new FormControl('', { validators: [Validators.required] });
}
