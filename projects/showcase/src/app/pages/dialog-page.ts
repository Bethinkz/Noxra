import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  NxAlertService,
  NxBadge,
  NxButton,
  NxDialog,
  NxDialogBody,
  NxDialogFooter,
  NxDialogHeader,
  NxInput,
  NxTooltip,
  type NxAlertTone,
} from '@noxra/ui';

@Component({
  selector: 'app-dialog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NxButton,
    NxInput,
    NxBadge,
    NxTooltip,
    NxDialog,
    NxDialogHeader,
    NxDialogBody,
    NxDialogFooter,
  ],
  template: `
    <div class="page">
      <header>
        <h1 class="page-title">Overlays</h1>
        <p class="page-lead">
          Dialog, Alert and Tooltip all live in the browser's top layer, and none of them needs an
          overlay dependency. Dialog and Alert are the native <code>&lt;dialog&gt;</code> element;
          Tooltip is the Popover API positioned with CSS anchor positioning. Focus trapping, focus
          restoration, Escape, <code>inert</code> and collision-aware placement are all the
          browser's — which is why Noxra cannot get them wrong.
        </p>
      </header>

      <section class="section">
        <h2 class="section-title">Declarative</h2>
        <p class="section-note">
          <code>open</code> is two-way, so Escape and backdrop clicks write straight back to your
          signal. Close this one every way you can — button, Escape, backdrop — and the state below
          stays truthful.
        </p>
        <div class="row">
          <button nxButton (click)="settingsOpen.set(true)">Open dialog</button>
          <span>
            open: <strong>{{ settingsOpen() }}</strong>
            @if (lastReason()) {
              <span nxBadge variant="outline" style="margin-inline-start: 8px">
                closed by {{ lastReason() }}
              </span>
            }
          </span>
        </div>

        <dialog nxDialog [(open)]="settingsOpen" (closed)="lastReason.set($event)">
          <header nxDialogHeader>Rename project</header>
          <div nxDialogBody>
            <label>
              <span class="field-label">Project name</span>
              <input nxInput value="noxra" />
            </label>
          </div>
          <footer nxDialogFooter>
            <button nxButton variant="ghost" size="sm" (click)="settingsOpen.set(false)">
              Cancel
            </button>
            <button nxButton size="sm" (click)="settingsOpen.set(false)">Save</button>
          </footer>
        </dialog>
      </section>

      <section class="section">
        <h2 class="section-title">Non-dismissible</h2>
        <p class="section-note">
          Escape and the backdrop are blocked. Use this only for a decision that genuinely cannot be
          deferred — a modal with no way out is a trap, which is why it is not the default.
        </p>
        <div class="row">
          <button nxButton variant="outline" (click)="blockingOpen.set(true)">
            Open non-dismissible
          </button>
        </div>

        <dialog nxDialog [(open)]="blockingOpen" [dismissible]="false" size="sm">
          <header nxDialogHeader>Answer required</header>
          <div nxDialogBody>Escape and the backdrop will not close this one.</div>
          <footer nxDialogFooter>
            <button nxButton size="sm" (click)="blockingOpen.set(false)">Understood</button>
          </footer>
        </dialog>
      </section>

      <section class="section">
        <h2 class="section-title">Tooltip</h2>
        <p class="section-note">
          Hover <em>or focus</em> — tab through these. A tooltip only reachable by pointer is
          invisible to keyboard users. Placement is a preference: the browser flips it when there is
          no room, via <code>position-try-fallbacks</code>, with no JavaScript measuring anything.
        </p>
        <div class="row">
          @for (side of placements; track side) {
            <button
              nxButton
              variant="outline"
              size="sm"
              nxTooltip="Placed {{ side }}"
              [tooltipPlacement]="side"
            >
              {{ side }}
            </button>
          }
        </div>
        <p class="section-note">
          The bubble is created on first show and reused, so a tooltip nobody hovers costs no DOM.
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">Imperative alerts</h2>
        <p class="section-note">
          One line at the call site, and the design matches because it is the same dialog reading
          the same tokens — switch theme in the sidebar with an alert open and watch it follow.
        </p>
        <pre class="code">{{ callSite }}</pre>
        <div class="row">
          <button nxButton variant="outline" size="sm" (click)="showAlert()">alert()</button>
          @for (tone of tones; track tone) {
            <button nxButton variant="ghost" size="sm" (click)="showConfirm(tone)">
              confirm · {{ tone }}
            </button>
          }
        </div>
        <p class="section-note">
          Last result: <strong>{{ lastResult() }}</strong>
        </p>
        <p class="section-note">
          Note that dismissing is reported separately from declining. "The user said no" and "the
          user never saw the question" usually deserve different handling, so
          <code>confirm()</code> tells them apart.
        </p>
      </section>
    </div>
  `,
})
export class DialogPage {
  private readonly alerts = inject(NxAlertService);

  protected readonly tones: readonly NxAlertTone[] = ['neutral', 'accent', 'danger'];
  protected readonly placements = ['top', 'bottom', 'left', 'right'] as const;

  /**
   * Held as a property rather than written inline: braces in a template are
   * interpolation, and escaping them inline makes the formatter reflow the
   * block and mangle the sample's whitespace.
   */
  protected readonly callSite =
    "const { confirmed } = await alerts.confirm({ title: 'Delete project?', tone: 'danger' });";

  protected readonly settingsOpen = signal(false);
  protected readonly blockingOpen = signal(false);
  protected readonly lastReason = signal<string | null>(null);
  protected readonly lastResult = signal('—');

  protected async showAlert(): Promise<void> {
    await this.alerts.alert({
      title: 'Deployment finished',
      message: 'Rolled out to 3 regions with no errors.',
      tone: 'success',
    });
    this.lastResult.set('acknowledged');
  }

  protected async showConfirm(tone: NxAlertTone): Promise<void> {
    const { confirmed, dismissed } = await this.alerts.confirm({
      title: tone === 'danger' ? 'Delete project?' : 'Apply changes?',
      message:
        tone === 'danger'
          ? 'This removes every deployment and cannot be undone.'
          : 'The change takes effect immediately.',
      confirmLabel: tone === 'danger' ? 'Delete' : 'Apply',
      tone,
    });

    this.lastResult.set(dismissed ? 'dismissed' : confirmed ? 'confirmed' : 'declined');
  }
}
