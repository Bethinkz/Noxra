import { Directive, HOST_TAG_NAME, booleanAttribute, computed, inject, input } from '@angular/core';

import type { NxSize } from '../../core/utilities/types';
import type { NxButtonVariant } from './button.types';

/**
 * Button — enhances a native `<button>` or `<a>`.
 *
 * Styles: `@noxra/ui/styles/components/button.css`.
 *
 * ```html
 * <button nxButton>Save</button>
 * <button nxButton variant="outline" size="sm">Cancel</button>
 * <a nxButton variant="ghost" href="/docs">Docs</a>
 * ```
 *
 * The directive emits no DOM of its own: the element you write is the element
 * that renders, including the loading indicator, which is a pseudo-element.
 *
 * ## Disabled vs. loading
 *
 * These are deliberately different states.
 *
 * `disabled` on a `<button>` sets the *native* `disabled` attribute, so the
 * browser's own semantics apply — no ARIA needed, no click to intercept.
 *
 * `loading` instead uses `aria-disabled`, which keeps the control focusable.
 * A button that vanishes from the tab order mid-interaction moves focus to the
 * document and loses the user's place, so a busy button stays reachable and
 * announces itself with `aria-busy` while its activation is suppressed.
 *
 * An `<a>` has no native disabled state, so it falls back to `aria-disabled`
 * plus removal from the tab order.
 *
 * ## How activation is actually suppressed
 *
 * Noxra prevents the event from ever being produced rather than trying to stop
 * one that already exists:
 *
 * - **Pointer** — `pointer-events: none` on `[aria-disabled='true']` in the
 *   stylesheet, so the browser dispatches nothing.
 * - **Keyboard** — cancelling `keydown` for Enter and Space stops the browser
 *   synthesising the click.
 *
 * This is deliberate. Angular dispatches multiple listeners on one element
 * itself, so `stopImmediatePropagation()` from a directive host listener does
 * *not* prevent a `(click)` handler the consumer put on the same element, even
 * though the directive's listener runs first. Anything relying on that
 * ordering would be silently unreliable.
 *
 * What the click handler still guarantees, because both are native: the
 * default action is cancelled (no form submit, no navigation) and the event
 * does not reach an ancestor handler. A programmatic `element.click()` is
 * intentionally left alone — that is application code acting on purpose, not a
 * user activating a busy control.
 */
@Directive({
  selector: 'button[nxButton], a[nxButton]',
  host: {
    class: 'nx-button',
    '[class.nx-button--enabled]': 'enabled()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-loading]': 'loading() ? "" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.disabled]': 'nativeDisabled()',
    '[attr.aria-disabled]': 'ariaDisabled()',
    '[attr.tabindex]': 'tabIndex()',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class NxButton {
  /**
   * Whether the host is a real `<button>`. Resolved through `HOST_TAG_NAME`
   * rather than by reading the DOM, so it is correct under SSR and costs
   * nothing at runtime.
   */
  private readonly isNativeButton = inject(HOST_TAG_NAME).toLowerCase() === 'button';

  /** Visual treatment. */
  readonly variant = input<NxButtonVariant>('solid');

  /** Control size. */
  readonly size = input<NxSize>('md');

  /** Blocks interaction using native semantics where the host allows it. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Shows the busy indicator and suppresses activation, keeping focus. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** True when the button will actually respond to the user. */
  protected readonly enabled = computed(() => !this.disabled() && !this.loading());

  protected readonly nativeDisabled = computed(() =>
    this.isNativeButton && this.disabled() ? '' : null,
  );

  protected readonly ariaDisabled = computed(() => {
    const ariaOnly = this.disabled() && !this.isNativeButton;
    return ariaOnly || this.loading() ? 'true' : null;
  });

  protected readonly tabIndex = computed(() =>
    !this.isNativeButton && this.disabled() ? '-1' : null,
  );

  protected onClick(event: Event): void {
    if (this.enabled()) {
      return;
    }

    // Cancels the default action - form submission for a submit button,
    // navigation for an anchor - and stops the event reaching an ancestor
    // handler such as a clickable card.
    event.preventDefault();
    event.stopPropagation();
  }

  protected onKeydown(event: Event): void {
    // Host listeners type `$event` as `Event`; narrow it here rather than
    // widening the host binding with `$any`.
    const key = (event as KeyboardEvent).key;

    if (this.enabled() || (key !== 'Enter' && key !== ' ')) {
      return;
    }

    // Cancelling keydown stops the browser synthesising the click at all.
    event.preventDefault();
  }
}
