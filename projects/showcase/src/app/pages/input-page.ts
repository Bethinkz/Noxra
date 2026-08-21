import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  NxCheckbox,
  NxField,
  NxFieldHint,
  NxFieldInline,
  NxInput,
  NxLabel,
  NxRadio,
  NxSlider,
  NxSwitch,
} from '@noxra/ui';

@Component({
  selector: 'app-input-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NxInput,
    NxCheckbox,
    NxRadio,
    NxSwitch,
    NxSlider,
    NxField,
    NxLabel,
    NxFieldInline,
    NxFieldHint,
    ReactiveFormsModule,
  ],
  template: `
    <div class="page">
      <header>
        <h1 class="page-title">Forms</h1>
        <p class="page-lead">
          Every control here is a directive on a native form element. Noxra wraps none of them,
          implements no <code>ControlValueAccessor</code> and does not import
          <code>&#64;angular/forms</code> — so each element keeps its own value, validity, keyboard
          behaviour and form submission. Only the painting is custom.
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
        <h2 class="section-title">Checkbox, radio, switch</h2>
        <p class="section-note">
          Real inputs with <code>appearance: none</code>. Click the labels, use Space, and tab
          through the radios with the arrow keys — grouping and roving focus come from the shared
          <code>name</code>, not from a group component Noxra would have had to write.
        </p>
        <div class="stack">
          <label nxFieldInline>
            <input type="checkbox" nxCheckbox checked />
            Remember me
          </label>
          <label nxFieldInline>
            <input type="checkbox" nxCheckbox #tri (click)="tri.indeterminate = true" />
            Indeterminate (click to set)
          </label>
          <label nxFieldInline>
            <input type="checkbox" nxCheckbox disabled />
            Disabled
          </label>

          <fieldset style="border: 0; margin: 0; padding: 0; display: flex; gap: 16px">
            <legend class="field-label">Plan</legend>
            <label nxFieldInline>
              <input type="radio" name="plan" value="free" nxRadio checked />
              Free
            </label>
            <label nxFieldInline>
              <input type="radio" name="plan" value="pro" nxRadio />
              Pro
            </label>
          </fieldset>

          <label nxFieldInline>
            <input type="checkbox" nxSwitch checked />
            Enable notifications
          </label>
          <label nxFieldInline>
            <input type="checkbox" nxSwitch />
            Beta features
          </label>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Slider</h2>
        <p class="section-note">
          Arrow keys, Home/End and Page Up/Down all work, and
          <code>aria-valuenow</code> reports itself — none of which Noxra implements.
        </p>
        <div class="stack">
          <div nxField>
            <label nxLabel for="vol">Volume — {{ volume() }}</label>
            <input
              id="vol"
              type="range"
              nxSlider
              min="0"
              max="100"
              step="5"
              [value]="volume()"
              (input)="volume.set(+$any($event.target).value)"
            />
            <p nxFieldHint>Steps of 5.</p>
          </div>
          <input type="range" nxSlider size="sm" value="30" aria-label="Small slider" />
          <input type="range" nxSlider size="lg" value="70" aria-label="Large slider" disabled />
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
  protected readonly volume = signal(40);
}
