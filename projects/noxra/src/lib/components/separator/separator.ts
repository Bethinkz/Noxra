import { Directive, input } from '@angular/core';

import type { NxOrientation } from '../../core/utilities/types';

/**
 * Separator — a rule between groups of content.
 *
 * Styles: `@noxra/ui/styles/components/separator.css`.
 *
 * ```html
 * <hr nxSeparator />
 * <div nxSeparator orientation="vertical"></div>
 * ```
 *
 * On an `<hr>` the semantics are already correct and nothing is added. On any
 * other element the directive supplies `role="separator"`, since a bare `<div>`
 * announces nothing.
 *
 * For a purely decorative rule, pass `decorative` — it drops the role so
 * assistive technology ignores it. A separator between visually grouped items
 * that are already distinguishable is decoration; one that is the only signal
 * of a boundary is not.
 */
@Directive({
  selector: '[nxSeparator]',
  host: {
    class: 'nx-separator',
    '[attr.data-orientation]': 'orientation()',
    '[attr.aria-orientation]': 'orientation() === "vertical" ? "vertical" : null',
  },
})
export class NxSeparator {
  /** Axis the separator runs along. */
  readonly orientation = input<NxOrientation>('horizontal');
}
