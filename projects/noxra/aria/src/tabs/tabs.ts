import { Tab, TabContent, TabList, TabPanel, Tabs } from '@angular/aria/tabs';
import { Directive, inject } from '@angular/core';

/**
 * Tabs — Noxra styling over `@angular/aria`'s tab behaviour.
 *
 * Styles: `@noxra/ui/styles/components/tabs.css`.
 * Import from `@noxra/ui/aria`, not `@noxra/ui`.
 *
 * ```html
 * <div nxTabs>
 *   <div nxTabList [(selectedTab)]="tab">
 *     <button nxTab value="overview">Overview</button>
 *     <button nxTab value="activity">Activity</button>
 *   </div>
 *   <div nxTabPanel value="overview">…</div>
 *   <div nxTabPanel value="activity">…</div>
 * </div>
 * ```
 *
 * ## Why this one takes a dependency
 *
 * Everything Noxra has built so far reached for the platform first, and up to
 * now the platform won every time — `<dialog>` for modals, the Popover API and
 * anchor positioning for tooltips, `<details>` for accordions.
 *
 * There is no native tab widget. What tabs need is roving tabindex, arrow-key
 * navigation that respects orientation and text direction, wrap-around,
 * Home/End, typeahead, and the `tab`/`tablist`/`tabpanel` relationships wired
 * both ways. That is a genuinely hard pattern to get right, it is specified in
 * detail by WAI-ARIA, and Angular ships an implementation maintained by the
 * people who maintain Angular. Writing a worse copy would be the opposite of
 * this library's whole approach.
 *
 * ## How it composes
 *
 * Each directive here uses `hostDirectives` to apply the Aria behaviour to the
 * consumer's own element, then adds a class. No wrapper elements, no
 * re-exported markup, and the DOM stays exactly what was written — the same
 * property every other Noxra component has.
 *
 * Aria owns behaviour and ARIA attributes; Noxra owns appearance. Neither
 * duplicates the other, and inputs are forwarded rather than re-declared, so
 * there is no second copy of the API to keep in step.
 */
@Directive({
  selector: '[nxTabs]',
  hostDirectives: [Tabs],
  host: { class: 'nx-tabs' },
})
export class NxTabs {}

/**
 * The row of tabs.
 *
 * Forwards Aria's inputs directly. `selectedTab` is a model, so
 * `[(selectedTab)]` works.
 */
@Directive({
  selector: '[nxTabList]',
  hostDirectives: [
    {
      directive: TabList,
      inputs: [
        'orientation',
        'wrap',
        'softDisabled',
        'focusMode',
        'selectionMode',
        'selectedTab',
        'disabled',
      ],
      outputs: ['selectedTabChange'],
    },
  ],
  host: {
    class: 'nx-tab-list',
    '[attr.data-orientation]': 'list.orientation()',
  },
})
export class NxTabList {
  /** Read for styling only; the behaviour is Aria's. */
  protected readonly list = inject(TabList);
}

/** One tab. Use a `<button>` so it is a real control. */
@Directive({
  selector: '[nxTab]',
  hostDirectives: [{ directive: Tab, inputs: ['value', 'disabled'] }],
  host: {
    class: 'nx-tab',
    '[attr.data-selected]': 'tab.selected() ? "" : null',
  },
})
export class NxTab {
  /** Read for styling only. Aria already sets `aria-selected`. */
  protected readonly tab = inject(Tab);
}

/** The content for one tab. */
@Directive({
  selector: '[nxTabPanel]',
  hostDirectives: [{ directive: TabPanel, inputs: ['value'] }],
  host: { class: 'nx-tab-panel' },
})
export class NxTabPanel {}

/**
 * Marks panel content for deferred rendering.
 *
 * Re-exported from Aria unchanged: it has no appearance to style, so wrapping
 * it would add a name without adding anything else.
 */
export { TabContent as NxTabContent };
