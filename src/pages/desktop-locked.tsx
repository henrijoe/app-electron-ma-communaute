import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { resetDesktopSecurityStatus, setUserConnected, setUserLoggedIn } from 'src/store/appSlice';
import { setConnecter, setUtilisateurData, utilisateur } from 'src/store/userSlice';
import type { IReduxState } from 'src/store/store';

// Ecran simple affiche quand la licence desktop bloque l'utilisateur courant.
export default function DesktopLockedPage() {
  const dispatch = useDispatch();
  const desktopMessage = useSelector((state: IReduxState) => state.application.desktopSecurityMessage);
  const desktopExpiresAt = useSelector((state: IReduxState) => state.application.desktopSecurityExpiresAt);

  // Permet de sortir proprement de la session pour tenter ensuite une connexion superadmin.
  const handleDisconnect = () => {
    dispatch(setConnecter(false));
    dispatch(setUserLoggedIn(false));
    dispatch(setUserConnected({}));
    dispatch(setUtilisateurData(utilisateur));
    dispatch(resetDesktopSecurityStatus());
  };

  return (
    <Box sx={{ py: 8, px: 3 }}>
      <Stack spacing={3} alignItems="center" textAlign="center">
        <Typography variant="h3">Application desktop bloquee</Typography>

        <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
          {desktopMessage || "L'application desktop est actuellement bloquee pour ce compte."}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Expiration actuelle : {desktopExpiresAt || 'non disponible'}
        </Typography>

        <Button variant="contained" onClick={handleDisconnect}>
          Se deconnecter
        </Button>
      </Stack>
    </Box>
  );
}
