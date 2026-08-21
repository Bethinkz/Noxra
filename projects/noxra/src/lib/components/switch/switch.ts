import { Directive, booleanAttribute, input } from '@angular/core';

import type { NxSize } from '../../core/utilities/types';

/**
 * Switch — a checkbox presented as an on/off toggle.
 *
 * Styles: `@noxra/ui/styles/components/switch.css`.
 *
 * ```html
 * <label class="nx-field__inline">
 *   <input type="checkbox" nxSwitch />
 *   Enable notifications
 * </label>
 * ```
 *
 * Still a native checkbox underneath, with `role="switch"` layered on top.
 * That combination is deliberate: `role="switch"` changes how the state is
 * announced — "on"/"off" rather than "checked"/"unchecked" — while the element
 * keeps checkbox keyboard behaviour and form submission.
 *
 * ## Switch or checkbox?
 *
 * A switch takes effect immediately; a checkbox is a value you submit. If the
 * setting only applies after pressing Save, it is a checkbox, whatever it
 * looks like.
 */
@Directive({
  selector: 'input[type="checkbox"][nxSwitch]',
  host: {
    class: 'nx-switch',
    role: 'switch',
    '[attr.data-size]': 'size()',
    '[attr.data-invalid]': 'invalid() ? "" : null',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
  },
})
export class NxSwitch {
  /** Control size. */
  readonly size = input<NxSize>('md');

  /** Marks the control invalid explicitly. */
  readonly invalid = input(false, { transform: booleanAttribute });
}
