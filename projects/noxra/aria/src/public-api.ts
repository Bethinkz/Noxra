/*
 * Public API surface of @noxra/ui/aria.
 *
 * The components here are built on `@angular/aria`, which brings
 * `@angular/cdk` with it. Both are *optional* peer dependencies: they are
 * declared by this entry point and by nothing else, so an application that
 * never imports from `@noxra/ui/aria` never has to install them.
 *
 * That is the entire reason this entry point exists. See
 * docs/decisions/0009-adopting-angular-aria.md.
 */

export { NxTab, NxTabContent, NxTabList, NxTabPanel, NxTabs } from './tabs/tabs';
