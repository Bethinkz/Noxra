import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxDialog, NxDialogBody, NxDialogFooter, NxDialogHeader } from './dialog';
import type { NxDialogCloseReason } from './dialog.types';

@Component({
  selector: 'nx-dialog-host',
  imports: [NxDialog, NxDialogHeader, NxDialogBody, NxDialogFooter],
  template: `
    <dialog
      nxDialog
      [(open)]="open"
      [size]="size()"
      [dismissible]="dismissible()"
      (closed)="reasons.set([...reasons(), $event])"
    >
      <header nxDialogHeader>Settings</header>
      <div nxDialogBody>Body</div>
      <footer nxDialogFooter>Footer</footer>
    </dialog>
  `,
})
class DialogHost {
  readonly open = signal(false);
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly dismissible = signal(true);
  readonly reasons = signal<NxDialogCloseReason[]>([]);
}

describe('NxDialog', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [DialogHost] }).compileComponents();
    const fixture = TestBed.createComponent(DialogHost);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      dialog: root.querySelector('dialog')!,
    };
  }

  it('enhances the native dialog element', async () => {
    const { dialog } = await setup();

    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog.classList.contains('nx-dialog')).toBe(true);
    expect(dialog.querySelector('header')!.classList.contains('nx-dialog__header')).toBe(true);
    expect(dialog.querySelector('div')!.classList.contains('nx-dialog__body')).toBe(true);
    expect(dialog.querySelector('footer')!.classList.contains('nx-dialog__footer')).toBe(true);
  });

  it('opens and closes from the model', async () => {
    const { fixture, host, dialog } = await setup();

    expect(dialog.open).toBe(false);

    host.open.set(true);
    await fixture.whenStable();
    expect(dialog.open).toBe(true);

    host.open.set(false);
    await fixture.whenStable();
    expect(dialog.open).toBe(false);
  });

  it('writes back when the browser closes the dialog', async () => {
    const { fixture, host, dialog } = await setup();

    host.open.set(true);
    await fixture.whenStable();

    // The browser owns Escape, so `close` can fire without `open` changing.
    // If the model did not follow, the consumer's state would silently drift.
    dialog.close();
    // `close` is queued as a task, not dispatched synchronously.
    await new Promise((resolve) => setTimeout(resolve, 0));
    await fixture.whenStable();

    expect(host.open()).toBe(false);
    expect(host.reasons()).toEqual(['action']);
  });

  it('reports a backdrop click as a dismissal', async () => {
    const { fixture, host, dialog } = await setup();

    host.open.set(true);
    await fixture.whenStable();

    // A click whose target is the dialog itself landed on the backdrop:
    // the backdrop is a pseudo-element and has no target of its own.
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    // Closing the element queues `close`; the reason arrives with it.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(host.open()).toBe(false);
    expect(host.reasons()).toEqual(['dismiss']);
  });

  it('ignores clicks on content inside the dialog', async () => {
    const { fixture, host, dialog } = await setup();

    host.open.set(true);
    await fixture.whenStable();

    dialog
      .querySelector('.nx-dialog__body')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    expect(host.open()).toBe(true);
  });

  it('blocks dismissal when dismissible is false', async () => {
    const { fixture, host, dialog } = await setup();

    host.dismissible.set(false);
    host.open.set(true);
    await fixture.whenStable();

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    expect(host.open()).toBe(true);

    // Escape arrives as a cancelable `cancel` event; blocking it is what makes
    // a dialog non-dismissible, since the browser owns that key.
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
  });

  it('reconciles the model when Escape dismisses the dialog', async () => {
    const { fixture, host, dialog } = await setup();

    host.open.set(true);
    await fixture.whenStable();

    // Escape reaches the component as a cancelable `cancel`; the browser then
    // closes the element itself.
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await fixture.whenStable();

    expect(host.open()).toBe(false);
    expect(dialog.open).toBe(false);
  });

  it('can be reopened after being dismissed', async () => {
    const { fixture, host, dialog } = await setup();

    host.open.set(true);
    await fixture.whenStable();

    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await fixture.whenStable();

    // The failure this guards against: the model stuck at `true` while the
    // element is shut, making every later open a no-op.
    host.open.set(true);
    await fixture.whenStable();

    expect(dialog.open).toBe(true);
  });

  it('reflects size', async () => {
    const { fixture, host, dialog } = await setup();

    expect(dialog.getAttribute('data-size')).toBe('md');

    host.size.set('lg');
    await fixture.whenStable();

    expect(dialog.getAttribute('data-size')).toBe('lg');
  });
});
