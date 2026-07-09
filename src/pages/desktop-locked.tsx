import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { resetDesktopSecurityStatus, setDesktopSecurityStatus, setUserConnected, setUserLoggedIn } from 'src/store/appSlice';
import { setConnecter, setUtilisateurData, utilisateur } from 'src/store/userSlice';
import type { IReduxState } from 'src/store/store';
import { apiClient } from 'src/utils/apiClient';
import { fDate } from 'src/utils/format-time';

// Ecran simple affiche quand la licence desktop bloque l'utilisateur courant.
export default function DesktopLockedPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const desktopMessage = useSelector((state: IReduxState) => state.application.desktopSecurityMessage);
  const desktopExpiresAt = useSelector((state: IReduxState) => state.application.desktopSecurityExpiresAt);
  const currentUsername = useSelector(
    (state: IReduxState) =>
      state.application.userConnected?.nomUtilisateur ||
      state.authentification.utilisateurData?.nomUtilisateur ||
      ''
  );
  const [unlockCode, setUnlockCode] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { showNotification, NotificationComponent } = useNotificationSnackbar();

  // Permet de sortir proprement de la session pour tenter ensuite une connexion superadmin.
  const handleDisconnect = () => {
    dispatch(setConnecter(false));
    dispatch(setUserLoggedIn(false));
    dispatch(setUserConnected({}));
    dispatch(setUtilisateurData(utilisateur));
    dispatch(resetDesktopSecurityStatus());
  };

  const handleUnlockWithCode = async () => {
    if (!currentUsername) {
      showNotification('Utilisateur introuvable. Reconnecte-toi puis recommence.', 'warning');
      return;
    }

    if (!unlockCode.trim()) {
      showNotification('Le code de deblocage est requis.', 'warning');
      return;
    }

    try {
      setIsUnlocking(true);
      const response = await apiClient.unlockDesktopAccessWithCode({
        nomUtilisateur: currentUsername,
        code: unlockCode.trim(),
      });
      const status = response?.data || {};

      dispatch(
        setDesktopSecurityStatus({
          checked: true,
          isBlocked: Boolean(status.isBlocked),
          message: status.blockMessage || '',
          expiresAt: status.expiresAt || '',
          isSuperAdmin: Boolean(status.isSuperAdmin),
          daysRemaining: Number(status.daysRemaining || 0),
          machineBinding: status.machineBinding,
        })
      );

      setUnlockCode('');
      showNotification('Application desktop debloquee avec succes.', 'success');
      navigate('/', { replace: true });
    } catch (error: any) {
      showNotification(error?.message || 'Code de deblocage invalide.', 'error');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <Box sx={{ py: 8, px: 3 }}>
      <Stack spacing={3} alignItems="center" textAlign="center">
        <Typography variant="h3">Application desktop bloquee</Typography>

        <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
          {desktopMessage || "L'application desktop est actuellement bloquee pour ce compte."}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Expiration actuelle : {fDate(desktopExpiresAt) || 'non disponible'}
        </Typography>

        <Stack
          spacing={2}
          sx={{
            width: '100%',
            maxWidth: 460,
            p: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Alert severity="info">
            Renseigne ici le code de deblocage fourni par le developpeur.
          </Alert>

          <TextField
            fullWidth
            label="Code de deblocage"
            value={unlockCode}
            onChange={(event) => setUnlockCode(event.target.value.toUpperCase())}
            placeholder="MC-XXXX-XXXX-XXXX-XXXX"
          />

          <Button variant="contained" onClick={handleUnlockWithCode} disabled={isUnlocking}>
            {isUnlocking ? 'Deblocage...' : "Debloquer l'application"}
          </Button>
        </Stack>

        <Button variant="text" onClick={handleDisconnect}>
          Se deconnecter
        </Button>
      </Stack>

      <NotificationComponent />
    </Box>
  );
}
