import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  LanguageRounded,
  LaunchRounded,
  SaveRounded,
  StorageRounded,
} from '@mui/icons-material';

import { DashboardContent } from 'src/layouts/dashboard';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { apiClient } from 'src/utils/apiClient';
import { setConnectionMode, setDesktopSecurityStatus, setServerUrl } from 'src/store/appSlice';
import type { IReduxState } from 'src/store/store';

type ConnectionMode = 'local' | 'online';

// Verifie qu'une valeur peut etre interpretee comme une URL HTTP ou HTTPS.
const isValidHttpUrl = (value: string): boolean => {
  // Une chaine vide ne peut pas etre utilisee comme URL navigateur.
  if (!value.trim()) {
    return false;
  }

  try {
    // Le constructeur URL permet de verifier la structure complete de l'adresse.
    const parsedUrl = new URL(value);
    // On accepte uniquement les protocoles web classiques pour cette fonction.
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (_error) {
    // Toute erreur de parsing signifie que l'adresse est invalide.
    return false;
  }
};

// Nettoie l'URL saisie pour supprimer les espaces et le slash final inutile.
const normalizeBrowserUrl = (value: string): string => value.trim().replace(/\/+$/, '');

// Construit l'URL navigateur complete a partir d'une IP locale et du port backend standard.
const buildBrowserUrlFromIp = (ipAddress: string, port = 49300): string =>
  `http://${ipAddress}:${port}`;

// Ouvre l'URL de l'application dans le navigateur adapte au contexte courant.
const openApplicationUrlInBrowser = async (url: string): Promise<void> => {
  // On normalise d'abord l'adresse pour eviter les erreurs de slash ou d'espace.
  const normalizedUrl = normalizeBrowserUrl(url);

  // En desktop, on prefere le navigateur systeme ouvert par Electron.
  if ((window as any)?.desktopShell?.openExternal) {
    const result = await (window as any).desktopShell.openExternal(normalizedUrl);

    // Si Electron signale un echec, on remonte une erreur explicite.
    if (!result?.success) {
      throw new Error(result?.error || "Impossible d'ouvrir le navigateur");
    }

    return;
  }

  // En mode web simple, on ouvre l'adresse dans un nouvel onglet du navigateur courant.
  window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
};

export function SettingsView() {
  const dispatch = useDispatch();
  const applicationState = useSelector((state: IReduxState) => state.application);
  const currentUsername = useSelector(
    (state: IReduxState) => state.application.userConnected?.nomUtilisateur || ''
  );
  const [browserUrl, setBrowserUrlInput] = useState(applicationState.serverUrl || '');
  const [connectionMode, setConnectionModeInput] = useState<ConnectionMode>(
    applicationState.connectionMode || 'local'
  );
  const [isDetectingAddress, setIsDetectingAddress] = useState(false);
  const [extendDays, setExtendDays] = useState('30');
  const { showNotification, NotificationComponent } = useNotificationSnackbar();
  const isDesktopApp = Boolean((window as any)?.desktopApp?.isDesktop);

  // Permet d'afficher a l'ecran si l'URL saisie est exploitable.
  const isUrlReady = useMemo(() => isValidHttpUrl(browserUrl), [browserUrl]);
  const desktopLicenseExpiresAt = applicationState.desktopSecurityExpiresAt;
  const desktopSecurityMessage = applicationState.desktopSecurityMessage;
  const isDesktopSuperAdmin = applicationState.desktopSecurityIsSuperAdmin;
  const isDesktopBlocked = applicationState.desktopSecurityBlocked;

  // Recharge l'etat de licence desktop pour l'utilisateur courant.
  const refreshDesktopSecurityStatus = useCallback(async () => {
    if (!isDesktopApp || !currentUsername) {
      // Cette verification n'a de sens qu'en desktop et avec un utilisateur deja connu.
      return;
    }

    try {
      // On demande au backend local l'etat exact de la licence pour cet utilisateur.
      const response = await apiClient.getDesktopSecurityStatus(currentUsername);
      const status = response?.data || {};

      // On copie les informations utiles dans Redux pour les reutiliser partout dans le front.
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
      // Si le backend local ne repond pas, on evite de faire planter la page Parametres.
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
  }, [currentUsername, dispatch, isDesktopApp]);

  // Detecte l'URL a ouvrir dans le navigateur, depuis Electron ou depuis le serveur en dev.
  const detectPreferredBrowserUrl = useCallback(async () => {
    // On active un etat de chargement pour bloquer le champ pendant la detection.
    setIsDetectingAddress(true);

    try {
      // En desktop, on privilegie l'IP locale remontee par Electron.
      if ((window as any)?.desktopNetwork?.getLocalAddress) {
        const result = await (window as any).desktopNetwork.getLocalAddress();

        if (result?.success) {
          // On construit l'URL finale avec l'IP locale et on la range dans Redux.
          const detectedUrl = normalizeBrowserUrl(
            result?.url || buildBrowserUrlFromIp(result?.ipAddress || '')
          );
          setBrowserUrlInput(detectedUrl);
          dispatch(setServerUrl(detectedUrl));
          return;
        }
      }

      // En mode dev/web, on demande directement au serveur quelle IP LAN il a detectee.
      const serverInfoResponse = await apiClient.getServerInfo();
      const serverInfo = serverInfoResponse?.data || {};
      // Si Electron n'a pas fourni l'IP, on retombe sur celle calculee par le backend.
      const detectedUrl = normalizeBrowserUrl(
        serverInfo.browserUrl || buildBrowserUrlFromIp(serverInfo.ipAddress || '')
      );

      if (isValidHttpUrl(detectedUrl)) {
        // On ne sauvegarde l'URL que si elle est exploitable telle quelle dans le navigateur.
        setBrowserUrlInput(detectedUrl);
        dispatch(setServerUrl(detectedUrl));
      }
    } finally {
      // Termine l'etat de chargement quel que soit le resultat de la detection.
      setIsDetectingAddress(false);
    }
  }, [dispatch]);

  // Lance la detection automatique quand la page Parametres s'ouvre.
  useEffect(() => {
    // On charge automatiquement l'URL navigateur detectee depuis le desktop.
    detectPreferredBrowserUrl();
    // On recharge aussi l'etat de blocage pour afficher la bonne situation au createur de l'application.
    refreshDesktopSecurityStatus();
  }, [detectPreferredBrowserUrl, refreshDesktopSecurityStatus]);

  // Sauvegarde les parametres de connexion et l'URL navigateur dans Redux.
  const handleSaveSettings = useCallback(() => {
    // On repart toujours d'une URL nettoyee avant de la valider puis de la sauvegarder.
    const normalizedUrl = normalizeBrowserUrl(browserUrl);

    // On bloque l'enregistrement tant que l'URL n'a pas un format correct.
    if (!isValidHttpUrl(normalizedUrl)) {
      showNotification('Veuillez renseigner une URL valide du type http://192.168.1.25:49300', 'warning');
      return;
    }

    // Enregistre l'URL qui servira a ouvrir l'application dans le navigateur.
    dispatch(setServerUrl(normalizedUrl));
    // Enregistre aussi le mode de connexion choisi par l'utilisateur.
    dispatch(setConnectionMode(connectionMode));
    showNotification('Parametres enregistres avec succes', 'success');
  }, [browserUrl, connectionMode, dispatch, showNotification]);

  // Lance l'ouverture de l'URL dans le navigateur systeme ou web.
  const handleOpenInBrowser = useCallback(async () => {
    // L'ouverture se base sur l'URL actuellement visible dans l'ecran Parametres.
    const normalizedUrl = normalizeBrowserUrl(browserUrl);

    // On evite d'ouvrir une adresse invalide.
    if (!isValidHttpUrl(normalizedUrl)) {
      showNotification('Veuillez enregistrer une URL navigateur valide avant ouverture', 'warning');
      return;
    }

    try {
      // Ouvre l'adresse en s'adaptant au contexte desktop ou navigateur.
      await openApplicationUrlInBrowser(normalizedUrl);
    } catch (error: any) {
      // Toute erreur est remontée en notification pour que l'utilisateur comprenne l'echec.
      showNotification(error?.message || "Impossible d'ouvrir le navigateur", 'error');
    }
  }, [browserUrl, showNotification]);

  // Permet au createur de l'application de renouveler simplement l'acces desktop depuis l'application.
  const handleUnlockDesktop = useCallback(async () => {
    if (!currentUsername) {
      showNotification("Utilisateur createur de l'application introuvable", 'warning');
      return;
    }

    try {
      // On envoie au backend le nom du createur de l'application et le nombre de jours a prolonger.
      const response = await apiClient.unlockDesktopAccess({
        nomUtilisateur: currentUsername,
        extendDays: Number(extendDays || '30'),
      });
      const status = response?.data || {};

      // On resynchronise immediatement Redux avec la nouvelle date d'expiration.
      dispatch(
        setDesktopSecurityStatus({
          checked: true,
          isBlocked: Boolean(status.isBlocked),
          message: status.blockMessage || '',
          expiresAt: status.expiresAt || '',
          isSuperAdmin: Boolean(status.isSuperAdmin),
        })
      );

      showNotification('Application desktop debloquee avec succes', 'success');
    } catch (error: any) {
      // Si le backend refuse l'operation, on garde un message lisible pour l'utilisateur.
      showNotification(error?.message || "Impossible de debloquer l'application", 'error');
    }
  }, [currentUsername, dispatch, extendDays, showNotification]);

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Parametres
          </Typography>
          <Typography color="text.secondary">
            L&apos;adresse reseau de cette machine est detectee automatiquement pour ouvrir l&apos;application dans le navigateur.
          </Typography>
        </Box>

        <Card>
          <CardHeader
            avatar={<StorageRounded color="primary" />}
            title="Connexion et URL navigateur"
            subheader="Cette adresse est construite automatiquement au format http://IP:49300."
          />
          <CardContent>
            <Stack spacing={3}>
              <TextField
                select
                fullWidth
                label="Mode de connexion"
                value={connectionMode}
                onChange={(event) => setConnectionModeInput(event.target.value as ConnectionMode)}
                helperText="Le mode est enregistre pour les futurs lancements de l'application."
              >
                <MenuItem value="local">Local</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="URL navigateur"
                placeholder="http://192.168.1.25:49300"
                value={browserUrl}
                onChange={(event) => setBrowserUrlInput(event.target.value)}
                helperText="Adresse detectee automatiquement depuis la machine qui lance l'application."
                disabled={isDetectingAddress}
                InputProps={{
                  readOnly: Boolean((window as any)?.desktopNetwork?.getLocalAddress),
                  endAdornment: <LanguageRounded color={isUrlReady ? 'primary' : 'disabled'} />,
                }}
              />

              <Box>
                <Chip
                  color={isUrlReady ? 'success' : 'default'}
                  label={isUrlReady ? 'URL prete a etre ouverte' : 'URL a verifier'}
                  variant={isUrlReady ? 'filled' : 'outlined'}
                />
              </Box>

              <Alert severity="info">
                En desktop, le bouton ci-dessous ouvrira automatiquement cette adresse dans le navigateur par defaut de Windows.
              </Alert>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<SaveRounded />}
                  onClick={handleSaveSettings}
                >
                  Enregistrer
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<LaunchRounded />}
                  onClick={handleOpenInBrowser}
                >
                  Ouvrir dans le navigateur
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {isDesktopApp && (
          <Card>
            <CardHeader
              avatar={<StorageRounded color="primary" />}
              title="Blocage desktop"
              subheader="La version simple applique une expiration automatique locale. Le createur de l'application peut renouveler l'acces."
            />
            <CardContent>
              {isDesktopSuperAdmin ? (
                <Stack spacing={3}>
                  <Box>
                    <Chip
                      color={isDesktopBlocked ? 'warning' : 'success'}
                      label={isDesktopBlocked ? 'Desktop bloque' : 'Desktop actif'}
                      variant="filled"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Expiration actuelle : {desktopLicenseExpiresAt || 'non disponible'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Message courant : {desktopSecurityMessage || 'Aucun message'}
                  </Typography>

                  <Alert severity="info">
                    Cette section de renouvellement est reservee au createur de l&apos;application.
                  </Alert>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Jours a ajouter"
                      value={extendDays}
                      onChange={(event) => setExtendDays(event.target.value)}
                      sx={{ maxWidth: 220 }}
                    />

                    <Button variant="contained" onClick={handleUnlockDesktop}>
                      Debloquer le desktop
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="info">
                  La gestion du blocage desktop et des delais d&apos;expiration est reservee au createur de l&apos;application.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <NotificationComponent />
      </Stack>
    </DashboardContent>
  );
}
