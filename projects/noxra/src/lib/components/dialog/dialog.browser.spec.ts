import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxButton } from '../button/button';
import { NxDialog, NxDialogBody, NxDialogFooter, NxDialogHeader } from './dialog';
import type { NxDialogCloseReason } from './dialog.types';

/**
 * Browser-only. Everything here depends on the real `<dialog>` element, which
 * is the whole reason Noxra builds on it: the top layer, focus trapping, focus
 * restoration and the `close` event are the browser's, not Noxra's. jsdom
 * implements none of them, so these guarantees are invisible to the jsdom
 * suite and would rot without this file.
 */

@Component({
  selector: 'nx-dialog-browser-host',
  imports: [NxDialog, NxDialogHeader, NxDialogBody, NxDialogFooter, NxButton],
  template: `
    <button nxButton id="trigger" (click)="open.set(true)">Open</button>
    <dialog nxDialog [(open)]="open" (closed)="reasons.set([...reasons(), $event])">
      <header nxDialogHeader>Rename</header>
      <div nxDialogBody><input id="field" /></div>
      <footer nxDialogFooter>
        <button nxButton id="done" (click)="open.set(false)">Done</button>
      </footer>
    </dialog>
  `,
})
class DialogBrowserHost {
  readonly open = signal(false);
  readonly reasons = signal<NxDialogCloseReason[]>([]);
}

/** Waits past the longest motion token so exit transitions have finished. */
function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 450));
}

/**
 * Waits for a condition, polling.
 *
 * `close` is queued as an element task and the exit transition can push it
 * further out, so a fixed delay is either flaky or needlessly slow. This still
 * fails if the condition never becomes true - it just does not guess at how
 * long the browser will take.
 */
async function waitFor(condition: () => boolean, label: string): Promise<void> {
  const deadline = Date.now() + 1000;
  while (Date.now() < deadline) {
    if (condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`Timed out waiting for: ${label}`);
}

describe('NxDialog (browser)', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [DialogBrowserHost] }).compileComponents();
    const fixture = TestBed.createComponent(DialogBrowserHost);

    // Attached to the document, otherwise `showModal` throws and focus has
    // nowhere to move.
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      dialog: root.querySelector('dialog')!,
      trigger: root.querySelector<HTMLButtonElement>('#trigger')!,
    };
  }

  afterEach(() => {
    for (const el of document.querySelectorAll('nx-dialog-browser-host')) {
      el.remove();
    }
  });

  it('enters the top layer and traps focus', async () => {
    const { fixture, host, dialog } = await setup();

    host.open.set(true);
    await fixture.whenStable();

    // `:modal` only matches an element opened with showModal(), so this is the
    // proof it is genuinely modal rather than merely visible.
    expect(dialog.matches(':modal')).toBe(true);
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('restores focus to the trigger on close', async () => {
    const { fixture, host, dialog, trigger } = await setup();

    trigger.focus();
    host.open.set(true);
    await fixture.whenStable();
    expect(dialog.contains(document.activeElement)).toBe(true);

    host.open.set(false);
    await fixture.whenStable();
    await settle();

    // Focus restoration is the browser's job. Losing it is the single most
    // common accessibility failure in hand-rolled modals.
    expect(document.activeElement).toBe(trigger);
  });

  it('writes back when the browser closes the dialog', async () => {
    const { fixture, host, dialog } = await setup();

    host.open.set(true);
    await fixture.whenStable();

    // The real `close` event, which jsdom cannot fire. If the model did not
    // follow it, `open` would sit at true while the element was shut and the
    // dialog could never be reopened.
    dialog.close();
    await waitFor(() => !host.open(), 'the model to follow the native close');
    await fixture.whenStable();

    expect(host.open()).toBe(false);
    expect(host.reasons()).toEqual(['action']);
  });

  it('can be reopened immediately after closing', async () => {
    const { fixture, host, dialog } = await setup();

    host.open.set(true);
    await fixture.whenStable();
    dialog.close();
    await waitFor(() => !host.open(), 'the model to follow the native close');
    await fixture.whenStable();

    // No wait: reopening while the exit transition is still in flight. This
    // used to fail silently, because the queued `close` from the first close
    // arrived after the reopen and shut the dialog again.
    host.open.set(true);
    await fixture.whenStable();

    expect(dialog.open).toBe(true);
    expect(dialog.matches(':modal')).toBe(true);

    // Still open once the stale close would have been delivered.
    await settle();
    expect(dialog.open).toBe(true);
  });

  it('paints a backdrop from the scrim token', async () => {
    const { fixture, host, dialog } = await setup();

    host.open.set(true);
    await fixture.whenStable();

    // `::backdrop` only exists for a modal dialog, so this doubles as proof
    // the top layer is active.
    const backdrop = getComputedStyle(dialog, '::backdrop').backgroundColor;
    expect(backdrop).not.toBe('rgba(0, 0, 0, 0)');
  });
});
