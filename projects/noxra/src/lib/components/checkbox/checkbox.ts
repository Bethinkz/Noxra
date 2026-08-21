import { Directive, booleanAttribute, input } from '@angular/core';

import type { NxSize } from '../../core/utilities/types';

/**
 * Checkbox — enhances a native `<input type="checkbox">`.
 *
 * Styles: `@noxra/ui/styles/components/checkbox.css`.
 *
 * ```html
 * <label class="nx-field__inline">
 *   <input type="checkbox" nxCheckbox />
 *   Remember me
 * </label>
 * ```
 *
 * Only the painting is custom. The stylesheet uses `appearance: none` and
 * draws the box, but the element underneath is still a real checkbox, so the
 * keyboard behaviour, the `indeterminate` property, form submission, label
 * association and assistive-technology semantics are all the browser's.
 *
 * Like `NxInput`, this declares no `checked` or `disabled` input: those are
 * native, and shadowing them would break the very integration that makes the
 * component small.
 */
@Directive({
  selector: 'input[type="checkbox"][nxCheckbox]',
  host: {
    class: 'nx-checkbox',
    '[attr.data-size]': 'size()',
    '[attr.data-invalid]': 'invalid() ? "" : null',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
  },
})
export class NxCheckbox {
  /** Control size. */
  readonly size = input<NxSize>('md');

  /**
   * Marks the control invalid explicitly.
   *
   * Leave it alone when validity comes from Angular forms or native
   * constraint validation — the stylesheet already matches both.
   */
  readonly invalid = input(false, { transform: booleanAttribute });
}
