import { Directive, input } from '@angular/core';

import type { NxSize } from '../../core/utilities/types';

/**
 * Slider — enhances a native `<input type="range">`.
 *
 * Styles: `@noxra/ui/styles/components/slider.css`.
 *
 * ```html
 * <input type="range" nxSlider min="0" max="100" step="5" />
 * ```
 *
 * `min`, `max`, `step` and `value` are the element's own attributes, so the
 * browser supplies arrow-key stepping, Home/End, Page Up/Down, the correct
 * `aria-valuenow` reporting and pointer dragging — including the awkward parts
 * like dragging outside the track and touch behaviour.
 *
 * The track and thumb are painted with vendor pseudo-elements, which is the
 * only part of this component that is not portable CSS; `::-webkit-slider-*`
 * and `::-moz-range-*` cannot be combined into one rule, because a selector
 * either engine does not recognise invalidates the whole block.
 *
 * A range input has no accessible name of its own. Give it one with a
 * `<label>` or `aria-label`.
 */
@Directive({
  selector: 'input[type="range"][nxSlider]',
  host: {
    class: 'nx-slider',
    '[attr.data-size]': 'size()',
  },
})
export class NxSlider {
  /** Control size. */
  readonly size = input<NxSize>('md');
}
