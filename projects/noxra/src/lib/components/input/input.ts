import { Directive, booleanAttribute, input } from '@angular/core';

import type { NxSize } from '../../core/utilities/types';

/**
 * Input — enhances a native `<input>`, `<textarea>` or `<select>`.
 *
 * Styles: `@noxra/ui/styles/components/input.css`.
 *
 * ```html
 * <input nxInput placeholder="Email" />
 * <input nxInput size="sm" [invalid]="true" />
 * <textarea nxInput></textarea>
 * ```
 *
 * ## Why this is so small
 *
 * Noxra does not wrap the control, does not implement `ControlValueAccessor`
 * and does not import `@angular/forms`. The native element keeps its own
 * value, validity and events, so reactive forms, template-driven forms,
 * native constraint validation and plain DOM all work untouched.
 *
 * The invalid *appearance* is driven from CSS, which matches four independent
 * hooks — `[data-invalid]`, `[aria-invalid]`, `:user-invalid`, and the
 * `.ng-invalid.ng-touched` classes Angular forms already emits. That is why
 * forms integration costs zero bytes and zero coupling.
 *
 * Use the `invalid` input only when *you* own the validity decision.
 */
@Directive({
  selector: 'input[nxInput], textarea[nxInput], select[nxInput]',
  host: {
    class: 'nx-input',
    '[attr.data-size]': 'size()',
    '[attr.data-invalid]': 'invalid() ? "" : null',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
  },
})
export class NxInput {
  /** Control size. */
  readonly size = input<NxSize>('md');

  /**
   * Marks the control invalid explicitly.
   *
   * Leave this alone when validity comes from Angular forms or from native
   * constraint validation — both are already styled.
   */
  readonly invalid = input(false, { transform: booleanAttribute });
}
