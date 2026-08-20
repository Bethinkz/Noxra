import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NxAlertService } from './alert';

/** Lets the dynamically created host render and settle. */
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function currentAlert(): HTMLDialogElement | null {
  return document.querySelector('dialog.nx-alert');
}

function buttonLabelled(label: string): HTMLButtonElement {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('dialog.nx-alert .nx-button')];
  const match = buttons.find((button) => button.textContent?.trim() === label);
  if (!match) {
    throw new Error(
      `No alert button labelled "${label}". Found: ${buttons.map((b) => b.textContent?.trim()).join(', ')}`,
    );
  }
  return match;
}

describe('NxAlertService', () => {
  afterEach(() => {
    for (const host of document.querySelectorAll('nx-alert-host')) {
      host.remove();
    }
  });

  it('renders a single acknowledging button for alert()', async () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxAlertService);

    const pending = service.alert({ title: 'Saved', message: 'Your changes are live.' });
    await flush();

    const dialog = currentAlert()!;
    expect(dialog).toBeTruthy();
    expect(dialog.textContent).toContain('Saved');
    expect(dialog.textContent).toContain('Your changes are live.');
    expect(dialog.querySelectorAll('.nx-button').length).toBe(1);

    buttonLabelled('OK').click();
    await expect(pending).resolves.toEqual({ confirmed: true, dismissed: false });
  });

  it('renders confirm and cancel for confirm()', async () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxAlertService);

    const pending = service.confirm({
      title: 'Delete project?',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    await flush();

    const dialog = currentAlert()!;
    expect(dialog.querySelectorAll('.nx-button').length).toBe(2);
    expect(dialog.getAttribute('data-tone')).toBe('danger');

    buttonLabelled('Delete').click();
    await expect(pending).resolves.toEqual({ confirmed: true, dismissed: false });
  });

  it('reports cancel as answered, not dismissed', async () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxAlertService);

    const pending = service.confirm({ title: 'Delete project?' });
    await flush();

    buttonLabelled('Cancel').click();

    // "The user said no" and "the user never saw the question" are different
    // facts, and callers routinely need to treat them differently.
    await expect(pending).resolves.toEqual({ confirmed: false, dismissed: false });
  });

  it('reports dismissal separately from a refusal', async () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxAlertService);

    const pending = service.confirm({ title: 'Delete project?' });
    await flush();

    currentAlert()!.close();

    await expect(pending).resolves.toEqual({ confirmed: false, dismissed: true });
  });

  it('removes the host from the document once finished', async () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NxAlertService);

    const pending = service.alert({ title: 'Saved' });
    await flush();
    expect(document.querySelectorAll('nx-alert-host').length).toBe(1);

    buttonLabelled('OK').click();
    await pending;

    // Teardown is deferred so the exit transition can finish; it must still
    // happen, or every alert leaks a detached view.
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(document.querySelectorAll('nx-alert-host').length).toBe(0);
  });

  it('resolves without rendering on the server', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const service = TestBed.inject(NxAlertService);

    // Awaiting a question nobody can answer would hang the server render.
    await expect(service.confirm({ title: 'Delete project?' })).resolves.toEqual({
      confirmed: false,
      dismissed: true,
    });
    expect(currentAlert()).toBeNull();
  });
});
