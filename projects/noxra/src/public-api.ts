/*
 * Public API surface of @noxra/ui.
 *
 * Everything importable from `@noxra/ui` is listed here explicitly. If a symbol
 * is not in this file it is internal and may change in any release, regardless
 * of whether a deep import happens to reach it.
 *
 * Stylesheets are published alongside this entry point and are imported
 * separately, e.g. `@noxra/ui/styles/noxra.css`.
 */

// ------------------------------------------------------------------ core
export { NOXRA_CONFIG, type NoxraConfig } from './lib/core/noxra-config';
export { provideNoxra } from './lib/core/provide-noxra';

export { NxThemeService } from './lib/core/theme/theme';
export {
  NX_BUILT_IN_THEMES,
  NX_DEFAULT_THEME,
  type NxThemeName,
} from './lib/core/theme/theme.types';

export { NxMotionService } from './lib/core/motion/motion';
export {
  type NxDistance,
  type NxDuration,
  type NxEasing,
  type NxMotionPreference,
} from './lib/core/motion/motion.types';

export {
  NX_THEME_OWNED_GROUPS,
  NX_TOKEN_GROUPS,
  NX_TOKEN_NAMES,
  type NxTokenGroupName,
  type NxTokenName,
  type NxTokenOverrides,
} from './lib/core/tokens/token-names';

export { NxVisuallyHidden } from './lib/core/a11y/visually-hidden';

export { type NxOrientation, type NxSize } from './lib/core/utilities/types';

// ------------------------------------------------------------ components
export { NxButton } from './lib/components/button/button';
export { type NxButtonVariant } from './lib/components/button/button.types';

export { NxInput } from './lib/components/input/input';

export { NxCard, NxCardBody, NxCardFooter, NxCardHeader } from './lib/components/card/card';
export { type NxCardVariant } from './lib/components/card/card.types';

export { NxBadge } from './lib/components/badge/badge';
export { type NxBadgeSize, type NxBadgeVariant } from './lib/components/badge/badge.types';

export { NxSpinner } from './lib/components/spinner/spinner';

export {
  NxDialog,
  NxDialogBody,
  NxDialogFooter,
  NxDialogHeader,
} from './lib/components/dialog/dialog';
export { type NxDialogCloseReason, type NxDialogSize } from './lib/components/dialog/dialog.types';

export { NxTooltip } from './lib/components/tooltip/tooltip';
export { type NxTooltipPlacement } from './lib/components/tooltip/tooltip.types';

export { NxAlertService } from './lib/components/alert/alert';
export {
  type NxAlertOptions,
  type NxAlertResult,
  type NxAlertTone,
} from './lib/components/alert/alert.types';
