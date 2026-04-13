import type { IconButtonProps } from '@mui/material/IconButton';

import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import { _myAccount } from 'src/_mock';
import { usePathname, useRouter } from 'src/routes/hooks';
import { setUserConnected, setUserLoggedIn } from 'src/store/appSlice';
import type { IReduxState } from 'src/store/store';
import { setConnecter, setUtilisateurData } from 'src/store/userSlice';
import { resolveStaticAssetUrl } from 'src/utils/asset-url';

export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const userConnected = useSelector((state: IReduxState) => state.application.userConnected);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  // On privilegie les vraies informations Redux puis on garde le mock comme filet de secours.
  const accountName =
    [utilisateurData?.prenomUtilisateur, utilisateurData?.nomUtilisateur]
      .filter(Boolean)
      .join(' ')
      .trim()
    || utilisateurData?.nomUtilisateur
    || userConnected?.nomUtilisateur
    || _myAccount.displayName;
  const accountEmail = utilisateurData?.email || userConnected?.email || _myAccount.email;
  const rawPhotoUrl = utilisateurData?.logoUtilisateur || userConnected?.logoUtilisateur || _myAccount.photoURL;
  const accountPhotoUrl = useMemo(
    () => (rawPhotoUrl && !avatarLoadFailed ? resolveStaticAssetUrl(rawPhotoUrl) : undefined),
    [avatarLoadFailed, rawPhotoUrl]
  );

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleClickItem = useCallback(
    (path: string) => {
      handleClosePopover();
      router.push(path);
    },
    [handleClosePopover, router]
  );

  const handleLogout = useCallback(() => {
    handleClosePopover();
    dispatch(setConnecter(false));
    dispatch(setUtilisateurData({}));
    dispatch(setUserConnected({}));
    dispatch(setUserLoggedIn(false));
    router.push('/sign-in');
  }, [dispatch, handleClosePopover, router]);

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          p: '2px',
          width: 40,
          height: 40,
          background: (theme) =>
            `conic-gradient(${theme.vars.palette.primary.light}, ${theme.vars.palette.warning.light}, ${theme.vars.palette.primary.light})`,
          ...sx,
        }}
        {...other}
      >
        <Avatar
          src={accountPhotoUrl}
          alt={accountName}
          imgProps={{ onError: () => setAvatarLoadFailed(true) }}
          sx={{ width: 1, height: 1 }}
        >
          {accountName?.charAt(0)?.toUpperCase()}
        </Avatar>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 220 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {accountName}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {accountEmail}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList
          disablePadding
          sx={{
            p: 1,
            gap: 0.5,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
              [`&.${menuItemClasses.selected}`]: {
                color: 'text.primary',
                bgcolor: 'action.selected',
                fontWeight: 'fontWeightSemiBold',
              },
            },
          }}
        >
          {data.map((option) => (
            <MenuItem
              key={option.label}
              selected={option.href === pathname}
              onClick={() => handleClickItem(option.href)}
            >
              {option.icon}
              {option.label}
            </MenuItem>
          ))}
        </MenuList>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth color="error" size="medium" variant="text" onClick={handleLogout}>
            Se deconnecter
          </Button>
        </Box>
      </Popover>
    </>
  );
}