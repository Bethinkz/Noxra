import { Directive, booleanAttribute, inject, input } from '@angular/core';

import { nxUniqueId } from '../../core/utilities/unique-id';

/**
 * Accordion — a group of native `<details>` disclosures.
 *
 * Styles: `@noxra/ui/styles/components/accordion.css`.
 *
 * ```html
 * <div nxAccordion>
 *   <details nxAccordionItem>
 *     <summary nxAccordionTrigger>Shipping</summary>
 *     <div nxAccordionPanel>Ships in 2-3 days.</div>
 *   </details>
 *   <details nxAccordionItem>
 *     <summary nxAccordionTrigger>Returns</summary>
 *     <div nxAccordionPanel>30 days, no questions.</div>
 *   </details>
 * </div>
 * ```
 *
 * ## No behaviour to write
 *
 * `<details>` already is a disclosure: it opens and closes, exposes the state
 * to assistive technology, is keyboard operable, and participates in
 * find-in-page — browsers expand a closed `<details>` when a match is inside
 * it, which no scripted accordion does.
 *
 * Exclusivity comes from the platform too. Giving several `<details>` the same
 * `name` makes the browser close the others when one opens, so a single-open
 * accordion needs no coordination code, no state, and no subscriptions. The
 * group generates that name so two accordions on one page cannot collide, and
 * so nobody has to repeat it.
 *
 * Set `multiple` to let several stay open, which simply means not assigning a
 * shared name.
 */
@Directive({
  selector: '[nxAccordion]',
  host: { class: 'nx-accordion' },
  exportAs: 'nxAccordion',
})
export class NxAccordion {
  /** Whether more than one item may be open at a time. */
  readonly multiple = input(false, { transform: booleanAttribute });

  /**
   * The shared `name` handed to items when only one may be open.
   *
   * Generated rather than required, so two accordions on the same page cannot
   * accidentally close each other's items.
   */
  readonly groupName = nxUniqueId('accordion');
}

/**
 * One disclosure in an accordion.
 *
 * Usable on its own, without a group, for a single standalone disclosure.
 */
@Directive({
  selector: 'details[nxAccordionItem]',
  host: {
    class: 'nx-accordion__item',
    '[attr.name]': 'groupName()',
  },
})
export class NxAccordionItem {
  private readonly group = inject(NxAccordion, { optional: true });

  /** Null outside a group, or when the group allows several open at once. */
  protected groupName(): string | null {
    return this.group && !this.group.multiple() ? this.group.groupName : null;
  }
}

/** The clickable heading of a disclosure. Must be a `<summary>`. */
@Directive({
  selector: 'summary[nxAccordionTrigger]',
  host: { class: 'nx-accordion__trigger' },
})
export class NxAccordionTrigger {}

/** The revealed content of a disclosure. */
@Directive({
  selector: '[nxAccordionPanel]',
  host: { class: 'nx-accordion__panel' },
})
export class NxAccordionPanel {}
