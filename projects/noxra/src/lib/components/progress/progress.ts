import { Directive, input } from '@angular/core';

import type { NxSize } from '../../core/utilities/types';

/**
 * Progress — enhances a native `<progress>`.
 *
 * Styles: `@noxra/ui/styles/components/progress.css`.
 *
 * ```html
 * <progress nxProgress [value]="uploaded()" max="100"></progress>
 * <progress nxProgress></progress>
 * ```
 *
 * `value` and `max` are the element's own attributes, and the element already
 * carries an implicit `progressbar` role and reports its own value — so there
 * is no ARIA to wire and no state to mirror.
 *
 * Omitting `value` makes it indeterminate, which the browser handles. That is
 * why there is no `indeterminate` input: the absence of a value already says
 * it.
 *
 * A progress bar has no accessible name of its own; give it one with a
 * `<label>` or `aria-label`.
 */
@Directive({
  selector: 'progress[nxProgress]',
  host: {
    class: 'nx-progress',
    '[attr.data-size]': 'size()',
    '[attr.data-tone]': 'tone()',
  },
})
export class NxProgress {
  /** Bar thickness. */
  readonly size = input<NxSize>('md');

  /** Colour treatment. */
  readonly tone = input<'accent' | 'success' | 'warning' | 'danger'>('accent');
}
