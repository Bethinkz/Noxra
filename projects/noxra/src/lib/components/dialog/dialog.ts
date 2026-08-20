import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  PLATFORM_ID,
  booleanAttribute,
  effect,
  inject,
  input,
  model,
  output,
} from '@angular/core';

import type { NxDialogCloseReason, NxDialogSize } from './dialog.types';

/**
 * Dialog — enhances a native `<dialog>`.
 *
 * Styles: `@noxra/ui/styles/components/dialog.css`.
 *
 * ```html
 * <dialog nxDialog [(open)]="showSettings">
 *   <header nxDialogHeader>Settings</header>
 *   <div nxDialogBody>…</div>
 *   <footer nxDialogFooter>
 *     <button nxButton (click)="showSettings.set(false)">Done</button>
 *   </footer>
 * </dialog>
 * ```
 *
 * ## Why the native element
 *
 * `showModal()` gives focus trapping, focus restoration on close, the top
 * layer, a real backdrop, Escape-to-close, and `inert` on everything behind —
 * correctly, in every browser, for free. Reimplementing that on a `<div>` is
 * how most libraries acquire their hardest accessibility bugs, and it is why
 * Noxra needs no overlay dependency for modals.
 *
 * ## Motion
 *
 * There is no JavaScript animation here either. The stylesheet animates the
 * dialog and its `::backdrop` with `@starting-style` and
 * `transition-behavior: allow-discrete`, so both entrance and exit are pure
 * CSS driven by motion tokens. Where those features are unsupported the dialog
 * still opens and closes; it simply does so instantly.
 *
 * ## `open` is two-way
 *
 * Escape and backdrop dismissal write back through the `open` model, so the
 * consumer's signal never drifts out of sync with what is on screen.
 *
 * ## Known limitation: reopening mid-exit
 *
 * Reopening within the exit transition - roughly `--nx-duration-fast` after
 * closing - does not take effect. The exit is a discrete `display` / `overlay`
 * transition, and reopening while it is in flight lets it finish a task later
 * and shut the dialog again. `showModal()` succeeds and reports success, so
 * this fails silently rather than throwing.
 *
 * Waiting for the exit to finish before reopening works. Suppressing the
 * transition across the reopen was tried and did not hold; a correct fix
 * probably belongs in CSS rather than in this effect, and is not worth a
 * fragile workaround here. Covered by a browser test so the behaviour is
 * recorded rather than rediscovered.
 */
@Directive({
  selector: 'dialog[nxDialog]',
  host: {
    class: 'nx-dialog',
    '[attr.data-size]': 'size()',
    '(close)': 'onNativeClose()',
    '(cancel)': 'onCancel($event)',
    '(click)': 'onClick($event)',
  },
})
export class NxDialog {
  private readonly host = inject<ElementRef<HTMLDialogElement>>(ElementRef).nativeElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Whether the dialog is showing. Two-way: dismissal writes back. */
  readonly open = model(false);

  /** Dialog width. */
  readonly size = input<NxDialogSize>('md');

  /**
   * Whether Escape and backdrop clicks close the dialog.
   *
   * Set to `false` only for a dialog the user genuinely must answer. A modal
   * with no escape is a trap, so this defaults to `true`.
   */
  readonly dismissible = input(true, { transform: booleanAttribute });

  /** Emits once the dialog has closed, with how it was closed. */
  readonly closed = output<NxDialogCloseReason>();

  /** Set when a dismissal is in flight, so `closed` can report the reason. */
  private dismissing = false;

  constructor() {
    effect(() => {
      const shouldBeOpen = this.open();

      // `showModal` does not exist on the server, and there is no one to show
      // a dialog to during server rendering.
      if (!this.isBrowser) {
        return;
      }

      if (shouldBeOpen && !this.host.open) {
        this.host.showModal();
      } else if (!shouldBeOpen && this.host.open) {
        this.host.close();
      }
    });
  }

  /** Closes the dialog from application code. */
  close(): void {
    this.open.set(false);
  }

  protected onNativeClose(): void {
    const reason: NxDialogCloseReason = this.dismissing ? 'dismiss' : 'action';
    this.dismissing = false;

    // Keeps the consumer's signal true-to-screen when the browser closed the
    // dialog without going through `open`.
    this.open.set(false);
    this.closed.emit(reason);
  }

  protected onCancel(event: Event): void {
    // `cancel` fires for Escape. Blocking it is what makes a dialog
    // non-dismissible, since the browser owns that key.
    if (!this.dismissible()) {
      event.preventDefault();
      return;
    }

    this.dismissing = true;

    // Escape is reconciled here as well as in `close`, on purpose. `close` is
    // the only signal for a programmatic `close()` or a `form method="dialog"`
    // submit, so it has to stay the general reconciliation point - but if it
    // were ever missed, the model would sit at `true` while the element was
    // shut, and every later `open.set(true)` would be a no-op because the
    // signal never changed. The dialog could then never be reopened. Writing
    // back on the path users actually take makes that dead end far less
    // reachable, and the duplicate write is idempotent.
    this.open.set(false);
  }

  protected onClick(event: MouseEvent): void {
    // A click landing on the dialog element itself is a backdrop click: the
    // backdrop is a pseudo-element, so it has no separate event target, and
    // anything inside the dialog would have been the target instead.
    if (!this.dismissible() || event.target !== this.host) {
      return;
    }

    this.dismissing = true;
    this.open.set(false);
  }
}

/** Dialog header. Holds the accessible name. */
@Directive({
  selector: '[nxDialogHeader]',
  host: { class: 'nx-dialog__header' },
})
export class NxDialogHeader {}

/** Dialog body. Scrolls when the content is taller than the viewport allows. */
@Directive({
  selector: '[nxDialogBody]',
  host: { class: 'nx-dialog__body' },
})
export class NxDialogBody {}

/** Dialog footer. Holds the actions. */
@Directive({
  selector: '[nxDialogFooter]',
  host: { class: 'nx-dialog__footer' },
})
export class NxDialogFooter {}
