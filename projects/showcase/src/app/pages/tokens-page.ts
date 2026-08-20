import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  afterNextRender,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NX_TOKEN_GROUPS, NxThemeService, type NxTokenName } from '@noxra/ui';

/** Tokens whose value is a colour, and so worth showing a swatch for. */
const SWATCH_GROUPS = new Set(['surface', 'content', 'border', 'accent', 'state']);

@Component({
  selector: 'app-tokens-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header>
        <h1 class="page-title">Tokens</h1>
        <p class="page-lead">
          The full semantic token contract, read live from the document. Switch theme in the sidebar
          and every value below changes — components consume these names, themes assign the values.
        </p>
      </header>

      @for (group of groups; track group.name) {
        <section class="section token-group">
          <h2 class="section-title">{{ group.name }}</h2>
          <ul class="token-list">
            @for (token of group.tokens; track token) {
              <li class="token">
                @if (group.swatch) {
                  <span class="token-swatch" [style.background]="'var(' + token + ')'"></span>
                }
                <span class="token-text">
                  <span class="token-name">{{ token }}</span>
                  <span class="token-value">{{ values()[token] || '—' }}</span>
                </span>
              </li>
            }
          </ul>
        </section>
      }
    </div>
  `,
})
export class TokensPage {
  private readonly document = inject(DOCUMENT);
  private readonly themeService = inject(NxThemeService);

  /** Resolved values are only knowable in a browser; the server renders names alone. */
  private readonly isBrowser = signal(false);

  protected readonly values = signal<Partial<Record<NxTokenName, string>>>({});

  protected readonly groups = Object.entries(NX_TOKEN_GROUPS).map(([name, tokens]) => ({
    name,
    tokens: tokens as readonly NxTokenName[],
    swatch: SWATCH_GROUPS.has(name),
  }));

  constructor() {
    afterNextRender(() => this.isBrowser.set(true));

    effect(() => {
      // Re-read whenever the theme or a runtime override changes.
      this.themeService.theme();
      this.themeService.overrides();

      if (!this.isBrowser()) {
        return;
      }

      this.values.set(this.readComputedTokens());
    });
  }

  private readComputedTokens(): Partial<Record<NxTokenName, string>> {
    const view = this.document.defaultView;
    if (!view) {
      return {};
    }

    const computed = view.getComputedStyle(this.document.documentElement);
    const result: Partial<Record<NxTokenName, string>> = {};

    for (const group of this.groups) {
      for (const token of group.tokens) {
        result[token] = computed.getPropertyValue(token).trim();
      }
    }

    return result;
  }
}
