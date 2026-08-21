import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxTab, NxTabList, NxTabPanel, NxTabs } from './tabs';

@Component({
  selector: 'nx-tabs-host',
  imports: [NxTabs, NxTabList, NxTab, NxTabPanel],
  template: `
    <div nxTabs>
      <div nxTabList [(selectedTab)]="selected" [orientation]="orientation()">
        <button nxTab value="overview">Overview</button>
        <button nxTab value="activity">Activity</button>
        <button nxTab value="settings" disabled>Settings</button>
      </div>
      <div nxTabPanel value="overview">Overview panel</div>
      <div nxTabPanel value="activity">Activity panel</div>
      <div nxTabPanel value="settings">Settings panel</div>
    </div>
  `,
})
class TabsHost {
  readonly selected = signal<string | undefined>('overview');
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
}

describe('NxTabs', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [TabsHost] }).compileComponents();
    const fixture = TestBed.createComponent(TabsHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      list: root.querySelector<HTMLElement>('.nx-tab-list')!,
      tabs: [...root.querySelectorAll<HTMLElement>('.nx-tab')],
      panels: [...root.querySelectorAll<HTMLElement>('.nx-tab-panel')],
    };
  }

  afterEach(() => {
    for (const el of document.querySelectorAll('nx-tabs-host')) {
      el.remove();
    }
  });

  it('adds no DOM of its own', async () => {
    const { list, tabs } = await setup();

    // Composed with hostDirectives, so the consumer's elements are the only
    // elements - the same property every other Noxra component has.
    expect(list.tagName).toBe('DIV');
    expect(tabs[0].tagName).toBe('BUTTON');
    expect(tabs[0].children.length).toBe(0);
  });

  it('lets Angular Aria own the ARIA relationships', async () => {
    const { list, tabs, panels } = await setup();

    // Noxra sets none of this; asserting it here is asserting that the
    // composition works, not that Noxra reimplemented the pattern.
    expect(list.getAttribute('role')).toBe('tablist');
    expect(tabs[0].getAttribute('role')).toBe('tab');
    expect(panels[0].getAttribute('role')).toBe('tabpanel');

    // Wired both ways: tab -> panel and panel -> tab.
    expect(tabs[0].getAttribute('aria-controls')).toBe(panels[0].id);
    expect(panels[0].getAttribute('aria-labelledby')).toBe(tabs[0].id);
  });

  it('reflects selection for styling without duplicating aria-selected', async () => {
    const { fixture, host, tabs } = await setup();

    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].hasAttribute('data-selected')).toBe(true);
    expect(tabs[1].hasAttribute('data-selected')).toBe(false);

    host.selected.set('activity');
    await fixture.whenStable();

    expect(tabs[1].hasAttribute('data-selected')).toBe(true);
    expect(tabs[0].hasAttribute('data-selected')).toBe(false);
  });

  it('keeps the model in step when a tab is activated', async () => {
    const { fixture, host, tabs } = await setup();

    tabs[1].click();
    await fixture.whenStable();

    // `selectedTab` is Aria's model, forwarded through hostDirectives, so
    // two-way binding works without Noxra holding any state.
    expect(host.selected()).toBe('activity');
  });

  it('forwards disabled to the behaviour, not just the paint', async () => {
    const { tabs } = await setup();

    expect(tabs[2].getAttribute('aria-disabled')).toBe('true');
  });

  it('exposes orientation for styling and for keyboard behaviour', async () => {
    const { fixture, host, list } = await setup();

    expect(list.getAttribute('data-orientation')).toBe('horizontal');
    expect(list.getAttribute('aria-orientation')).toBe('horizontal');

    host.orientation.set('vertical');
    await fixture.whenStable();

    // Arrow keys follow the orientation; that is Aria's, and the data
    // attribute exists only so the stylesheet can match it.
    expect(list.getAttribute('data-orientation')).toBe('vertical');
    expect(list.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('keeps the tab list to a single tab stop', async () => {
    const { tabs } = await setup();

    // Roving tabindex: exactly one tab is reachable with Tab, the rest with
    // arrow keys. Getting this wrong is the classic tabs accessibility bug,
    // and it is precisely what taking the dependency buys.
    const reachable = tabs.filter((tab) => tab.getAttribute('tabindex') !== '-1');
    expect(reachable.length).toBe(1);
  });
});
