import type { NxSize } from '../../core/utilities/types';

/**
 * Dialog width. Narrows the shared `NxSize` union rather than inventing a
 * synonym; `lg` is as wide as a dialog should get before it wants to be a page.
 */
export type NxDialogSize = NxSize;

/** How a dialog was closed. */
export type NxDialogCloseReason =
  /** A control inside the dialog closed it. */
  | 'action'
  /** Escape, or a click on the backdrop. */
  | 'dismiss';
