import { Directive, booleanAttribute, input } from '@angular/core';

import type { NxCardVariant } from './card.types';

/**
 * Card — a surface, applied to whatever element you already needed.
 *
 * Styles: `@noxra/ui/styles/components/card.css`.
 *
 * ```html
 * <article nxCard>
 *   <header nxCardHeader>Deployment</header>
 *   <div nxCardBody>Rolled out to 3 regions.</div>
 *   <footer nxCardFooter>
 *     <button nxButton size="sm">View</button>
 *   </footer>
 * </article>
 * ```
 *
 * The sections are separate directives rather than named slots on a single
 * component, so you choose the elements and the order, and you pay for nothing
 * you do not use. This is the composition pattern the rest of Noxra follows.
 */
@Directive({
  selector: '[nxCard]',
  host: {
    class: 'nx-card',
    '[attr.data-variant]': 'variant()',
    '[attr.data-interactive]': 'interactive() ? "" : null',
  },
})
export class NxCard {
  /** Surface treatment. */
  readonly variant = input<NxCardVariant>('default');

  /**
   * Adds hover and focus affordances.
   *
   * This is presentation only — it deliberately does not add `tabindex` or a
   * `role`. If the whole card should be activatable, put `nxCard` on a
   * `<button>` or `<a>` and get real semantics for free rather than having
   * Noxra reinvent them on a `<div>`.
   */
  readonly interactive = input(false, { transform: booleanAttribute });
}

/** Card header section. */
@Directive({
  selector: '[nxCardHeader]',
  host: { class: 'nx-card__header' },
})
export class NxCardHeader {}

/** Card body section. */
@Directive({
  selector: '[nxCardBody]',
  host: { class: 'nx-card__body' },
})
export class NxCardBody {}

/** Card footer section. */
@Directive({
  selector: '[nxCardFooter]',
  host: { class: 'nx-card__footer' },
})
export class NxCardFooter {}
