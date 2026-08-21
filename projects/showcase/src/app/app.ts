import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  NX_BUILT_IN_THEMES,
  NxMotionService,
  NxThemeService,
  type NxMotionIntensity,
  type NxMotionPreference,
  type NxThemeName,
} from '@noxra/ui';

interface NavItem {
  readonly path: string;
  readonly label: string;
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly themeService = inject(NxThemeService);
  private readonly motionService = inject(NxMotionService);

  protected readonly themes = NX_BUILT_IN_THEMES;
  protected readonly motionPreferences: readonly NxMotionPreference[] = [
    'system',
    'reduced',
    'full',
  ];
  protected readonly motionIntensities: readonly NxMotionIntensity[] = ['low', 'medium', 'high'];

  protected readonly theme = this.themeService.theme;
  protected readonly motion = this.motionService.preference;
  protected readonly intensity = this.motionService.intensity;
  protected readonly reducedMotion = this.motionService.reduced;

  protected readonly nav: readonly NavItem[] = [
    { path: '/', label: 'Foundation' },
    { path: '/tokens', label: 'Tokens' },
    { path: '/motion', label: 'Motion' },
    { path: '/button', label: 'Button' },
    { path: '/input', label: 'Forms' },
    { path: '/card', label: 'Card' },
    { path: '/badge', label: 'Badge' },
    { path: '/overlays', label: 'Overlays' },
  ];

  protected setTheme(value: string): void {
    this.themeService.setTheme(value as NxThemeName);
  }

  protected setMotion(value: string): void {
    this.motionService.setPreference(value as NxMotionPreference);
  }

  protected setIntensity(value: string): void {
    this.motionService.setIntensity(value as NxMotionIntensity);
  }
}
