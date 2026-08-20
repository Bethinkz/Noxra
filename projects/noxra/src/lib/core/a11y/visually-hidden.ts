import { Directive } from '@angular/core';

/**
 * Hides an element visually while leaving it available to assistive
 * technology, and reveals it again when it receives focus.
 *
 * Noxra ships this because the platform has no native equivalent — which is
 * exactly the bar for anything living in `core/a11y`. Where native HTML or
 * Angular already solves an accessibility problem, Noxra uses that instead of
 * adding a helper.
 *
 * ```html
 * <span nxVisuallyHidden>Loading results</span>
 * ```
 */
@Directive({
  selector: '[nxVisuallyHidden]',
  host: { class: 'nx-visually-hidden' },
})
export class NxVisuallyHidden {}
