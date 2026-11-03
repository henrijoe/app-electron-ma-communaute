import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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
import { NumeroMachine, useStatutMachine } from 'src/components/desktop/numero-machine';
import { fDate } from 'src/utils/format-time';

// Écran simple affiche quand la licence desktop bloque l'utilisateur courant.
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
  const { numeroMachine, licenceActivee } = useStatutMachine();

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
      showNotification("Collez le code d'activation reçu.", 'warning');
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
      showNotification('Application activée avec succès.', 'success');
      navigate('/', { replace: true });
    } catch (error: any) {
      showNotification(error?.message || "Code d'activation invalide.", 'error');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <Box sx={{ py: 8, px: 3 }}>
      <Stack spacing={3} alignItems="center" textAlign="center">
        <Typography variant="h3">
          {licenceActivee ? 'Votre licence est terminée' : 'Votre essai est terminé'}
        </Typography>

        <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
          {desktopMessage || "L'application desktop est actuellement bloquée pour ce compte."}
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
          <NumeroMachine numero={numeroMachine} />

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Code d'activation"
            value={unlockCode}
            onChange={(event) => setUnlockCode(event.target.value.toUpperCase())}
            placeholder="MC2-…"
            inputProps={{ spellCheck: false, style: { fontFamily: 'monospace', wordBreak: 'break-all' } }}
          />

          <Button variant="contained" onClick={handleUnlockWithCode} disabled={isUnlocking}>
            {isUnlocking ? 'Activation...' : 'Activer'}
          </Button>
        </Stack>

        <Button variant="text" onClick={handleDisconnect}>
          Se déconnecter
        </Button>
      </Stack>

      <NotificationComponent />
    </Box>
  );
}
