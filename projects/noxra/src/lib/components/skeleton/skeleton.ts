import { Directive, booleanAttribute, input } from '@angular/core';

/**
 * Skeleton — a placeholder for content that has not arrived.
 *
 * Styles: `@noxra/ui/styles/components/skeleton.css`.
 *
 * ```html
 * <div nxSkeleton style="block-size: 20px"></div>
 * <div nxSkeleton shape="circle" style="inline-size: 40px; block-size: 40px"></div>
 * ```
 *
 * Size comes from the element, not from inputs. A skeleton has to match the
 * shape of the content it stands in for, and that is layout the application
 * already knows — a `width`/`height` API would just be CSS with extra steps.
 *
 * The pulse uses the looping motion tokens, so it slows and steps under reduced
 * motion rather than stopping: a frozen skeleton is indistinguishable from a
 * broken layout.
 *
 * Marked `aria-hidden` by default. A skeleton is a picture of absent content;
 * announcing it says nothing useful. Put `aria-busy="true"` on the region that
 * is loading instead, or set `announced` if this skeleton is the only signal.
 */
@Directive({
  selector: '[nxSkeleton]',
  host: {
    class: 'nx-skeleton',
    '[attr.data-shape]': 'shape()',
    '[attr.aria-hidden]': 'announced() ? null : "true"',
  },
})
export class NxSkeleton {
  /** Outline shape. */
  readonly shape = input<'line' | 'block' | 'circle'>('line');

  /** Expose the placeholder to assistive technology instead of hiding it. */
  readonly announced = input(false, { transform: booleanAttribute });
}
