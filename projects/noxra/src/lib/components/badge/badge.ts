import { Directive, input } from '@angular/core';

import type { NxBadgeSize, NxBadgeVariant } from './badge.types';

/**
 * Badge — a small status label.
 *
 * Styles: `@noxra/ui/styles/components/badge.css`.
 *
 * ```html
 * <span nxBadge>Draft</span>
 * <span nxBadge variant="accent" size="sm">Live</span>
 * ```
 *
 * A badge is content, not a control: it has no focus, hover or pressed state.
 * If a badge needs to be clickable it belongs inside a button.
 */
@Directive({
  selector: '[nxBadge]',
  host: {
    class: 'nx-badge',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
})
export class NxBadge {
  /** Visual treatment. */
  readonly variant = input<NxBadgeVariant>('neutral');

  /** Badge size. */
  readonly size = input<NxBadgeSize>('md');
}
