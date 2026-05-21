import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import ListItem from '@mui/material/ListItem';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import type { IReduxState } from 'src/store/store';
import { canAccessModule, getSessionUser } from 'src/utils/access-control';
import { APP_VERSION_LABEL } from 'src/utils/app-version';

import { varAlpha } from 'src/theme/styles';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';

export type NavContentProps = {
  data: {
    path: string;
    title: string;
    icon: React.ReactNode;
    info?: React.ReactNode;
    permissionKey?: string;
  }[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  collapsed = false,
  onToggleCollapse,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint; collapsed?: boolean; onToggleCollapse?: () => void }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: collapsed ? 1 : 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        bgcolor: 'var(--layout-nav-bg)',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent
        data={data}
        slots={slots}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
      />
    </Box>
  );
}

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (open && previousPathname.current !== pathname) {
      onClose();
    }
    previousPathname.current = pathname;
  }, [onClose, open, pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          bgcolor: 'var(--layout-nav-bg)',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} />
    </Drawer>
  );
}

type NavContentInternalProps = NavContentProps & {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function NavContent({
  data,
  slots,
  sx,
  collapsed = false,
  onToggleCollapse,
}: NavContentInternalProps) {
  const pathname = usePathname();
  const sessionUser = useSelector((state: IReduxState) => getSessionUser(state));

  return (
    <>
      <Box
        onClick={onToggleCollapse}
        sx={{
          mb: 1,
          cursor: onToggleCollapse ? 'pointer' : 'default',
          display: 'inline-flex',
          alignSelf: collapsed ? 'center' : 'flex-start',
        }}
      >
        <Logo disableLink />
      </Box>

      {slots?.topArea}

      <Scrollbar fillContent>
        <Box component="nav" display="flex" flex="1 1 auto" flexDirection="column" sx={sx}>
          <Box component="ul" gap={0.5} display="flex" flexDirection="column">
            {data.map((item) => {
              const isActived = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
              const isAllowed = item.permissionKey ? canAccessModule(sessionUser, item.permissionKey as any) : true;

              return (
                <ListItem disableGutters disablePadding key={item.title}>
                  <Tooltip
                    title={isAllowed ? item.title : `${item.title} indisponible pour ce compte`}
                    placement="right"
                    disableHoverListener={!collapsed && isAllowed}
                  >
                    <ListItemButton
                      disableGutters
                      component={isAllowed ? RouterLink : 'button'}
                      href={isAllowed ? item.path : undefined}
                      disabled={!isAllowed}
                      sx={{
                        pl: collapsed ? 1 : 2,
                        py: 1,
                        gap: 2,
                        pr: collapsed ? 1 : 1.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                        fontWeight: 'fontWeightMedium',
                        color: 'var(--layout-nav-item-color)',
                        minHeight: 'var(--layout-nav-item-height)',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        '&:hover': {
                          bgcolor: 'var(--layout-nav-item-hover-bg)',
                        },
                        ...(isActived && isAllowed && {
                          fontWeight: 'fontWeightSemiBold',
                          bgcolor: 'var(--layout-nav-item-active-bg)',
                          color: 'var(--layout-nav-item-active-color)',
                          '&:hover': {
                            bgcolor: 'var(--layout-nav-item-hover-bg)',
                          },
                        }),
                        ...(!isAllowed && {
                          opacity: 0.45,
                          color: 'text.disabled',
                          bgcolor: (theme) => alpha(theme.palette.text.disabled, 0.05),
                          cursor: 'not-allowed',
                        }),
                      }}
                    >
                      <Box component="span" sx={{ width: 24, height: 24, color: 'inherit' }}>
                        {item.icon}
                      </Box>

                      {!collapsed && (
                        <Box component="span" flexGrow={1}>
                          {item.title}
                        </Box>
                      )}

                      {!collapsed && item.info && item.info}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            })}
          </Box>

          {!collapsed && (
            <Box
              sx={{
                mt: 1,
                px: 2,
                py: 0.75,
                typography: 'caption',
                color: 'text.disabled',
              }}
            >
              {APP_VERSION_LABEL}
            </Box>
          )}
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
    </>
  );
}
