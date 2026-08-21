import { Directive } from '@angular/core';

/**
 * Field — the layout around a form control.
 *
 * Styles: `@noxra/ui/styles/components/field.css`.
 *
 * ```html
 * <div nxField>
 *   <label nxLabel for="email">Email</label>
 *   <input id="email" nxInput type="email" required />
 *   <p nxFieldHint>We only use this for receipts.</p>
 * </div>
 *
 * <label nxFieldInline>
 *   <input type="checkbox" nxCheckbox />
 *   Remember me
 * </label>
 * ```
 *
 * Spacing and typography only. It deliberately does **not** generate ids, wire
 * `for`/`aria-describedby`, or track validity: doing so would mean owning the
 * relationship between a label and its control, and every library that owns
 * that relationship eventually fights the application over it. A `<label for>`
 * or a wrapping `<label>` already associates them, correctly, in every browser.
 *
 * `NxFieldError` is presentational for the same reason. Show and hide it with
 * your own template logic; Noxra has no opinion about when a field is in error.
 */
@Directive({
  selector: '[nxField]',
  host: { class: 'nx-field' },
})
export class NxField {}

/** A label above its control. */
@Directive({
  selector: 'label[nxLabel]',
  host: { class: 'nx-field__label' },
})
export class NxLabel {}

/**
 * A label wrapping its control, for checkboxes, radios and switches.
 *
 * Wrapping is the association, so no `for` attribute is needed.
 */
@Directive({
  selector: 'label[nxFieldInline]',
  host: { class: 'nx-field__inline' },
})
export class NxFieldInline {}

/** Supporting text below a control. */
@Directive({
  selector: '[nxFieldHint]',
  host: { class: 'nx-field__hint' },
})
export class NxFieldHint {}

/**
 * An error message below a control.
 *
 * Purely presentational. Pair it with `aria-describedby` on the control so the
 * message is announced, and render it only when there is an error to show.
 */
@Directive({
  selector: '[nxFieldError]',
  host: { class: 'nx-field__error' },
})
export class NxFieldError {}
