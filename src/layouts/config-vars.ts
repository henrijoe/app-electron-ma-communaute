import type { Theme } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------

export const baseVars = (theme: Theme) => ({
  '--layout-nav-bg': theme.vars.palette.background.paper,
  '--layout-nav-border-color': varAlpha(theme.vars.palette.grey['500Channel'], theme.palette.mode === 'dark' ? 0.18 : 0.08),
  '--layout-nav-zIndex': 1101,
  '--layout-nav-mobile-width': '320px',
  '--layout-nav-item-height': '44px',
  '--layout-nav-item-color': theme.vars.palette.text.secondary,
  '--layout-nav-item-active-color': theme.vars.palette.primary.main,
  '--layout-nav-item-active-bg': varAlpha(theme.vars.palette.primary.mainChannel, theme.palette.mode === 'dark' ? 0.22 : 0.12),
  '--layout-nav-item-hover-bg': varAlpha(theme.vars.palette.primary.mainChannel, theme.palette.mode === 'dark' ? 0.16 : 0.08),
  '--layout-content-bg': theme.vars.palette.background.default,
  '--layout-surface-bg': theme.vars.palette.background.paper,
  '--layout-header-blur': '8px',
  '--layout-header-zIndex': 1100,
  '--layout-header-mobile-height': '64px',
  '--layout-header-desktop-height': '72px',
});
