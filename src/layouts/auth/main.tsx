import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { layoutClasses } from 'src/layouts/classes';

// ----------------------------------------------------------------------

type MainProps = BoxProps & {
  layoutQuery: Breakpoint;
};

export function Main({ sx, children, layoutQuery, ...other }: MainProps) {
  const theme = useTheme();

  const renderContent = (
    <Box
      sx={{
        py: 2,
        px: { xs: 0, md: 1 },
        width: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 'var(--layout-auth-content-width)',
      }}
    >
      {children}
    </Box>
  );

  return (
    <Box
      component="main"
      className={layoutClasses.main}
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh',
        p: theme.spacing(3, 2, 4, 2),
        [theme.breakpoints.up(layoutQuery)]: {
          p: theme.spacing(6, 3, 6, 3),
        },
        ...sx,
      }}
      {...other}
    >
      {renderContent}
    </Box>
  );
}
