import type { Theme, SxProps, CSSObject } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';

import { baseVars } from '../config-vars';
import { layoutClasses } from '../classes';

// ----------------------------------------------------------------------

export type LayoutSectionProps = {
  sx?: SxProps<Theme>;
  cssVars?: CSSObject;
  children?: React.ReactNode;
  footerSection?: React.ReactNode;
  headerSection?: React.ReactNode;
  sidebarSection?: React.ReactNode;
};

export function LayoutSection({
  sx,
  cssVars,
  children,
  footerSection,
  headerSection,
  sidebarSection,
}: LayoutSectionProps) {
  const theme = useTheme();

  const inputGlobalStyles = (
    <GlobalStyles
      styles={{
        html: {
          backgroundColor: 'var(--layout-content-bg)',
        },
        body: {
          ...baseVars(theme),
          ...cssVars,
          margin: 0,
          backgroundColor: 'var(--layout-content-bg)',
          color: theme.vars.palette.text.primary,
        },
        '#root': {
          minHeight: '100vh',
          backgroundColor: 'var(--layout-content-bg)',
        },
      }}
    />
  );

  return (
    <>
      {inputGlobalStyles}

      <Box
        id="root__layout"
        className={layoutClasses.root}
        sx={{
          minHeight: '100vh',
          bgcolor: 'var(--layout-content-bg)',
          color: 'text.primary',
          ...sx,
        }}
      >
        {sidebarSection}
        <Box
          display="flex"
          flex="1 1 auto"
          flexDirection="column"
          className={layoutClasses.hasSidebar}
          sx={{ bgcolor: 'var(--layout-content-bg)' }}
        >
          {headerSection}
          {children}
          {footerSection}
        </Box>
      </Box>
    </>
  );
}
