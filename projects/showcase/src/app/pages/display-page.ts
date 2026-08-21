import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  NxAccordion,
  NxAccordionItem,
  NxAccordionPanel,
  NxAccordionTrigger,
  NxAvatar,
  NxButton,
  NxBreadcrumb,
  NxBreadcrumbItem,
  NxBreadcrumbList,
  NxChip,
  NxChipRemove,
  NxMessage,
  NxProgress,
  NxCheckbox,
  NxFieldInline,
  NxSeparator,
  NxSkeleton,
  NxToolbar,
  NxToolbarSpacer,
} from '@noxra/ui';

@Component({
  selector: 'app-display-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NxButton,
    NxAccordion,
    NxAccordionItem,
    NxAccordionTrigger,
    NxAccordionPanel,
    NxBreadcrumb,
    NxBreadcrumbList,
    NxBreadcrumbItem,
    NxCheckbox,
    NxFieldInline,
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
    <div class="page">
      <header>
        <h1 class="page-title">Display</h1>
        <p class="page-lead">
          Presentational pieces. Each is a directive that adds a class and some data attributes, so
          the interesting decisions here are accessibility ones rather than visual ones — what to
          announce, what to hide, and which roles are honest to claim.
        </p>
      </header>

      <section class="section">
        <h2 class="section-title">Breadcrumb</h2>
        <nav nxBreadcrumb>
          <ol nxBreadcrumbList>
            <li nxBreadcrumbItem><a href="#">Home</a></li>
            <li nxBreadcrumbItem><a href="#">Projects</a></li>
            <li nxBreadcrumbItem><span aria-current="page">Noxra</span></li>
          </ol>
        </nav>
        <p class="section-note">
          A labelled <code>&lt;nav&gt;</code> around an <code>&lt;ol&gt;</code> is the whole
          WAI-ARIA pattern — there is no behaviour to add. The chevrons are CSS, so a screen reader
          does not read one between every crumb.
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">Accordion</h2>
        <p class="section-note">
          Native <code>&lt;details&gt;</code>. Single-open comes from the browser closing siblings
          that share a <code>name</code> — Noxra writes no state, no coordination and no
          subscriptions. Try find-in-page for a word inside a closed panel: the browser opens it,
          which no scripted accordion does.
        </p>
        <div nxAccordion [multiple]="multiOpen()">
          <details nxAccordionItem open>
            <summary nxAccordionTrigger>What makes this cheap?</summary>
            <div nxAccordionPanel>
              The element already opens, closes, announces its state and is keyboard operable.
            </div>
          </details>
          <details nxAccordionItem>
            <summary nxAccordionTrigger>Where does exclusivity come from?</summary>
            <div nxAccordionPanel>
              A shared <code>name</code> attribute, handled by the browser.
            </div>
          </details>
          <details nxAccordionItem>
            <summary nxAccordionTrigger>What does "multiple" change?</summary>
            <div nxAccordionPanel>
              It stops assigning the shared name. That is the whole feature.
            </div>
          </details>
        </div>
        <div class="row">
          <label nxFieldInline>
            <input
              type="checkbox"
              nxCheckbox
              [checked]="multiOpen()"
              (change)="multiOpen.set(!multiOpen())"
            />
            Allow multiple open
          </label>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Separator</h2>
        <div class="stack">
          <hr nxSeparator />
          <div class="row" style="align-items: stretch; block-size: 24px">
            <span>Left</span>
            <div nxSeparator orientation="vertical"></div>
            <span>Right</span>
          </div>
        </div>
        <p class="section-note">
          An <code>&lt;hr&gt;</code> already has a separator role, so nothing is added to it.
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">Avatar</h2>
        <div class="row">
          <span nxAvatar size="sm" aria-hidden="true">AL</span>
          <span nxAvatar aria-hidden="true">AL</span>
          <span nxAvatar size="lg" aria-hidden="true">AL</span>
          <span nxAvatar shape="square" aria-hidden="true">NX</span>
        </div>
        <p class="section-note">
          Noxra does not derive initials from a name — splitting names on whitespace is wrong in
          most of the world, and guessing produces confidently incorrect output.
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">Chip</h2>
        <div class="row">
          @for (tag of tags(); track tag) {
            <span nxChip>
              {{ tag }}
              <button
                nxChipRemove
                type="button"
                [attr.aria-label]="'Remove ' + tag"
                (click)="remove(tag)"
              ></button>
            </span>
          }
          @if (!tags().length) {
            <span class="section-note" style="margin: 0">All removed.</span>
          }
          <button nxButton variant="ghost" size="sm" (click)="resetTags()">Reset</button>
        </div>
        <p class="section-note">
          The remove control is written by you, because only you can give it a useful accessible
          name. A row of buttons all called "Remove" is useless with a screen reader.
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">Skeleton</h2>
        <div class="stack">
          <div class="row" style="align-items: center">
            <div nxSkeleton shape="circle" style="inline-size: 36px; block-size: 36px"></div>
            <div style="flex: 1">
              <div nxSkeleton style="block-size: 12px; margin-block-end: 8px"></div>
              <div nxSkeleton style="block-size: 12px; inline-size: 60%"></div>
            </div>
          </div>
        </div>
        <p class="section-note">
          Size comes from the element, not from inputs — a skeleton has to match the content it
          stands in for, and that is layout you already know. Hidden from assistive technology by
          default.
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">Progress</h2>
        <div class="stack">
          <progress nxProgress [value]="uploaded()" max="100" aria-label="Upload"></progress>
          <progress
            nxProgress
            size="sm"
            [value]="uploaded()"
            max="100"
            tone="success"
            aria-label="Small"
          ></progress>
          <progress
            nxProgress
            size="lg"
            [value]="uploaded()"
            max="100"
            tone="danger"
            aria-label="Large"
          ></progress>
          <progress nxProgress aria-label="Indeterminate"></progress>
        </div>
        <div class="row">
          <button nxButton size="sm" variant="outline" (click)="step(-10)">−10</button>
          <button nxButton size="sm" variant="outline" (click)="step(10)">+10</button>
          <span>{{ uploaded() }}%</span>
        </div>
        <p class="section-note">
          The last one has no <code>value</code>, which is already what "indeterminate" means — so
          there is no input for it.
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">Message</h2>
        <div class="stack">
          @for (tone of tones; track tone) {
            <p nxMessage [tone]="tone">This is a {{ tone }} message.</p>
          }
        </div>
        <p class="section-note">
          No <code>role</code> is set. A message rendered with the page is ordinary content; one
          that appears in response to an action needs <code>role="alert"</code> — and only you know
          which this is.
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">Toolbar</h2>
        <div nxToolbar>
          <button nxButton size="sm">New</button>
          <button nxButton size="sm" variant="outline">Import</button>
          <span nxToolbarSpacer></span>
          <button nxButton size="sm" variant="ghost">Settings</button>
        </div>
        <p class="section-note">
          Layout only, and deliberately no <code>role="toolbar"</code> — that role promises a single
          tab stop with arrow-key navigation, and claiming it without providing it is worse than
          leaving it off.
        </p>
      </section>
    </div>
  `,
})
export class DisplayPage {
  protected readonly tones = ['neutral', 'accent', 'success', 'warning', 'danger'] as const;

  protected readonly tags = signal<string[]>(['Angular', 'Signals', 'Zoneless', 'SSR']);
  protected readonly uploaded = signal(40);
  protected readonly multiOpen = signal(false);

  protected remove(tag: string): void {
    this.tags.update((tags) => tags.filter((t) => t !== tag));
  }

  protected resetTags(): void {
    this.tags.set(['Angular', 'Signals', 'Zoneless', 'SSR']);
  }

  protected step(by: number): void {
    this.uploaded.update((v) => Math.min(100, Math.max(0, v + by)));
  }
}
