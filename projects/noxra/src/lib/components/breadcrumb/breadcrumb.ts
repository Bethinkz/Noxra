import { Directive, HostAttributeToken, inject } from '@angular/core';

/**
 * Breadcrumb — a trail of links back up the hierarchy.
 *
 * Styles: `@noxra/ui/styles/components/breadcrumb.css`.
 *
 * ```html
 * <nav nxBreadcrumb>
 *   <ol nxBreadcrumbList>
 *     <li nxBreadcrumbItem><a href="/">Home</a></li>
 *     <li nxBreadcrumbItem><a href="/projects">Projects</a></li>
 *     <li nxBreadcrumbItem><span aria-current="page">Noxra</span></li>
 *   </ol>
 * </nav>
 * ```
 *
 * An ordered list inside a labelled `<nav>` is the WAI-ARIA pattern in full;
 * there is no behaviour to add. The separators are CSS, so they are not in the
 * accessibility tree and screen readers do not read a chevron between every
 * item.
 *
 * Mark the current page with `aria-current="page"`, and prefer a non-link for
 * it — a link to where you already are is a dead end.
 */
@Directive({
  selector: 'nav[nxBreadcrumb]',
  host: {
    class: 'nx-breadcrumb',
    '[attr.aria-label]': 'label',
  },
})
export class NxBreadcrumb {
  /**
   * A `<nav>` needs an accessible name, and every breadcrumb's is the same
   * word, so it is supplied rather than demanded. Read as a static host
   * attribute so an author-provided label always wins.
   */
  protected readonly label =
    inject(new HostAttributeToken('aria-label'), { optional: true }) ?? 'Breadcrumb';
}

/** The list of crumbs. Must be an `<ol>`: the order is meaningful. */
@Directive({
  selector: 'ol[nxBreadcrumbList]',
  host: { class: 'nx-breadcrumb__list' },
})
export class NxBreadcrumbList {}

/** One crumb. */
@Directive({
  selector: 'li[nxBreadcrumbItem]',
  host: { class: 'nx-breadcrumb__item' },
})
export class NxBreadcrumbItem {}
