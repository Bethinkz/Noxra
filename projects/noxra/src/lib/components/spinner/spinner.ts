import { Directive, input } from '@angular/core';

import type { NxSize } from '../../core/utilities/types';

/**
 * Spinner — an indeterminate busy indicator.
 *
 * Styles: `@noxra/ui/styles/components/spinner.css`.
 *
 * ```html
 * <span nxSpinner></span>
 * <span nxSpinner size="lg" label="Loading results"></span>
 * ```
 *
 * Included in the foundation because it is the one component that proves the
 * *looping* half of the motion system: a spinner must keep indicating under
 * reduced motion, so it slows and steps instead of stopping. That behaviour
 * comes entirely from `--nx-duration-loop` / `--nx-easing-loop`; the spinner
 * itself contains no motion logic.
 */
@Directive({
  selector: '[nxSpinner]',
  host: {
    class: 'nx-spinner',
    role: 'status',
    '[attr.data-size]': 'size()',
    '[attr.aria-label]': 'label() || null',
  },
})
export class NxSpinner {
  /** Spinner size. */
  readonly size = input<NxSize>('md');

  /**
   * Accessible name. Set to an empty string when a visible label nearby
   * already names the busy region.
   */
  readonly label = input('Loading');
}
