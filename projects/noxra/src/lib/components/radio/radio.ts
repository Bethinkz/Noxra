import { Directive, booleanAttribute, input } from '@angular/core';

import type { NxSize } from '../../core/utilities/types';

/**
 * Radio — enhances a native `<input type="radio">`.
 *
 * Styles: `@noxra/ui/styles/components/radio.css`.
 *
 * ```html
 * <label class="nx-field__inline">
 *   <input type="radio" name="plan" value="free" nxRadio />
 *   Free
 * </label>
 * ```
 *
 * There is deliberately no `NxRadioGroup`. A shared `name` attribute already
 * makes the browser handle grouping, arrow-key navigation, roving focus and
 * the single-tab-stop behaviour that a group component would otherwise have to
 * reimplement — and would reimplement worse. Wrap the set in a `<fieldset>`
 * with a `<legend>` for the group's accessible name.
 */
@Directive({
  selector: 'input[type="radio"][nxRadio]',
  host: {
    class: 'nx-radio',
    '[attr.data-size]': 'size()',
    '[attr.data-invalid]': 'invalid() ? "" : null',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
  },
})
export class NxRadio {
  /** Control size. */
  readonly size = input<NxSize>('md');

  /** Marks the control invalid explicitly. */
  readonly invalid = input(false, { transform: booleanAttribute });
}
