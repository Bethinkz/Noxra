import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxAvatar } from '../avatar/avatar';
import { NxChip, NxChipRemove } from '../chip/chip';
import { NxMessage } from '../message/message';
import { NxProgress } from '../progress/progress';
import { NxSkeleton } from '../skeleton/skeleton';
import { NxToolbar, NxToolbarSpacer } from '../toolbar/toolbar';
import { NxSeparator } from './separator';

/**
 * The presentational components share a shape — a directive that adds a class
 * and some data attributes — so they share a spec. What is worth asserting is
 * not the classes but the accessibility decisions, which are the only places
 * these could be wrong in a way that matters.
 */

@Component({
  selector: 'nx-presentational-host',
  imports: [
    NxSeparator,
    NxAvatar,
    NxChip,
    NxChipRemove,
    NxSkeleton,
    NxProgress,
    NxMessage,
    NxToolbar,
    NxToolbarSpacer,
  ],
  template: `
    <hr nxSeparator />
    <div id="vsep" nxSeparator orientation="vertical"></div>

    <img nxAvatar src="/a.jpg" alt="Ada Lovelace" [size]="size()" />
    <span id="initials" nxAvatar shape="square" aria-hidden="true">AL</span>

    <span nxChip>
      Angular
      <button nxChipRemove type="button" aria-label="Remove Angular"></button>
    </span>

    <div id="plain-skeleton" nxSkeleton></div>
    <div id="loud-skeleton" nxSkeleton announced></div>

    <progress nxProgress [value]="progress()" max="100" aria-label="Upload"></progress>
    <progress id="indeterminate" nxProgress aria-label="Working"></progress>

    <p nxMessage [tone]="tone()">Your trial ends soon.</p>

    <div nxToolbar>
      <button type="button">New</button>
      <span nxToolbarSpacer></span>
      <button type="button">Settings</button>
    </div>
  `,
})
class PresentationalHost {
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly progress = signal(40);
  readonly tone = signal<'neutral' | 'warning' | 'danger'>('neutral');
}

describe('presentational components', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [PresentationalHost] }).compileComponents();
    const fixture = TestBed.createComponent(PresentationalHost);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, $: (s: string) => root.querySelector(s)! };
  }

  it('leaves an <hr> to say what it already says', async () => {
    const { $ } = await setup();

    // `<hr>` has an implicit separator role, so adding one would be noise.
    expect($('hr').hasAttribute('role')).toBe(false);
    expect($('hr').getAttribute('data-orientation')).toBe('horizontal');
  });

  it('marks a vertical separator orientation for assistive technology', async () => {
    const { $ } = await setup();

    expect($('#vsep').getAttribute('aria-orientation')).toBe('vertical');
  });

  it('does not touch an avatar image alt text', async () => {
    const { $ } = await setup();

    // Deriving initials or alt text from a name is guesswork; the application
    // owns both.
    expect($('img.nx-avatar').getAttribute('alt')).toBe('Ada Lovelace');
    expect($('#initials').getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the chip remove control childless and named by the consumer', async () => {
    const { $ } = await setup();
    const remove = $('.nx-chip__remove');

    // The cross is drawn in CSS, so no icon dependency and no child nodes.
    expect(remove.children.length).toBe(0);
    expect(remove.getAttribute('aria-label')).toBe('Remove Angular');
  });

  it('hides skeletons from assistive technology unless asked not to', async () => {
    const { $ } = await setup();

    // A picture of absent content has nothing useful to announce.
    expect($('#plain-skeleton').getAttribute('aria-hidden')).toBe('true');
    expect($('#loud-skeleton').hasAttribute('aria-hidden')).toBe(false);
  });

  it('leaves progress reporting to the element', async () => {
    const { $ } = await setup();
    const bar = $('progress.nx-progress') as HTMLProgressElement;

    expect(bar.value).toBe(40);
    expect(bar.max).toBe(100);
    // No ARIA is wired: <progress> already has an implicit progressbar role.
    expect(bar.hasAttribute('role')).toBe(false);
  });

  it('treats a value-less progress as indeterminate', async () => {
    const { $ } = await setup();

    // Absence of a value already means indeterminate, so there is no input
    // for it.
    expect($('#indeterminate').matches(':indeterminate')).toBe(true);
  });

  it('reflects message tone without assuming a role', async () => {
    const { fixture, host, $ } = await setup();

    expect($('.nx-message').getAttribute('data-tone')).toBe('neutral');
    // Only the application knows whether a message should interrupt.
    expect($('.nx-message').hasAttribute('role')).toBe(false);

    host.tone.set('danger');
    await fixture.whenStable();
    expect($('.nx-message').getAttribute('data-tone')).toBe('danger');
  });

  it('does not claim a toolbar role it cannot honour', async () => {
    const { $ } = await setup();

    // role="toolbar" promises one tab stop and arrow-key navigation. Claiming
    // it without that is worse than leaving it off.
    expect($('.nx-toolbar').hasAttribute('role')).toBe(false);
  });
});
