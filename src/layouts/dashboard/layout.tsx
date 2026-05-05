import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { DarkModeRounded, LightModeRounded } from '@mui/icons-material';

// import { _notifications } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { setThemeMode } from 'src/store/appSlice';
import type { IReduxState } from 'src/store/store';

import { Main } from './main';
import { layoutClasses } from '../classes';
import { NavMobile, NavDesktop } from './nav';
import { navData } from '../config-nav-dashboard';
import { MenuButton } from '../components/menu-button';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { AccountPopover } from '../components/account-popover';
// import { NotificationsPopover } from '../components/notifications-popover';

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
};

export function DashboardLayout({ sx, children, header }: DashboardLayoutProps) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const themeMode = useSelector((state: IReduxState) => state.application.themeMode || 'light');

  const [navOpen, setNavOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);

  const layoutQuery: Breakpoint = 'lg';

  return (
    <LayoutSection
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          slotProps={{
            container: {
              maxWidth: false,
              sx: { px: { [layoutQuery]: 5 } },
            },
          }}
          sx={header?.sx}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
            leftArea: (
              <>
                <MenuButton
                  onClick={() => setNavOpen(true)}
                  sx={{
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />
                <NavMobile
                  data={navData}
                  open={navOpen}
                  onClose={() => setNavOpen(false)}
                />
              </>
            ),
            rightArea: (
              <Box gap={1} display="flex" alignItems="center">
                {/* <NotificationsPopover data={_notifications.slice(0, 4) as any} /> */}
                <IconButton
                  color="inherit"
                  onClick={() => dispatch(setThemeMode(themeMode === 'dark' ? 'light' : 'dark'))}
                >
                  {themeMode === 'dark' ? <LightModeRounded /> : <DarkModeRounded />}
                </IconButton>
                <AccountPopover
                  data={[
                    {
                      label: 'Home',
                      href: '/',
                      icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
                    },
                    {
                      label: 'Settings',
                      href: '/settings',
                      icon: <Iconify width={22} icon="solar:settings-bold-duotone" />,
                    },
                  ]}
                />
              </Box>
            ),
          }}
        />
      }
      sidebarSection={
        <NavDesktop
          data={navData}
          layoutQuery={layoutQuery}
          collapsed={navCollapsed}
          onToggleCollapse={() => setNavCollapsed((prev) => !prev)}
        />
      }
      footerSection={null}
      cssVars={{
        '--layout-nav-vertical-width': navCollapsed ? '96px' : '300px',
        '--layout-dashboard-content-pt': theme.spacing(1),
        '--layout-dashboard-content-pb': theme.spacing(8),
        '--layout-dashboard-content-px': theme.spacing(5),
      }}
      sx={{
        [`& .${layoutClasses.hasSidebar}`]: {
          [theme.breakpoints.up(layoutQuery)]: {
            pl: 'var(--layout-nav-vertical-width)',
          },
        },
        ...sx,
      }}
    >
      <Main>{children}</Main>
    </LayoutSection>
  );
}

