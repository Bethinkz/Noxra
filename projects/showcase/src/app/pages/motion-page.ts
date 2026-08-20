import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NxButton, NxMotionService, NxSpinner } from '@noxra/ui';

@Component({
  selector: 'app-motion-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxButton, NxSpinner],
  template: `
    <div class="page">
      <header>
        <h1 class="page-title">Motion</h1>
        <p class="page-lead">
          Every Noxra animation reads its duration, easing, distance and scale from a token. That is
          what makes reduced motion a one-place concern: neutralise the tokens and the whole library
          calms down, without a single component-level media query.
        </p>
      </header>

      <section class="section">
        <h2 class="section-title">Resolved preference</h2>
        <p class="section-note">
          Motion is currently <strong>{{ reduced() ? 'reduced' : 'full' }}</strong
          >. Your system reports <strong>{{ systemReduced() ? 'reduce' : 'no-preference' }}</strong
          >, and this application's policy is <strong>{{ preference() }}</strong
          >. Change the policy in the sidebar to see the demos below respond immediately.
        </p>
      </section>

      <section class="section">
        <h2 class="section-title">Transition tokens</h2>
        <p class="section-note">
          Distance and easing. Under reduced motion the distance token collapses to zero, so the box
          changes state without travelling.
        </p>
        <div class="row">
          <button nxButton variant="outline" (click)="shifted.set(!shifted())">
            {{ shifted() ? 'Return' : 'Shift' }}
          </button>
          <div class="motion-box motion-box--shift" [attr.data-active]="shifted()"></div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Scale tokens</h2>
        <div class="row">
          <button nxButton variant="outline" (click)="scaled.set(!scaled())">
            {{ scaled() ? 'Reset' : 'Scale' }}
          </button>
          <div class="motion-box motion-box--scale" [attr.data-active]="scaled()"></div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Looping motion</h2>
        <p class="section-note">
          A spinner must keep indicating even when motion is reduced, so it gets its own token pair.
          Reduced motion slows the loop and makes it step rather than stopping it.
        </p>
        <div class="row">
          <span nxSpinner size="sm"></span>
          <span nxSpinner></span>
          <span nxSpinner size="lg"></span>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Press feedback</h2>
        <p class="section-note">
          Buttons scale on press via <code>--nx-scale-press</code>, which becomes <code>1</code>
          under reduced motion.
        </p>
        <div class="row">
          <button nxButton>Press and hold</button>
          <button nxButton variant="outline">Press and hold</button>
        </div>
      </section>
    </div>
  `,
})
export class MotionPage {
  private readonly motionService = inject(NxMotionService);

  protected readonly preference = this.motionService.preference;
  protected readonly reduced = this.motionService.reduced;
  protected readonly systemReduced = this.motionService.systemPrefersReduced;

  protected readonly shifted = signal(false);
  protected readonly scaled = signal(false);
}
