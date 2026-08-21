import { Directive, input } from '@angular/core';

import type { NxSize } from '../../core/utilities/types';

/**
 * Avatar — a person or entity marker.
 *
 * Styles: `@noxra/ui/styles/components/avatar.css`.
 *
 * ```html
 * <img nxAvatar src="/avatar.jpg" alt="Ada Lovelace" />
 * <span nxAvatar aria-hidden="true">AL</span>
 * ```
 *
 * Works on an `<img>` or on any element containing initials. Noxra does not
 * derive initials from a name: splitting names on whitespace is wrong in most
 * of the world, and a library guessing at it produces confidently incorrect
 * output. The application knows what to show.
 *
 * An initials avatar beside a visible name is decoration — mark it
 * `aria-hidden="true"` so it is not read twice. An `<img>` avatar needs a
 * real `alt`, or an empty one if the name is already adjacent.
 */
@Directive({
  selector: '[nxAvatar]',
  host: {
    class: 'nx-avatar',
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
  },
})
export class NxAvatar {
  /** Avatar size. */
  readonly size = input<NxSize>('md');

  /** Outline shape. */
  readonly shape = input<'circle' | 'square'>('circle');
}
