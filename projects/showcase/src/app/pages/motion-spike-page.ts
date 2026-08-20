import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  input,
  signal,
} from '@angular/core';
import { NxButton, NxCard, NxCardBody } from '@noxra/ui';

/**
 * SPIKE — not library code, not a public API.
 *
 * Answers five questions before any motion API is committed to `@noxra/ui`:
 *
 *  1. Do `animate.enter` / `animate.leave` work as *host bindings* on a
 *     directive? This decides everything else. If yes, Noxra can own motion
 *     and a component author writes one attribute. If no, every consumer has
 *     to hand-write enter/leave classes on every element, and the reusable
 *     layer can only ever be CSS.
 *  2. Do the motion tokens actually drive the animation, so a theme or a
 *     preference change retunes it without touching a component?
 *  3. Under reduced motion the duration tokens collapse to 1ms. Does
 *     `animate.leave` still complete and let Angular remove the element, or
 *     does the element get stuck in the DOM?
 *  4. Does it survive SSR and hydration?
 *  5. What does the authoring shape look like when applied repeatedly?
 *
 * Delete this file once the answers are recorded.
 */

type SpikePreset = 'fade' | 'scale' | 'slide';

/**
 * Question 1: the whole reuse story rides on this compiling.
 *
 * Named `appMotionSpike`, not `nx*`: the lint rule reserves the `nx` prefix
 * for the library, and this is not library API. If it graduates, it gets the
 * prefix then.
 *
 * If host bindings support the animate syntax, one directive can pair an
 * enter and an exit preset, and a component author writes `appMotionSpike`
 * rather than remembering two class names in the right order.
 */
@Directive({
  selector: '[appMotionSpike]',
  host: {
    '[animate.enter]': 'enterClass()',
    '[animate.leave]': 'leaveClass()',
  },
})
export class AppMotionSpike {
  readonly appMotionSpike = input<SpikePreset>('fade');

  protected readonly enterClass = computed(() => `nx-enter-${this.appMotionSpike()}`);
  protected readonly leaveClass = computed(() => `nx-exit-${this.appMotionSpike()}`);
}

@Component({
  selector: 'app-motion-spike-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxButton, NxCard, NxCardBody, AppMotionSpike],
  styles: `
    /*
     * Question 2: every value below is a token. Nothing is hard-coded, so
     * reduced motion and future retuning are handled centrally, exactly like
     * the transition-based motion already in the library.
     */
    @keyframes nx-enter-fade {
      from {
        opacity: 0;
      }
    }

    @keyframes nx-exit-fade {
      to {
        opacity: 0;
      }
    }

    @keyframes nx-enter-scale {
      from {
        opacity: 0;
        scale: var(--nx-scale-enter);
      }
    }

    @keyframes nx-exit-scale {
      to {
        opacity: 0;
        scale: var(--nx-scale-enter);
      }
    }

    @keyframes nx-enter-slide {
      from {
        opacity: 0;
        translate: 0 var(--nx-distance-medium);
      }
    }

    @keyframes nx-exit-slide {
      to {
        opacity: 0;
        translate: 0 var(--nx-distance-medium);
      }
    }

    .nx-enter-fade {
      animation: nx-enter-fade var(--nx-duration-normal) var(--nx-easing-enter) both;
    }

    .nx-exit-fade {
      animation: nx-exit-fade var(--nx-duration-fast) var(--nx-easing-exit) both;
    }

    .nx-enter-scale {
      animation: nx-enter-scale var(--nx-duration-normal) var(--nx-easing-enter) both;
    }

    .nx-exit-scale {
      animation: nx-exit-scale var(--nx-duration-fast) var(--nx-easing-exit) both;
    }

    .nx-enter-slide {
      animation: nx-enter-slide var(--nx-duration-normal) var(--nx-easing-enter) both;
    }

    .nx-exit-slide {
      animation: nx-exit-slide var(--nx-duration-fast) var(--nx-easing-exit) both;
    }

    .spike-stage {
      display: flex;
      align-items: start;
      gap: var(--nx-space-3);
      min-block-size: 120px;
    }
  `,
  template: `
    <div class="page">
      <header>
        <h1 class="page-title">Motion spike</h1>
        <p class="page-lead">
          Throwaway. Establishes how enter and exit motion is authored before any of it becomes
          public API.
        </p>
      </header>

      <section class="section">
        <h2 class="section-title">Directive-owned (host bindings)</h2>
        <p class="section-note">
          If this animates, motion can live behind one attribute and every component gets it the
          same way.
        </p>
        <div class="row">
          <button nxButton variant="outline" (click)="a.set(!a())">Toggle</button>
          @for (preset of presets; track preset) {
            <button nxButton variant="ghost" size="sm" (click)="preset0.set(preset)">
              {{ preset }}
            </button>
          }
        </div>
        <div class="spike-stage">
          @if (a()) {
            <div nxCard [appMotionSpike]="preset0()" style="inline-size: 220px">
              <div nxCardBody>directive · {{ preset0() }}</div>
            </div>
          }
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Template-authored (baseline)</h2>
        <p class="section-note">
          The same thing written by hand, as a control. If the directive above fails to compile or
          animate, this is the fallback authoring shape — and it is the one consumers would have to
          repeat everywhere.
        </p>
        <div class="row">
          <button nxButton variant="outline" (click)="b.set(!b())">Toggle</button>
        </div>
        <div class="spike-stage">
          @if (b()) {
            <div
              nxCard
              animate.enter="nx-enter-scale"
              animate.leave="nx-exit-scale"
              style="inline-size: 220px"
            >
              <div nxCardBody>template · scale</div>
            </div>
          }
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Reduced motion</h2>
        <p class="section-note">
          Set motion to <strong>reduced</strong> in the sidebar and toggle again. Durations collapse
          to 1ms, so the element should leave <em>instantly</em> but still leave. If it gets stuck
          in the DOM, the exit never completed and every overlay in the library would leak nodes.
        </p>
        <div class="row">
          <button nxButton variant="outline" (click)="c.set(!c())">Toggle</button>
          <span>nodes on stage: {{ c() ? 1 : 0 }}</span>
        </div>
        <div class="spike-stage" data-spike-stage="reduced">
          @if (c()) {
            <div nxCard appMotionSpike="slide" style="inline-size: 220px">
              <div nxCardBody>reduced-motion probe</div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
})
export class MotionSpikePage {
  protected readonly presets: readonly SpikePreset[] = ['fade', 'scale', 'slide'];

  protected readonly preset0 = signal<SpikePreset>('scale');
  protected readonly a = signal(true);
  protected readonly b = signal(true);
  protected readonly c = signal(true);
}
