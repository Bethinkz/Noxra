import { Directive } from '@angular/core';

/**
 * Toolbar — a horizontal bar of controls.
 *
 * Styles: `@noxra/ui/styles/components/toolbar.css`.
 *
 * ```html
 * <div nxToolbar>
 *   <button nxButton size="sm">New</button>
 *   <span nxToolbarSpacer></span>
 *   <button nxButton size="sm" variant="ghost">Settings</button>
 * </div>
 * ```
 *
 * Layout only, and deliberately no `role="toolbar"`. That role brings an
 * obligation with it: a toolbar is expected to be a single tab stop with
 * arrow-key navigation between its controls. Setting the role without
 * implementing that is worse than leaving it off, because it tells assistive
 * technology to expect behaviour that is not there.
 *
 * When Noxra has a roving-focus primitive — most likely from `@angular/aria` —
 * this can gain the role and the behaviour together.
 */
@Directive({
  selector: '[nxToolbar]',
  host: { class: 'nx-toolbar' },
})
export class NxToolbar {}

/** Pushes whatever follows it to the far end of the toolbar. */
@Directive({
  selector: '[nxToolbarSpacer]',
  host: { class: 'nx-toolbar__spacer' },
})
export class NxToolbarSpacer {}
