/**
 * Severity of an alert. Drives the accent colour and the confirm button's
 * treatment — nothing else. Noxra does not ship illustrations or icons for
 * these; an icon library is the consumer's choice, not the design system's.
 */
export type NxAlertTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

/** Content and behaviour of a single alert. */
export interface NxAlertOptions {
  /** Short, specific, and the accessible name of the dialog. */
  readonly title: string;

  /** Optional supporting detail. */
  readonly message?: string;

  /** Severity. Defaults to `'neutral'`. */
  readonly tone?: NxAlertTone;

  /** Confirm button label. Defaults to `'OK'`. */
  readonly confirmLabel?: string;

  /** Cancel button label. Only shown by `confirm()`. Defaults to `'Cancel'`. */
  readonly cancelLabel?: string;

  /**
   * Whether Escape and backdrop clicks dismiss the alert. Defaults to `true`.
   *
   * A destructive `confirm` is a reasonable place to set this `false`; an
   * informational `alert` is not.
   */
  readonly dismissible?: boolean;
}

/** How an alert ended. */
export interface NxAlertResult {
  /** The confirm button was pressed. */
  readonly confirmed: boolean;

  /**
   * The alert was dismissed rather than answered — Escape, backdrop, or a
   * server render where no one could answer it.
   *
   * Distinguishing this from a plain `confirmed: false` matters: "the user
   * said no" and "the user never saw the question" usually deserve different
   * handling.
   */
  readonly dismissed: boolean;
}
