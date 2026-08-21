import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxButton, NxCard, NxCardBody, NxMessage } from '@noxra/ui';
import { NxTab, NxTabList, NxTabPanel, NxTabs } from '@noxra/ui/aria';

@Component({
  selector: 'app-tabs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxTabs, NxTabList, NxTab, NxTabPanel, NxButton, NxCard, NxCardBody, NxMessage],
  template: `
    <div class="page">
      <header>
        <h1 class="page-title">Tabs</h1>
        <p class="page-lead">
          The first component that takes a dependency. Everything else in Noxra reached for the
          platform and found it — but there is no native tab widget, and the pattern is genuinely
          hard: roving tabindex, arrow keys that respect orientation and text direction,
          wrap-around, Home/End, and tab/panel relationships wired both ways.
        </p>
      </header>

      <section class="section">
        <h2 class="section-title">Import path</h2>
        <p nxMessage tone="accent">
          Tabs come from <code>&#64;noxra/ui/aria</code>, not <code>&#64;noxra/ui</code>. That entry
          point declares <code>&#64;angular/aria</code> and <code>&#64;angular/cdk</code> as
          optional peer dependencies, so applications that never import from it never install them.
        </p>
        <pre class="code">{{ importLine }}</pre>
      </section>

      <section class="section">
        <h2 class="section-title">Horizontal</h2>
        <p class="section-note">
          Click a tab, then use the arrow keys. Tab moves <em>out</em> of the list rather than
          between tabs — one tab stop for the whole set, which is the part most hand-rolled tab
          implementations get wrong.
        </p>

        <div nxTabs>
          <div nxTabList [(selectedTab)]="selected">
            <button nxTab value="overview">Overview</button>
            <button nxTab value="activity">Activity</button>
            <button nxTab value="settings">Settings</button>
            <button nxTab value="archived" disabled>Archived</button>
          </div>

          <div nxTabPanel value="overview">
            <article nxCard>
              <div nxCardBody>Noxra renders exactly the elements you write, even here.</div>
            </article>
          </div>
          <div nxTabPanel value="activity">
            <article nxCard><div nxCardBody>Nothing has happened yet.</div></article>
          </div>
          <div nxTabPanel value="settings">
            <article nxCard><div nxCardBody>No settings to change.</div></article>
          </div>
          <div nxTabPanel value="archived">
            <article nxCard><div nxCardBody>Unreachable — the tab is disabled.</div></article>
          </div>
        </div>

        <p class="section-note">
          Selected: <strong>{{ selected() }}</strong>
          — two-way bound to Aria's own model, so Noxra holds no state.
        </p>
        <div class="row">
          <button nxButton size="sm" variant="outline" (click)="selected.set('settings')">
            Select from code
          </button>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Vertical</h2>
        <p class="section-note">
          Orientation changes both the layout and the keys: up and down instead of left and right.
          Noxra only styles it — the behaviour follows the same input.
        </p>

        <div nxTabs style="flex-direction: row; gap: 24px">
          <div nxTabList orientation="vertical" [(selectedTab)]="vertical">
            <button nxTab value="a">General</button>
            <button nxTab value="b">Members</button>
            <button nxTab value="c">Billing</button>
          </div>
          <div style="flex: 1">
            <div nxTabPanel value="a">General settings.</div>
            <div nxTabPanel value="b">Members list.</div>
            <div nxTabPanel value="c">Billing details.</div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Who owns what</h2>
        <p class="section-note">
          Aria owns behaviour and every <code>role</code> and <code>aria-*</code> attribute. Noxra's
          stylesheet sets none of them and keys off <code>[data-selected]</code> instead of
          <code>[aria-selected]</code>, so appearance and semantics cannot disagree about state.
          Inspect a tab: the roles, <code>aria-controls</code> and <code>tabindex</code> are all
          Angular's.
        </p>
      </section>
    </div>
  `,
})
export class TabsPage {
  protected readonly importLine =
    "import { NxTabs, NxTabList, NxTab, NxTabPanel } from '@noxra/ui/aria';";

  protected readonly selected = signal<string | undefined>('overview');
  protected readonly vertical = signal<string | undefined>('a');
}
