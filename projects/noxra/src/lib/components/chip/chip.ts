import { Directive, input } from '@angular/core';

/**
 * Chip — a discrete entity: a tag, a filter, a selected value.
 *
 * Styles: `@noxra/ui/styles/components/chip.css`.
 *
 * ```html
 * <span nxChip>Angular</span>
 *
 * <span nxChip>
 *   Angular
 *   <button nxChipRemove type="button" aria-label="Remove Angular"></button>
 * </span>
 * ```
 *
 * ## Chip or badge?
 *
 * A badge is a *status* attached to something else — "live", "3 unread". A chip
 * is a *thing* in its own right, usually one the user put there and can take
 * away.
 *
 * The remove control is written by the consumer rather than generated from a
 * `removable` input, because only they can write its accessible name. A row of
 * buttons all called "Remove" is useless with a screen reader, and Noxra has no
 * way to know the chip's label is the right name to use.
 */
@Directive({
  selector: '[nxChip]',
  host: {
    class: 'nx-chip',
    '[attr.data-size]': 'size()',
  },
})
export class NxChip {
  /** Chip size. */
  readonly size = input<'sm' | 'md'>('md');
}

/**
 * The remove control inside a chip.
 *
 * Draws its own cross, so it needs no icon dependency and no child element —
 * but it does need an `aria-label`, since it has no text.
 */
@Directive({
  selector: 'button[nxChipRemove]',
  host: { class: 'nx-chip__remove' },
})
export class NxChipRemove {}
