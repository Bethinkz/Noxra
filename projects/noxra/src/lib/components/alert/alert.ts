import { isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  DOCUMENT,
  EnvironmentInjector,
  Injectable,
  PLATFORM_ID,
  createComponent,
  inject,
} from '@angular/core';

import { NxAlertHost } from './alert-host';
import type { NxAlertOptions, NxAlertResult } from './alert.types';

/** What an alert resolves to when there is no one to answer it. */
const NOT_ANSWERED: NxAlertResult = { confirmed: false, dismissed: true };

/**
 * Imperative alerts and confirmations.
 *
 * ```ts
 * const alerts = inject(NxAlertService);
 *
 * await alerts.alert({ title: 'Saved', message: 'Your changes are live.' });
 *
 * const { confirmed } = await alerts.confirm({
 *   title: 'Delete project?',
 *   message: 'This cannot be undone.',
 *   confirmLabel: 'Delete',
 *   tone: 'danger',
 * });
 * ```
 *
 * ## Why this exists
 *
 * Everything else in Noxra is declarative, on purpose. This is not, also on
 * purpose: a confirmation is a *question asked in the middle of a function*,
 * and expressing that as template state plus a signal plus a subscription is
 * more code than the decision deserves. Libraries in this shape are popular
 * for exactly one reason — the call site is one line — and the usual price is
 * that they arrive with their own visual design that has to be fought.
 *
 * Noxra pays no such price: this renders `NxDialog` with Noxra's own tokens,
 * so it matches the application by construction and restyles with the theme.
 *
 * For anything richer than a title, a message and up to two buttons, use
 * `NxDialog` directly. This API is deliberately not extensible into a general
 * modal framework.
 *
 * ## SSR
 *
 * On the server every call resolves immediately to
 * `{ confirmed: false, dismissed: true }` and renders nothing. Awaiting an
 * alert during server rendering would otherwise hang the render until it timed
 * out, since there is no user to answer.
 */
@Injectable({ providedIn: 'root' })
export class NxAlertService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Shows a message with a single acknowledging button. */
  alert(options: NxAlertOptions): Promise<NxAlertResult> {
    return this.show(options, false);
  }

  /** Asks a yes/no question. */
  confirm(options: NxAlertOptions): Promise<NxAlertResult> {
    return this.show(options, true);
  }

  private show(options: NxAlertOptions, withCancel: boolean): Promise<NxAlertResult> {
    if (!this.isBrowser) {
      return Promise.resolve(NOT_ANSWERED);
    }

    return new Promise<NxAlertResult>((resolve) => {
      const ref = createComponent(NxAlertHost, {
        environmentInjector: this.injector,
      });

      ref.instance.options.set(options);
      ref.instance.withCancel.set(withCancel);

      let settled = false;
      const finish = (result: NxAlertResult) => {
        if (settled) {
          return;
        }
        settled = true;

        // Let the exit animation finish before the element is destroyed;
        // destroying immediately would rip it out of the top layer mid-fade.
        // The dialog is already visually gone, so the delay is not perceived.
        setTimeout(() => {
          this.appRef.detachView(ref.hostView);
          ref.destroy();
          host.remove();
        }, EXIT_GRACE_MS);

        resolve(result);
      };

      ref.instance.finished.subscribe(finish);

      const host = ref.location.nativeElement as HTMLElement;
      this.document.body.appendChild(host);
      this.appRef.attachView(ref.hostView);

      // Open after attach so the dialog is in the document when `showModal`
      // runs, and so `@starting-style` has a frame to animate from.
      ref.instance.open.set(true);
    });
  }
}

/**
 * Long enough for the exit transition at its slowest token value, short enough
 * that a rapid sequence of alerts does not pile up detached views.
 */
const EXIT_GRACE_MS = 400;
