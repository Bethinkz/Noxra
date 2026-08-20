import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

import { NxButton } from '../button/button';
import { NxDialog, NxDialogBody, NxDialogFooter, NxDialogHeader } from '../dialog/dialog';
import type { NxAlertOptions, NxAlertResult } from './alert.types';

/**
 * Internal host rendered by `NxAlertService`. Not public API.
 *
 * This is the first Noxra component that is a *component* rather than a
 * directive, and it is the case ADR 0007 carved out for: the consumer never
 * writes this markup, because the whole point of the service is that they
 * write one line of TypeScript instead.
 */
@Component({
  selector: 'nx-alert-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxDialog, NxDialogHeader, NxDialogBody, NxDialogFooter, NxButton],
  template: `
    <dialog
      nxDialog
      size="sm"
      [(open)]="open"
      [dismissible]="options().dismissible ?? true"
      [attr.data-tone]="options().tone ?? 'neutral'"
      class="nx-alert"
      (closed)="onClosed()"
    >
      <header nxDialogHeader>{{ options().title }}</header>

      @if (options().message) {
        <div nxDialogBody>{{ options().message }}</div>
      }

      <footer nxDialogFooter>
        @if (withCancel()) {
          <button nxButton variant="ghost" size="sm" (click)="resolve(false)">
            {{ options().cancelLabel ?? 'Cancel' }}
          </button>
        }
        <button
          nxButton
          size="sm"
          [attr.data-tone]="options().tone ?? 'neutral'"
          (click)="resolve(true)"
        >
          {{ options().confirmLabel ?? 'OK' }}
        </button>
      </footer>
    </dialog>
  `,
})
export class NxAlertHost {
  readonly options = signal<NxAlertOptions>({ title: '' });
  readonly withCancel = signal(false);
  readonly open = signal(false);

  /** Emitted once, when the alert has finished. */
  readonly finished = output<NxAlertResult>();

  /** Set when a button answered, so dismissal can be told apart from a "no". */
  private answered: boolean | undefined;

  protected resolve(confirmed: boolean): void {
    this.answered = confirmed;
    this.open.set(false);
  }

  protected onClosed(): void {
    const confirmed = this.answered ?? false;
    const dismissed = this.answered === undefined;
    this.answered = undefined;
    this.finished.emit({ confirmed, dismissed });
  }
}
