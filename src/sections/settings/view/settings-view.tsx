import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  AccountCircleRounded,
  ChurchRounded,
  LanguageRounded,
  LaunchRounded,
  SaveRounded,
  StorageRounded,
} from '@mui/icons-material';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { apiClient } from 'src/utils/apiClient';
import { resolveStaticAssetUrl } from 'src/utils/asset-url';
import {
  setConnectionMode,
  setDesktopSecurityStatus,
  setServerUrl,
  setUserConnected,
} from 'src/store/appSlice';
import type { IReduxState } from 'src/store/store';
import { setUtilisateurData } from 'src/store/userSlice';

type ConnectionMode = 'local' | 'online';

type ProfileFormState = {
  logoUtilisateur: string;
  nomTemple: string;
  nomUtilisateur: string;
  prenomUtilisateur: string;
  telephoneUtilisateur: string;
  email: string;
};

// Verifie qu'une valeur peut etre interpretee comme une URL HTTP ou HTTPS.
const isValidHttpUrl = (value: string): boolean => {
  if (!value.trim()) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (_error) {
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
  const normalizedUrl = normalizeBrowserUrl(url);

  if ((window as any)?.desktopShell?.openExternal) {
    const result = await (window as any).desktopShell.openExternal(normalizedUrl);

    if (!result?.success) {
      throw new Error(result?.error || "Impossible d'ouvrir le navigateur");
    }

    return;
  }

  window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
};

export function SettingsView() {
  const dispatch = useDispatch();
  const applicationState = useSelector((state: IReduxState) => state.application);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);
  const userConnected = useSelector((state: IReduxState) => state.application.userConnected);
  const currentUsername = useSelector(
    (state: IReduxState) => state.application.userConnected?.nomUtilisateur || ''
  );
  const [browserUrl, setBrowserUrlInput] = useState(applicationState.serverUrl || '');
  const [connectionMode, setConnectionModeInput] = useState<ConnectionMode>(
    applicationState.connectionMode || 'local'
  );
  const [isDetectingAddress, setIsDetectingAddress] = useState(false);
  const [extendDays, setExtendDays] = useState('30');
  const [unlockPassword, setUnlockPassword] = useState('');
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    logoUtilisateur: '',
    nomTemple: '',
    nomUtilisateur: '',
    prenomUtilisateur: '',
    telephoneUtilisateur: '',
    email: '',
  });
  const { showNotification, NotificationComponent } = useNotificationSnackbar();
  const isDesktopApp = Boolean((window as any)?.desktopApp?.isDesktop);

  const isUrlReady = useMemo(() => isValidHttpUrl(browserUrl), [browserUrl]);
  const desktopLicenseExpiresAt = applicationState.desktopSecurityExpiresAt;
  const desktopSecurityMessage = applicationState.desktopSecurityMessage;
  const isDesktopSuperAdmin = applicationState.desktopSecurityIsSuperAdmin;
  const isDesktopBlocked = applicationState.desktopSecurityBlocked;
  const desktopDaysRemaining = applicationState.desktopSecurityDaysRemaining;
  const isFixedDesktopSuperAdmin = Number(userConnected?.idUtilisateur || utilisateurData?.idUtilisateur || -1) === 0;
  const profilePhotoUrl = profileForm.logoUtilisateur
    ? resolveStaticAssetUrl(profileForm.logoUtilisateur)
    : undefined;
  const desktopAlert = useMemo(() => {
    if (isDesktopBlocked) {
      return {
        severity: 'error',
        message: desktopSecurityMessage || "L'application desktop est actuellement bloquee. Contacte le developpeur pour renouveler l'acces.",
      } as const;
    }

    if (desktopDaysRemaining <= 1) {
      return {
        severity: 'warning',
        message: `L'application sera bloquee dans ${desktopDaysRemaining || 1} jour. Veuillez contacter le developpeur.`,
      } as const;
    }

    if (desktopDaysRemaining <= 3) {
      return {
        severity: 'warning',
        message: `L'application sera bloquee dans ${desktopDaysRemaining} jours. Veuillez contacter le developpeur.`,
      } as const;
    }

    if (desktopDaysRemaining <= 7) {
      return {
        severity: 'info',
        message: `L'application sera bloquee dans ${desktopDaysRemaining} jours. Pense a contacter le developpeur pour eviter une interruption.`,
      } as const;
    }

    if (desktopDaysRemaining <= 15) {
      return {
        severity: 'info',
        message: `L'application arrivera a expiration dans ${desktopDaysRemaining} jours.`,
      } as const;
    }

    return null;
  }, [desktopDaysRemaining, desktopSecurityMessage, isDesktopBlocked]);

  // On initialise le formulaire a partir des informations utilisateur deja disponibles.
  useEffect(() => {
    const source = {
      ...userConnected,
      ...utilisateurData,
    };

    setProfileForm({
      logoUtilisateur: source?.logoUtilisateur || '',
      nomTemple: source?.nomTemple || '',
      nomUtilisateur: source?.nomUtilisateur || '',
      prenomUtilisateur: source?.prenomUtilisateur || '',
      telephoneUtilisateur: source?.telephoneUtilisateur || '',
      email: source?.email || '',
    });
  }, [userConnected, utilisateurData]);

  // Recharge l'etat de licence desktop pour l'utilisateur courant.
  const refreshDesktopSecurityStatus = useCallback(async () => {
    if (!isDesktopApp || !currentUsername) {
      return;
    }

    try {
      const response = await apiClient.getDesktopSecurityStatus(currentUsername);
      const status = response?.data || {};

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
  }, [currentUsername, dispatch, isDesktopApp]);

  // Detecte l'URL a ouvrir dans le navigateur, depuis Electron ou depuis le serveur en dev.
  const detectPreferredBrowserUrl = useCallback(async () => {
    setIsDetectingAddress(true);

    try {
      if ((window as any)?.desktopNetwork?.getLocalAddress) {
        const result = await (window as any).desktopNetwork.getLocalAddress();

        if (result?.success) {
          const detectedUrl = normalizeBrowserUrl(
            result?.url || buildBrowserUrlFromIp(result?.ipAddress || '')
          );
          setBrowserUrlInput(detectedUrl);
          dispatch(setServerUrl(detectedUrl));
          return;
        }
      }

      const serverInfoResponse = await apiClient.getServerInfo();
      const serverInfo = serverInfoResponse?.data || {};
      const detectedUrl = normalizeBrowserUrl(
        serverInfo.browserUrl || buildBrowserUrlFromIp(serverInfo.ipAddress || '')
      );

      if (isValidHttpUrl(detectedUrl)) {
        setBrowserUrlInput(detectedUrl);
        dispatch(setServerUrl(detectedUrl));
      }
    } finally {
      setIsDetectingAddress(false);
    }
  }, [dispatch]);

  useEffect(() => {
    detectPreferredBrowserUrl();
    refreshDesktopSecurityStatus();
  }, [detectPreferredBrowserUrl, refreshDesktopSecurityStatus]);

  // Sauvegarde les parametres de connexion et l'URL navigateur dans Redux.
  const handleSaveSettings = useCallback(() => {
    const normalizedUrl = normalizeBrowserUrl(browserUrl);

    if (!isValidHttpUrl(normalizedUrl)) {
      showNotification('Veuillez renseigner une URL valide du type http://192.168.1.25:49300', 'warning');
      return;
    }

    dispatch(setServerUrl(normalizedUrl));
    dispatch(setConnectionMode(connectionMode));
    showNotification('Parametres enregistres avec succes', 'success');
  }, [browserUrl, connectionMode, dispatch, showNotification]);

  const handleOpenInBrowser = useCallback(async () => {
    const normalizedUrl = normalizeBrowserUrl(browserUrl);

    if (!isValidHttpUrl(normalizedUrl)) {
      showNotification('Veuillez enregistrer une URL navigateur valide avant ouverture', 'warning');
      return;
    }

    try {
      await openApplicationUrlInBrowser(normalizedUrl);
    } catch (error: any) {
      showNotification(error?.message || "Impossible d'ouvrir le navigateur", 'error');
    }
  }, [browserUrl, showNotification]);

  // Permet uniquement au superadmin fixe de renouveler l'acces desktop.
  const handleUnlockDesktop = useCallback(async () => {
    if (!currentUsername || !isFixedDesktopSuperAdmin) {
      showNotification("Seul le superadmin peut debloquer l'application", 'warning');
      return;
    }

    if (!unlockPassword.trim()) {
      showNotification('Le mot de passe superadmin est requis', 'warning');
      return;
    }

    try {
      const response = await apiClient.unlockDesktopAccess({
        nomUtilisateur: currentUsername,
        password: unlockPassword,
        extendDays: Number(extendDays || '30'),
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
        })
      );

      setUnlockPassword('');
      showNotification('Application desktop debloquee avec succes', 'success');
    } catch (error: any) {
      showNotification(error?.message || "Impossible de debloquer l'application", 'error');
    }
  }, [currentUsername, dispatch, extendDays, isFixedDesktopSuperAdmin, showNotification, unlockPassword]);

  const handleChangeProfileField = useCallback(
    (field: keyof ProfileFormState, value: string) => {
      setProfileForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // On met a jour les informations locales qui alimentent le menu compte et les documents imprimes.
  const handleSaveProfile = useCallback(() => {
    if (!profileForm.nomUtilisateur.trim()) {
      showNotification("Le nom d'utilisateur est requis", 'warning');
      return;
    }

    const mergedUser = {
      ...userConnected,
      ...utilisateurData,
      ...profileForm,
    };

    dispatch(setUtilisateurData(mergedUser));
    dispatch(setUserConnected(mergedUser));
    showNotification("Profil et informations d'eglise mis a jour", 'success');
  }, [dispatch, profileForm, showNotification, userConnected, utilisateurData]);

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Profil et parametres
          </Typography>
          <Typography color="text.secondary">
            Gere ici les informations de ton compte, de ton eglise et les parametres techniques de l&apos;application.
          </Typography>
        </Box>

        <Card>
          <CardHeader
            avatar={<AccountCircleRounded color="primary" />}
            title="Informations utilisateur"
            subheader="Ces donnees alimentent l&apos;espace compte et les documents generes dans l&apos;application."
          />
          <CardContent>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
                <Avatar src={profilePhotoUrl} alt={profileForm.nomUtilisateur || 'Profil'} sx={{ width: 72, height: 72 }}>
                  {(profileForm.prenomUtilisateur || profileForm.nomUtilisateur || 'P').charAt(0).toUpperCase()}
                </Avatar>

                <TextField
                  fullWidth
                  label="URL ou chemin du logo utilisateur"
                  value={profileForm.logoUtilisateur}
                  onChange={(event) => handleChangeProfileField('logoUtilisateur', event.target.value)}
                  helperText="Tu peux renseigner une URL, un chemin public ou laisser vide pour utiliser l&apos;initiale."
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={profileForm.nomUtilisateur}
                  onChange={(event) => handleChangeProfileField('nomUtilisateur', event.target.value)}
                />
                <TextField
                  fullWidth
                  label="Prenom"
                  value={profileForm.prenomUtilisateur}
                  onChange={(event) => handleChangeProfileField('prenomUtilisateur', event.target.value)}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Telephone"
                  value={profileForm.telephoneUtilisateur}
                  onChange={(event) => handleChangeProfileField('telephoneUtilisateur', event.target.value)}
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={profileForm.email}
                  onChange={(event) => handleChangeProfileField('email', event.target.value)}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            avatar={<ChurchRounded color="primary" />}
            title="Informations de l&apos;eglise"
            subheader="Cette zone permet de completer l&apos;identite de l&apos;eglise associee au compte."
          />
          <CardContent>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nom de l&apos;eglise / temple"
                value={profileForm.nomTemple}
                onChange={(event) => handleChangeProfileField('nomTemple', event.target.value)}
              />

              <Alert severity="info">
                Les donnees enregistrees ici sont reutilisees par le tableau de bord, l&apos;espace compte et les etats imprimes.
              </Alert>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant="contained" startIcon={<SaveRounded />} onClick={handleSaveProfile}>
                  Enregistrer le profil
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Divider />

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
                helperText="Le mode est enregistre pour les futurs lancements de l&apos;application."
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
                helperText="Adresse detectee automatiquement depuis la machine qui lance l&apos;application."
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
                <Button variant="contained" startIcon={<SaveRounded />} onClick={handleSaveSettings}>
                  Enregistrer
                </Button>

                <Button variant="outlined" startIcon={<LaunchRounded />} onClick={handleOpenInBrowser}>
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
              subheader="Les utilisateurs voient uniquement les alertes. Le renouvellement est reserve au superadmin fixe."
            />
            <CardContent>
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

                {desktopAlert && (
                  <Alert severity={desktopAlert.severity}>
                    {desktopAlert.message}
                  </Alert>
                )}

                {isFixedDesktopSuperAdmin ? (
                  <>
                    <Alert severity="info">
                      Cette section de renouvellement est reservee au superadmin fixe de l&apos;application.
                    </Alert>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="Jours a ajouter"
                        value={extendDays}
                        onChange={(event) => setExtendDays(event.target.value)}
                        sx={{ maxWidth: 220 }}
                      />

                      <TextField
                        type="password"
                        label="Mot de passe superadmin"
                        value={unlockPassword}
                        onChange={(event) => setUnlockPassword(event.target.value)}
                        sx={{ maxWidth: 280 }}
                      />

                      <Button variant="contained" onClick={handleUnlockDesktop}>
                        Debloquer le desktop
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <Alert severity="info">
                    Cette partie est masquee pour les autres utilisateurs. Seules les alertes d&apos;expiration sont visibles.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        <NotificationComponent />
      </Stack>
    </DashboardContent>
  );
}

