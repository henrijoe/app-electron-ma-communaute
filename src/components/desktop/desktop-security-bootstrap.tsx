import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { apiClient } from 'src/utils/apiClient';
import {
  resetDesktopSecurityStatus,
  setDesktopSecurityStatus,
} from 'src/store/appSlice';
import type { IReduxState } from 'src/store/store';

// Synchronise l'etat de blocage desktop entre le backend local et Redux.
export function DesktopSecurityBootstrap() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(
    (state: IReduxState) =>
      Boolean(state.application?.userLoggedIn) && Boolean(state.authentification?.connecter)
  );
  const currentUsername = useSelector(
    (state: IReduxState) => state.application?.userConnected?.nomUtilisateur || ''
  );

  useEffect(() => {
    let isMounted = true;

    if (!(window as any)?.desktopApp?.isDesktop) {
      dispatch(
        setDesktopSecurityStatus({
          checked: true,
          isBlocked: false,
          message: '',
          expiresAt: '',
          isSuperAdmin: false,
          daysRemaining: 0,
        })
      );
    } else if (!isLoggedIn || !currentUsername) {
      dispatch(resetDesktopSecurityStatus());
    } else {
      const loadDesktopSecurityStatus = async () => {
        try {
          const response = await apiClient.getDesktopSecurityStatus(currentUsername);
          const status = response?.data || {};

          if (!isMounted) {
            return;
          }

          dispatch(
            setDesktopSecurityStatus({
              checked: true,
              isBlocked: Boolean(status.isBlocked),
              message: status.blockMessage || '',
              expiresAt: status.expiresAt || '',
              isSuperAdmin: Boolean(status.isSuperAdmin),
              daysRemaining: Number(status.daysRemaining || 0),
            })
          );
        } catch (_error) {
          if (!isMounted) {
            return;
          }

          dispatch(
            setDesktopSecurityStatus({
              checked: true,
              isBlocked: false,
              message: '',
              expiresAt: '',
              isSuperAdmin: false,
              daysRemaining: 0,
            })
          );
        }
      };

      loadDesktopSecurityStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [currentUsername, dispatch, isLoggedIn]);

  return null;
}
