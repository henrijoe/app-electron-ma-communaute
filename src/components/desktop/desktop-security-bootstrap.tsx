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

    // Hors desktop, on ne garde pas ce mecanisme de blocage local.
    if (!(window as any)?.desktopApp?.isDesktop) {
      dispatch(
        setDesktopSecurityStatus({
          checked: true,
          isBlocked: false,
          message: '',
          expiresAt: '',
          isSuperAdmin: false,
          })
        );
    } else if (!isLoggedIn || !currentUsername) {
      // Sans utilisateur connecte, on reinitialise simplement l'etat de controle.
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
            })
          );
        } catch (_error) {
          // En cas d'echec reseau local, on evite de bloquer l'application a tort.
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
            })
          );
        }
      };

      // On declenche la verification sans bloquer le rendu initial du composant.
      loadDesktopSecurityStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [currentUsername, dispatch, isLoggedIn]);

  return null;
}
