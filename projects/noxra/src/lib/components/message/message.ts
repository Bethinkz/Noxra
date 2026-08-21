import { Directive, input } from '@angular/core';

import type { NxAlertTone } from '../alert/alert.types';

/**
 * Message — an inline notice that stays on the page.
 *
 * Styles: `@noxra/ui/styles/components/message.css`.
 *
 * ```html
 * <p nxMessage tone="warning">Your trial ends in 3 days.</p>
 * <div nxMessage tone="danger" role="alert">Could not save. Try again.</div>
 * ```
 *
 * ## Message or alert?
 *
 * `NxAlertService` interrupts: it opens a modal and waits for an answer. A
 * message does not interrupt — it sits in the layout and the user reads it when
 * they get there. Reach for the modal only when you genuinely cannot continue
 * without a decision.
 *
 * Tone is shared with `NxAlertService` on purpose, so "danger" means the same
 * thing and looks related in both.
 *
 * No `role` is set. A message rendered with the page is ordinary content; one
 * that appears in response to something the user did needs `role="alert"` or a
 * live region, and only the application knows which this is. Guessing would
 * either make every message shout or leave the important ones silent.
 */
@Directive({
  selector: '[nxMessage]',
  host: {
    class: 'nx-message',
    '[attr.data-tone]': 'tone()',
  },
})
export class NxMessage {
  /** Severity. Shares the alert vocabulary. */
  readonly tone = input<NxAlertTone>('neutral');
}
