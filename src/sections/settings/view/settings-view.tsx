import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  AccountCircleRounded,
  ChurchRounded,
  DeleteRounded,
  EditRounded,
  GroupAddRounded,
  LanguageRounded,
  LaunchRounded,
  LockPersonRounded,
  LockResetRounded,
  SaveRounded,
  StorageRounded,
  UploadRounded,
} from '@mui/icons-material';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ConfirmDialog from 'src/components/alert/confirmDialog';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  setConnectionMode,
  setDesktopSecurityStatus,
  setServerUrl,
  setUserConnected,
} from 'src/store/appSlice';
import type { IReduxState } from 'src/store/store';
import type { IUtilisateur, ModulePermissionKey, UserRole } from 'src/store/userSlice';
import { setUtilisateurData } from 'src/store/userSlice';
import { apiClient, buildChurchLogoUrl } from 'src/utils/apiClient';
import {
  ALL_MODULE_PERMISSIONS,
  MODULE_PERMISSION_LABELS,
  getScopeUserIdFromUser,
  getUserRole,
  parsePermissions,
  stringifyPermissions,
} from 'src/utils/access-control';
import { subscribeToCommunauteEvent } from 'src/utils/socket-client';

type ConnectionMode = 'local' | 'online';

type ProfileFormState = {
  logoUtilisateur: string;
  logoEglise: string;
  nomTemple: string;
  lieuEglise: string;
  nomUtilisateur: string;
  prenomUtilisateur: string;
  telephoneUtilisateur: string;
  telephoneSecretariatEglise: string;
  pasteurPrincipal: string;
  pasteurSecondaire: string;
  pasteurTroisieme: string;
  telephonePasteurPrincipal: string;
  telephonePasteurSecondaire: string;
  telephonePasteurTroisieme: string;
  capaciteAccueilEglise: string;
  nombreCultesDimanche: string;
  emailEglise: string;
  boitePostaleEglise: string;
  dateCreationEglise: string;
  nombrePasteursEglise: string;
  nombreAnciensEglise: string;
  nombreDiacresEglise: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const emptyProfileForm: ProfileFormState = {
  logoUtilisateur: '',
  logoEglise: '',
  nomTemple: '',
  lieuEglise: '',
  nomUtilisateur: '',
  prenomUtilisateur: '',
  telephoneUtilisateur: '',
  telephoneSecretariatEglise: '',
  pasteurPrincipal: '',
  pasteurSecondaire: '',
  pasteurTroisieme: '',
  telephonePasteurPrincipal: '',
  telephonePasteurSecondaire: '',
  telephonePasteurTroisieme: '',
  capaciteAccueilEglise: '',
  nombreCultesDimanche: '',
  emailEglise: '',
  boitePostaleEglise: '',
  dateCreationEglise: '',
  nombrePasteursEglise: '',
  nombreAnciensEglise: '',
  nombreDiacresEglise: '',
  email: '',
  password: '',
  confirmPassword: '',
};

type SecondaryUserFormState = {
  idUtilisateur: number | null;
  nomUtilisateur: string;
  prenomUtilisateur: string;
  telephoneUtilisateur: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleUtilisateur: Extract<UserRole, 'gestionnaire' | 'lecteur'>;
  permissions: ModulePermissionKey[];
  actifUtilisateur: number;
};

const emptySecondaryUserForm: SecondaryUserFormState = {
  idUtilisateur: null,
  nomUtilisateur: '',
  prenomUtilisateur: '',
  telephoneUtilisateur: '',
  email: '',
  password: '',
  confirmPassword: '',
  roleUtilisateur: 'gestionnaire',
  permissions: ['dashboard', 'comptabilite'],
  actifUtilisateur: 1,
};

const roleOptions: Array<{ label: string; value: SecondaryUserFormState['roleUtilisateur'] }> = [
  { label: 'Gestionnaire', value: 'gestionnaire' },
  { label: 'Lecteur', value: 'lecteur' },
];

type ResetSecondaryPasswordFormState = {
  password: string;
  confirmPassword: string;
};

const emptyResetSecondaryPasswordForm: ResetSecondaryPasswordFormState = {
  password: '',
  confirmPassword: '',
};

const buildSecondaryUserFormFromEntity = (user: IUtilisateur): SecondaryUserFormState => ({
  idUtilisateur: Number(user.idUtilisateur || 0),
  nomUtilisateur: user.nomUtilisateur || '',
  prenomUtilisateur: user.prenomUtilisateur || '',
  telephoneUtilisateur: user.telephoneUtilisateur || '',
  email: user.email || '',
  password: '',
  confirmPassword: '',
  roleUtilisateur: getUserRole(user) === 'lecteur' ? 'lecteur' : 'gestionnaire',
  permissions: Array.from(new Set(['dashboard', ...parsePermissions(user.permissionsUtilisateur)])) as ModulePermissionKey[],
  actifUtilisateur: Number(user.actifUtilisateur || 1),
});

const normalizePermissions = (permissions: ModulePermissionKey[]): ModulePermissionKey[] =>
  Array.from(new Set(['dashboard', ...permissions.filter((item) => ALL_MODULE_PERMISSIONS.includes(item))])) as ModulePermissionKey[];

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

const normalizeBrowserUrl = (value: string): string => value.trim().replace(/\/+$/, '');
const buildBrowserUrlFromIp = (ipAddress: string, port = 49300): string => `http://${ipAddress}:${port}`;
const getCurrentBrowserOrigin = (): string => normalizeBrowserUrl(window.location.origin);

const getDesktopCountdown = (expiresAt: string, now: number) => {
  const expirationTime = new Date(expiresAt).getTime();

  if (!expiresAt || Number.isNaN(expirationTime)) {
    return null;
  }

  const totalSeconds = Math.max(0, Math.floor((expirationTime - now) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: totalSeconds === 0,
  };
};

const convertFileToBase64DataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const getChurchLogoPreviewUrl = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (/^(data:|https?:|blob:|file:)/i.test(value)) {
    return value;
  }

  return buildChurchLogoUrl(value);
};

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
    (state: IReduxState) =>
      state.application.userConnected?.nomUtilisateur ||
      state.authentification.utilisateurData?.nomUtilisateur ||
      ''
  );

  const [browserUrl, setBrowserUrlInput] = useState(applicationState.serverUrl || '');
  const [connectionMode, setConnectionModeInput] = useState<ConnectionMode>(
    applicationState.connectionMode || 'local'
  );
  const [isDetectingAddress, setIsDetectingAddress] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [extendDays, setExtendDays] = useState('30');
  const [unlockPassword, setUnlockPassword] = useState('');
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm);
  const [secondaryUsers, setSecondaryUsers] = useState<IUtilisateur[]>([]);
  const [loadingSecondaryUsers, setLoadingSecondaryUsers] = useState(false);
  const [secondaryUserForm, setSecondaryUserForm] = useState<SecondaryUserFormState>(emptySecondaryUserForm);
  const [isSavingSecondaryUser, setIsSavingSecondaryUser] = useState(false);
  const [deletingSecondaryUser, setDeletingSecondaryUser] = useState<IUtilisateur | null>(null);
  const [isDeletingSecondaryUser, setIsDeletingSecondaryUser] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<IUtilisateur | null>(null);
  const [resetPasswordForm, setResetPasswordForm] = useState<ResetSecondaryPasswordFormState>(
    emptyResetSecondaryPasswordForm
  );
  const [isResettingSecondaryPassword, setIsResettingSecondaryPassword] = useState(false);
  const [countdownNow, setCountdownNow] = useState(Date.now());
  const { showNotification, NotificationComponent } = useNotificationSnackbar();
  const isDesktopApp = Boolean((window as any)?.desktopApp?.isDesktop);

  const sessionUser = useMemo(() => ({ ...utilisateurData, ...userConnected }), [userConnected, utilisateurData]);
  const currentRole = useMemo(() => getUserRole(sessionUser), [sessionUser]);
  const currentSessionUserId = Number(sessionUser?.idUtilisateur || 0);
  const currentAccountId = getScopeUserIdFromUser(sessionUser) || 0;
  const isSecondarySessionUser = Number(sessionUser?.idUtilisateurParent || 0) > 0;
  const canManageSecondaryUsers =
    currentRole === 'admin' && currentSessionUserId > 0 && !isSecondarySessionUser && currentAccountId > 0;
  const isUrlReady = useMemo(() => isValidHttpUrl(browserUrl), [browserUrl]);
  const desktopLicenseExpiresAt = applicationState.desktopSecurityExpiresAt;
  const desktopSecurityMessage = applicationState.desktopSecurityMessage;
  const isDesktopBlocked = applicationState.desktopSecurityBlocked;
  const desktopDaysRemaining = applicationState.desktopSecurityDaysRemaining;
  const isFixedDesktopSuperAdmin =
    Number(userConnected?.idUtilisateur ?? utilisateurData?.idUtilisateur ?? -1) === 0;
  const canInspectDesktopLicense = isDesktopApp || isFixedDesktopSuperAdmin;
  const desktopCountdown = useMemo(
    () => getDesktopCountdown(desktopLicenseExpiresAt, countdownNow),
    [countdownNow, desktopLicenseExpiresAt]
  );
  const churchLogoPreviewUrl = useMemo(
    () => getChurchLogoPreviewUrl(profileForm.logoEglise),
    [profileForm.logoEglise]
  );
  const secondaryUserCount = secondaryUsers.length;
  const isEditingSecondaryUser = Boolean(secondaryUserForm.idUtilisateur);

  const desktopAlert = useMemo(() => {
    if (isDesktopBlocked) {
      return {
        severity: 'error',
        message:
          desktopSecurityMessage ||
          "L'application desktop est actuellement bloquee. Contacte le developpeur pour renouveler l'acces.",
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

  useEffect(() => {
    const source = {
      ...userConnected,
      ...utilisateurData,
    };

    setProfileForm({
      logoUtilisateur: source?.logoUtilisateur || '',
      logoEglise: source?.logoEglise || '',
      nomTemple: source?.nomTemple || '',
      lieuEglise: source?.lieuEglise || '',
      nomUtilisateur: source?.nomUtilisateur || '',
      prenomUtilisateur: source?.prenomUtilisateur || '',
      telephoneUtilisateur: source?.telephoneUtilisateur || '',
      telephoneSecretariatEglise: source?.telephoneSecretariatEglise || '',
      pasteurPrincipal: source?.pasteurPrincipal || '',
      pasteurSecondaire: source?.pasteurSecondaire || '',
      pasteurTroisieme: source?.pasteurTroisieme || '',
      telephonePasteurPrincipal: source?.telephonePasteurPrincipal || '',
      telephonePasteurSecondaire: source?.telephonePasteurSecondaire || '',
      telephonePasteurTroisieme: source?.telephonePasteurTroisieme || '',
      capaciteAccueilEglise: source?.capaciteAccueilEglise || '',
      nombreCultesDimanche: source?.nombreCultesDimanche || '',
      emailEglise: source?.emailEglise || '',
      boitePostaleEglise: source?.boitePostaleEglise || '',
      dateCreationEglise: source?.dateCreationEglise || '',
      nombrePasteursEglise: source?.nombrePasteursEglise || '',
      nombreAnciensEglise: source?.nombreAnciensEglise || '',
      nombreDiacresEglise: source?.nombreDiacresEglise || '',
      email: source?.email || '',
      password: '',
      confirmPassword: '',
    });
  }, [userConnected, utilisateurData]);

  useEffect(() => {
    if (!isFixedDesktopSuperAdmin || !desktopLicenseExpiresAt) {
      return undefined;
    }

    setCountdownNow(Date.now());
    const intervalId = window.setInterval(() => {
      setCountdownNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [desktopLicenseExpiresAt, isFixedDesktopSuperAdmin]);

  const loadSecondaryUsers = useCallback(async () => {
    if (!canManageSecondaryUsers) {
      setSecondaryUsers([]);
      return;
    }

    try {
      setLoadingSecondaryUsers(true);
      const response = await apiClient.get(`communaute/listeutilisateurparent/${currentAccountId}`);
      setSecondaryUsers(Array.isArray(response?.data) ? response.data : []);
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de charger les utilisateurs secondaires.', 'error');
    } finally {
      setLoadingSecondaryUsers(false);
    }
  }, [canManageSecondaryUsers, currentAccountId, showNotification]);

  const refreshDesktopSecurityStatus = useCallback(async () => {
    if (!canInspectDesktopLicense || !currentUsername) {
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
  }, [canInspectDesktopLicense, currentUsername, dispatch]);

  const detectPreferredBrowserUrl = useCallback(async () => {
    setIsDetectingAddress(true);

    try {
      if (!isDesktopApp) {
        const currentOrigin = getCurrentBrowserOrigin();

        if (isValidHttpUrl(currentOrigin)) {
          setBrowserUrlInput(currentOrigin);
          dispatch(setServerUrl(currentOrigin));
          return;
        }
      }

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
  }, [dispatch, isDesktopApp]);

  useEffect(() => {
    detectPreferredBrowserUrl();
    refreshDesktopSecurityStatus();
  }, [detectPreferredBrowserUrl, refreshDesktopSecurityStatus]);

  useEffect(() => {
    loadSecondaryUsers();
  }, [loadSecondaryUsers]);

  useEffect(() => {
    if (!canManageSecondaryUsers) {
      return undefined;
    }

    const unsubscribers = [
      subscribeToCommunauteEvent('ajouterUtilisateur', () => {
        loadSecondaryUsers();
      }),
      subscribeToCommunauteEvent('modifierUtilisateur', () => {
        loadSecondaryUsers();
      }),
      subscribeToCommunauteEvent('supprimerUtilisateur', () => {
        loadSecondaryUsers();
      }),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [canManageSecondaryUsers, loadSecondaryUsers]);

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

  const handleChurchLogoUpload = useCallback(async (file?: File | null) => {
    if (!file) {
      return;
    }

    try {
      const base64 = await convertFileToBase64DataUrl(file);
      handleChangeProfileField('logoEglise', base64);
      showNotification("Logo de l'eglise charge. Enregistre pour le conserver.", 'info');
    } catch (_error) {
      showNotification('Impossible de charger ce logo.', 'error');
    }
  }, [handleChangeProfileField, showNotification]);

  const handleRemoveChurchLogo = useCallback(() => {
    handleChangeProfileField('logoEglise', '');
  }, [handleChangeProfileField]);

  const handleSaveProfile = useCallback(async () => {
    const existingUser = {
      ...utilisateurData,
      ...userConnected,
    };
    const idUtilisateur = Number(existingUser?.idUtilisateur || 0);

    if (!idUtilisateur) {
      showNotification('Utilisateur introuvable. Reconnecte-toi puis recommence.', 'warning');
      return;
    }

    if (!profileForm.nomUtilisateur.trim()) {
      showNotification("Le nom d'utilisateur est requis", 'warning');
      return;
    }

    if (!profileForm.nomTemple.trim()) {
      showNotification("Le nom de l'eglise est requis", 'warning');
      return;
    }

    if ((profileForm.password || profileForm.confirmPassword)
      && profileForm.password !== profileForm.confirmPassword) {
      showNotification('La confirmation du nouveau mot de passe ne correspond pas.', 'warning');
      return;
    }

    const nextPassword = profileForm.password.trim()
      ? profileForm.password.trim()
      : existingUser?.password || '';
    const nextConfirmPassword = profileForm.password.trim()
      ? profileForm.confirmPassword.trim() || profileForm.password.trim()
      : existingUser?.confirmPassword || existingUser?.password || '';

    const payload = {
      ...existingUser,
      ...profileForm,
      idUtilisateur,
      password: nextPassword,
      confirmPassword: nextConfirmPassword,
    };

    try {
      setIsSavingProfile(true);
      const response = await apiClient.updateUtilisateur(payload);
      const savedUser = response?.data || payload;

      dispatch(setUtilisateurData(savedUser));
      dispatch(setUserConnected(savedUser));
      setProfileForm((prev) => ({
        ...prev,
        ...savedUser,
        password: '',
        confirmPassword: '',
      }));
      showNotification("Informations de l'eglise enregistrees avec succes", 'success');
    } catch (error: any) {
      showNotification(error?.message || "Impossible d'enregistrer les informations de l'eglise", 'error');
    } finally {
      setIsSavingProfile(false);
    }
  }, [dispatch, profileForm, showNotification, userConnected, utilisateurData]);

  const handleChangeSecondaryUserField = useCallback(
    (field: keyof SecondaryUserFormState, value: string | number | ModulePermissionKey[]) => {
      setSecondaryUserForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleResetSecondaryUserForm = useCallback(() => {
    setSecondaryUserForm(emptySecondaryUserForm);
  }, []);

  const handleTogglePermission = useCallback((permission: ModulePermissionKey) => {
    if (permission === 'dashboard') {
      return;
    }

    setSecondaryUserForm((prev) => {
      const exists = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: normalizePermissions(
          exists
            ? prev.permissions.filter((item) => item !== permission)
            : [...prev.permissions, permission]
        ),
      };
    });
  }, []);

  const handleEditSecondaryUser = useCallback((user: IUtilisateur) => {
    setSecondaryUserForm(buildSecondaryUserFormFromEntity(user));
  }, []);

  const handleOpenResetSecondaryPassword = useCallback((user: IUtilisateur) => {
    setResetPasswordUser(user);
    setResetPasswordForm(emptyResetSecondaryPasswordForm);
  }, []);

  const handleCloseResetSecondaryPassword = useCallback(() => {
    if (isResettingSecondaryPassword) {
      return;
    }

    setResetPasswordUser(null);
    setResetPasswordForm(emptyResetSecondaryPasswordForm);
  }, [isResettingSecondaryPassword]);

  const handleSaveSecondaryUser = useCallback(async () => {
    if (!canManageSecondaryUsers) {
      showNotification("Cette action est reservee a l'administrateur principal.", 'warning');
      return;
    }

    if (!secondaryUserForm.nomUtilisateur.trim()) {
      showNotification('Le nom utilisateur est requis.', 'warning');
      return;
    }

    if (!secondaryUserForm.prenomUtilisateur.trim()) {
      showNotification("Le prenom de l'utilisateur est requis.", 'warning');
      return;
    }

    if (!isEditingSecondaryUser && secondaryUserCount >= 5) {
      showNotification('Le maximum de 5 utilisateurs secondaires a deja ete atteint.', 'warning');
      return;
    }

    if (!isEditingSecondaryUser && !secondaryUserForm.password.trim()) {
      showNotification('Le mot de passe du nouvel utilisateur est requis.', 'warning');
      return;
    }

    if ((secondaryUserForm.password || secondaryUserForm.confirmPassword)
      && secondaryUserForm.password !== secondaryUserForm.confirmPassword) {
      showNotification('La confirmation du mot de passe ne correspond pas.', 'warning');
      return;
    }

    const existingSecondaryUser = secondaryUsers.find(
      (item) => item.idUtilisateur === secondaryUserForm.idUtilisateur
    );
    const nextPassword = secondaryUserForm.password.trim()
      ? secondaryUserForm.password.trim()
      : existingSecondaryUser?.password || '';
    const nextConfirmPassword = secondaryUserForm.password.trim()
      ? secondaryUserForm.confirmPassword.trim() || secondaryUserForm.password.trim()
      : existingSecondaryUser?.confirmPassword || existingSecondaryUser?.password || '';

    const sharedChurchData = {
      logoUtilisateur: '',
      logoEglise: sessionUser?.logoEglise || '',
      nomTemple: sessionUser?.nomTemple || '',
      lieuEglise: sessionUser?.lieuEglise || '',
      telephoneSecretariatEglise: sessionUser?.telephoneSecretariatEglise || '',
      pasteurPrincipal: sessionUser?.pasteurPrincipal || '',
      pasteurSecondaire: sessionUser?.pasteurSecondaire || '',
      pasteurTroisieme: sessionUser?.pasteurTroisieme || '',
      telephonePasteurPrincipal: sessionUser?.telephonePasteurPrincipal || '',
      telephonePasteurSecondaire: sessionUser?.telephonePasteurSecondaire || '',
      telephonePasteurTroisieme: sessionUser?.telephonePasteurTroisieme || '',
      capaciteAccueilEglise: sessionUser?.capaciteAccueilEglise || '',
      nombreCultesDimanche: sessionUser?.nombreCultesDimanche || '',
      emailEglise: sessionUser?.emailEglise || '',
      boitePostaleEglise: sessionUser?.boitePostaleEglise || '',
      dateCreationEglise: sessionUser?.dateCreationEglise || '',
      nombrePasteursEglise: sessionUser?.nombrePasteursEglise || '',
      nombreAnciensEglise: sessionUser?.nombreAnciensEglise || '',
      nombreDiacresEglise: sessionUser?.nombreDiacresEglise || '',
    };

    const payload = {
      ...sharedChurchData,
      idUtilisateur: secondaryUserForm.idUtilisateur || undefined,
      idUtilisateurParent: currentAccountId,
      nomUtilisateur: secondaryUserForm.nomUtilisateur.trim(),
      prenomUtilisateur: secondaryUserForm.prenomUtilisateur.trim(),
      telephoneUtilisateur: secondaryUserForm.telephoneUtilisateur.trim(),
      email: secondaryUserForm.email.trim(),
      password: nextPassword,
      confirmPassword: nextConfirmPassword,
      roleUtilisateur: secondaryUserForm.roleUtilisateur,
      permissionsUtilisateur: stringifyPermissions(normalizePermissions(secondaryUserForm.permissions)),
      actifUtilisateur: Number(secondaryUserForm.actifUtilisateur || 1),
    };

    try {
      setIsSavingSecondaryUser(true);
      if (isEditingSecondaryUser && secondaryUserForm.idUtilisateur) {
        await apiClient.post('communaute/modifierutilisateur', payload);
        showNotification('Utilisateur secondaire mis a jour avec succes.', 'success');
      } else {
        await apiClient.post('communaute/ajouterutilisateur', payload);
        showNotification('Utilisateur secondaire cree avec succes.', 'success');
      }

      handleResetSecondaryUserForm();
      await loadSecondaryUsers();
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de sauvegarder cet utilisateur.', 'error');
    } finally {
      setIsSavingSecondaryUser(false);
    }
  }, [
    canManageSecondaryUsers,
    currentAccountId,
    handleResetSecondaryUserForm,
    isEditingSecondaryUser,
    loadSecondaryUsers,
    secondaryUserCount,
    secondaryUserForm,
    secondaryUsers,
    sessionUser,
    showNotification,
  ]);

  const handleResetSecondaryPassword = useCallback(async () => {
    if (!canManageSecondaryUsers) {
      showNotification("Cette action est reservee a l'administrateur principal.", 'warning');
      return;
    }

    if (!resetPasswordUser?.idUtilisateur) {
      showNotification('Utilisateur secondaire introuvable.', 'warning');
      return;
    }

    if (!resetPasswordForm.password.trim()) {
      showNotification('Le nouveau mot de passe est requis.', 'warning');
      return;
    }

    if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
      showNotification('La confirmation du mot de passe ne correspond pas.', 'warning');
      return;
    }

    const sharedChurchData = {
      logoUtilisateur: '',
      logoEglise: sessionUser?.logoEglise || '',
      nomTemple: sessionUser?.nomTemple || '',
      lieuEglise: sessionUser?.lieuEglise || '',
      telephoneSecretariatEglise: sessionUser?.telephoneSecretariatEglise || '',
      pasteurPrincipal: sessionUser?.pasteurPrincipal || '',
      pasteurSecondaire: sessionUser?.pasteurSecondaire || '',
      pasteurTroisieme: sessionUser?.pasteurTroisieme || '',
      telephonePasteurPrincipal: sessionUser?.telephonePasteurPrincipal || '',
      telephonePasteurSecondaire: sessionUser?.telephonePasteurSecondaire || '',
      telephonePasteurTroisieme: sessionUser?.telephonePasteurTroisieme || '',
      capaciteAccueilEglise: sessionUser?.capaciteAccueilEglise || '',
      nombreCultesDimanche: sessionUser?.nombreCultesDimanche || '',
      emailEglise: sessionUser?.emailEglise || '',
      boitePostaleEglise: sessionUser?.boitePostaleEglise || '',
      dateCreationEglise: sessionUser?.dateCreationEglise || '',
      nombrePasteursEglise: sessionUser?.nombrePasteursEglise || '',
      nombreAnciensEglise: sessionUser?.nombreAnciensEglise || '',
      nombreDiacresEglise: sessionUser?.nombreDiacresEglise || '',
    };

    const payload = {
      ...sharedChurchData,
      idUtilisateur: resetPasswordUser.idUtilisateur,
      idUtilisateurParent: currentAccountId,
      nomUtilisateur: resetPasswordUser.nomUtilisateur || '',
      prenomUtilisateur: resetPasswordUser.prenomUtilisateur || '',
      telephoneUtilisateur: resetPasswordUser.telephoneUtilisateur || '',
      email: resetPasswordUser.email || '',
      password: resetPasswordForm.password.trim(),
      confirmPassword: resetPasswordForm.confirmPassword.trim(),
      roleUtilisateur: getUserRole(resetPasswordUser) === 'lecteur' ? 'lecteur' : 'gestionnaire',
      permissionsUtilisateur: stringifyPermissions(
        normalizePermissions(parsePermissions(resetPasswordUser.permissionsUtilisateur))
      ),
      actifUtilisateur: Number(resetPasswordUser.actifUtilisateur || 1),
    };

    try {
      setIsResettingSecondaryPassword(true);
      await apiClient.post('communaute/modifierutilisateur', payload);
      showNotification('Mot de passe reinitialise avec succes.', 'success');
      setResetPasswordUser(null);
      setResetPasswordForm(emptyResetSecondaryPasswordForm);
      await loadSecondaryUsers();
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de reinitialiser ce mot de passe.', 'error');
    } finally {
      setIsResettingSecondaryPassword(false);
    }
  }, [
    canManageSecondaryUsers,
    currentAccountId,
    loadSecondaryUsers,
    resetPasswordForm,
    resetPasswordUser,
    sessionUser,
    showNotification,
  ]);

  const handleConfirmDeleteSecondaryUser = useCallback(async () => {
    if (!deletingSecondaryUser?.idUtilisateur) {
      return;
    }

    try {
      setIsDeletingSecondaryUser(true);
      await apiClient.post('communaute/supprimerutilisateur', {
        idUtilisateur: deletingSecondaryUser.idUtilisateur,
      });
      if (secondaryUserForm.idUtilisateur === deletingSecondaryUser.idUtilisateur) {
        handleResetSecondaryUserForm();
      }
      showNotification('Utilisateur secondaire supprime avec succes.', 'success');
      setDeletingSecondaryUser(null);
      await loadSecondaryUsers();
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de supprimer cet utilisateur.', 'error');
    } finally {
      setIsDeletingSecondaryUser(false);
    }
  }, [deletingSecondaryUser, handleResetSecondaryUserForm, loadSecondaryUsers, secondaryUserForm.idUtilisateur, showNotification]);

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Parametres
          </Typography>
          <Typography color="text.secondary">
            Gere ici les informations de ton compte, de ton eglise et les parametres techniques de l&apos;application.
          </Typography>
        </Box>

        {isFixedDesktopSuperAdmin && (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6">
                    Compte a rebours avant blocage
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Visible uniquement pour le superadmin fixe connecte.
                  </Typography>
                </Box>

                {desktopCountdown ? (
                  <>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {[
                        { label: 'Jours', value: desktopCountdown.days },
                        { label: 'Heures', value: desktopCountdown.hours },
                        { label: 'Minutes', value: desktopCountdown.minutes },
                        { label: 'Secondes', value: desktopCountdown.seconds },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            minWidth: 96,
                            px: 1.5,
                            py: 1.25,
                            borderRadius: 2,
                            bgcolor: 'background.neutral',
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h5" fontWeight={800}>
                            {String(item.value).padStart(2, '0')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.label}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    {desktopCountdown.isExpired && (
                      <Alert severity="warning">
                        La licence est arrivee a expiration. Debloque le desktop pour relancer une nouvelle periode.
                      </Alert>
                    )}
                  </>
                ) : (
                  <Alert severity="info">
                    Chargement du compte a rebours de la licence desktop...
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader
            avatar={<AccountCircleRounded color="primary" />}
            title="Informations utilisateur"
            subheader="Ces donnees alimentent l&apos;espace compte et les documents generes dans l&apos;application."
          />
          <CardContent>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Nom utilisateur"
                  value={profileForm.nomUtilisateur}
                  onChange={(event) => handleChangeProfileField('nomUtilisateur', event.target.value)}
                  disabled={isFixedDesktopSuperAdmin}
                  helperText={isFixedDesktopSuperAdmin ? 'Le superadmin fixe se configure cote serveur.' : ''}
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

              {isFixedDesktopSuperAdmin ? (
                <Alert severity="info">
                  Les identifiants du superadmin fixe se modifient dans la configuration backend, pas dans le profil.
                </Alert>
              ) : (
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Nouveau mot de passe"
                    value={profileForm.password}
                    onChange={(event) => handleChangeProfileField('password', event.target.value)}
                    helperText="Laisse vide pour conserver le mot de passe actuel."
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirmer le nouveau mot de passe"
                    value={profileForm.confirmPassword}
                    onChange={(event) => handleChangeProfileField('confirmPassword', event.target.value)}
                    error={Boolean(profileForm.confirmPassword && profileForm.password !== profileForm.confirmPassword)}
                    helperText={
                      profileForm.confirmPassword && profileForm.password !== profileForm.confirmPassword
                        ? 'La confirmation ne correspond pas.'
                        : 'Confirme uniquement si tu changes le mot de passe.'
                    }
                  />
                </Stack>
              )}

              {!isFixedDesktopSuperAdmin && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<SaveRounded />}
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? 'Enregistrement...' : 'Enregistrer les identifiants'}
                  </Button>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            avatar={<ChurchRounded color="primary" />}
            title="Informations de l&apos;eglise"
            subheader="Ces informations sont sauvegardees et pourront etre reutilisees dans tous les documents imprimables."
          />
          <CardContent>
            <Stack spacing={3}>
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={3}
                alignItems={{ xs: 'stretch', lg: 'flex-start' }}
              >
                <Card
                  variant="outlined"
                  sx={{
                    width: { xs: '100%', lg: 280 },
                    minWidth: { xs: '100%', lg: 280 },
                    borderRadius: 3,
                    alignSelf: 'stretch',
                  }}
                >
                  <CardContent>
                    <Stack spacing={2.5} alignItems="center">
                      <Avatar
                        src={churchLogoPreviewUrl}
                        alt={profileForm.nomTemple || 'Logo eglise'}
                        variant="rounded"
                        sx={{ width: 132, height: 132, borderRadius: 4, bgcolor: 'grey.100' }}
                      >
                        <ChurchRounded color="primary" sx={{ fontSize: 44 }} />
                      </Avatar>

                      <Stack spacing={0.75} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700} textAlign="center">
                          Logo de l&apos;eglise
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          Le logo est stocke localement et reutilise automatiquement dans les impressions.
                        </Typography>
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row', lg: 'column' }} spacing={1.5} sx={{ width: '100%' }}>
                        <Button component="label" variant="contained" startIcon={<UploadRounded />} sx={{ width: '100%' }}>
                          Telecharger le logo
                          <input
                            hidden
                            accept="image/*"
                            type="file"
                            onChange={(event) => handleChurchLogoUpload(event.target.files?.[0] || null)}
                          />
                        </Button>
                        <Button
                          variant="outlined"
                          color="inherit"
                          startIcon={<DeleteRounded />}
                          sx={{ width: '100%' }}
                          onClick={handleRemoveChurchLogo}
                          disabled={!profileForm.logoEglise}
                        >
                          Retirer le logo
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <Stack spacing={3} sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Nom de l&apos;eglise / temple"
                      value={profileForm.nomTemple}
                      onChange={(event) => handleChangeProfileField('nomTemple', event.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Lieu de l&apos;eglise"
                      value={profileForm.lieuEglise}
                      onChange={(event) => handleChangeProfileField('lieuEglise', event.target.value)}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Pasteur principal"
                      value={profileForm.pasteurPrincipal}
                      onChange={(event) => handleChangeProfileField('pasteurPrincipal', event.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Telephone pasteur principal"
                      value={profileForm.telephonePasteurPrincipal}
                      onChange={(event) => handleChangeProfileField('telephonePasteurPrincipal', event.target.value)}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Pasteur secondaire"
                      value={profileForm.pasteurSecondaire}
                      onChange={(event) => handleChangeProfileField('pasteurSecondaire', event.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Telephone pasteur secondaire"
                      value={profileForm.telephonePasteurSecondaire}
                      onChange={(event) => handleChangeProfileField('telephonePasteurSecondaire', event.target.value)}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="3eme pasteur"
                      value={profileForm.pasteurTroisieme}
                      onChange={(event) => handleChangeProfileField('pasteurTroisieme', event.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Telephone du 3eme pasteur"
                      value={profileForm.telephonePasteurTroisieme}
                      onChange={(event) => handleChangeProfileField('telephonePasteurTroisieme', event.target.value)}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Telephone du secretariat"
                      value={profileForm.telephoneSecretariatEglise}
                      onChange={(event) => handleChangeProfileField('telephoneSecretariatEglise', event.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Email de l&apos;eglise"
                      value={profileForm.emailEglise}
                      onChange={(event) => handleChangeProfileField('emailEglise', event.target.value)}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Boite postale"
                      value={profileForm.boitePostaleEglise}
                      onChange={(event) => handleChangeProfileField('boitePostaleEglise', event.target.value)}
                    />
                    <TextField
                      fullWidth
                      type="date"
                      label="Date de creation"
                      value={profileForm.dateCreationEglise}
                      onChange={(event) => handleChangeProfileField('dateCreationEglise', event.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Capacite estimee de membres"
                      value={profileForm.capaciteAccueilEglise}
                      onChange={(event) => handleChangeProfileField('capaciteAccueilEglise', event.target.value)}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Nombre de cultes par dimanche"
                      value={profileForm.nombreCultesDimanche}
                      onChange={(event) => handleChangeProfileField('nombreCultesDimanche', event.target.value)}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Nombre de pasteurs"
                      value={profileForm.nombrePasteursEglise}
                      onChange={(event) => handleChangeProfileField('nombrePasteursEglise', event.target.value)}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Nombre d&apos;anciens"
                      value={profileForm.nombreAnciensEglise}
                      onChange={(event) => handleChangeProfileField('nombreAnciensEglise', event.target.value)}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Nombre de diacres"
                      value={profileForm.nombreDiacresEglise}
                      onChange={(event) => handleChangeProfileField('nombreDiacresEglise', event.target.value)}
                    />
                  </Stack>
                </Stack>
              </Stack>

              <Alert severity="info">
                Les donnees enregistrees ici sont reutilisees par le tableau de bord, l&apos;espace compte et les etats imprimes. Tu peux les modifier a tout moment sans perdre les valeurs deja saisies.
              </Alert>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<SaveRounded />}
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? 'Enregistrement...' : 'Enregistrer le profil'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {canManageSecondaryUsers && (
          <Card>
            <CardHeader
              avatar={<GroupAddRounded color="primary" />}
              title="Utilisateurs et droits d'acces"
              subheader="Creer jusqu'a 5 utilisateurs secondaires relies a cette eglise. Les acces determinent les onglets visibles, et le role lecteur bloque les actions d'ecriture."
            />
            <CardContent>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3} alignItems="stretch">
                  <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                    <Alert severity="info">
                      Utilisateurs secondaires crees : {secondaryUserCount} / 5. Le dashboard reste toujours accessible pour eviter de bloquer une session apres connexion.
                    </Alert>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        label="Nom utilisateur"
                        value={secondaryUserForm.nomUtilisateur}
                        onChange={(event) => handleChangeSecondaryUserField('nomUtilisateur', event.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Prenom"
                        value={secondaryUserForm.prenomUtilisateur}
                        onChange={(event) => handleChangeSecondaryUserField('prenomUtilisateur', event.target.value)}
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        label="Telephone"
                        value={secondaryUserForm.telephoneUtilisateur}
                        onChange={(event) => handleChangeSecondaryUserField('telephoneUtilisateur', event.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        value={secondaryUserForm.email}
                        onChange={(event) => handleChangeSecondaryUserField('email', event.target.value)}
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        type="password"
                        label={isEditingSecondaryUser ? 'Nouveau mot de passe (facultatif)' : 'Mot de passe'}
                        value={secondaryUserForm.password}
                        onChange={(event) => handleChangeSecondaryUserField('password', event.target.value)}
                      />
                      <TextField
                        fullWidth
                        type="password"
                        label={isEditingSecondaryUser ? 'Confirmer le nouveau mot de passe' : 'Confirmer le mot de passe'}
                        value={secondaryUserForm.confirmPassword}
                        onChange={(event) => handleChangeSecondaryUserField('confirmPassword', event.target.value)}
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        select
                        fullWidth
                        label="Role"
                        value={secondaryUserForm.roleUtilisateur}
                        onChange={(event) => handleChangeSecondaryUserField('roleUtilisateur', event.target.value)}
                      >
                        {roleOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        select
                        fullWidth
                        label="Statut"
                        value={String(secondaryUserForm.actifUtilisateur)}
                        onChange={(event) => handleChangeSecondaryUserField('actifUtilisateur', Number(event.target.value))}
                      >
                        <MenuItem value="1">Actif</MenuItem>
                        <MenuItem value="0">Bloque</MenuItem>
                      </TextField>
                    </Stack>

                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Permissions par onglet</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Le role <strong>gestionnaire</strong> peut agir dans les modules choisis. Le role <strong>lecteur</strong> peut seulement consulter les modules choisis.
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {ALL_MODULE_PERMISSIONS.map((permission) => {
                          const isSelected = secondaryUserForm.permissions.includes(permission);
                          const isLocked = permission === 'dashboard';

                          return (
                            <Chip
                              key={permission}
                              label={MODULE_PERMISSION_LABELS[permission]}
                              color={isSelected ? 'primary' : 'default'}
                              variant={isSelected ? 'filled' : 'outlined'}
                              onClick={isLocked ? undefined : () => handleTogglePermission(permission)}
                              icon={isLocked ? <LockPersonRounded /> : undefined}
                              sx={{ cursor: isLocked ? 'default' : 'pointer' }}
                            />
                          );
                        })}
                      </Stack>
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Button
                        variant="contained"
                        startIcon={<SaveRounded />}
                        onClick={handleSaveSecondaryUser}
                        disabled={isSavingSecondaryUser}
                      >
                        {isSavingSecondaryUser
                          ? 'Enregistrement...'
                          : isEditingSecondaryUser
                            ? "Mettre a jour l'utilisateur"
                            : "Creer l'utilisateur"}
                      </Button>
                      <Button variant="outlined" onClick={handleResetSecondaryUserForm} disabled={isSavingSecondaryUser}>
                        Reinitialiser
                      </Button>
                    </Stack>
                  </Stack>

                  <Stack spacing={1.5} sx={{ width: { xs: '100%', xl: 360 }, minWidth: { xs: '100%', xl: 360 } }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Utilisateurs secondaires
                    </Typography>
                    {loadingSecondaryUsers ? (
                      <Alert severity="info">Chargement des utilisateurs...</Alert>
                    ) : secondaryUsers.length === 0 ? (
                      <Alert severity="info">Aucun utilisateur secondaire n&apos;a encore ete cree pour cette eglise.</Alert>
                    ) : (
                      secondaryUsers.map((user) => {
                        const permissions = normalizePermissions(parsePermissions(user.permissionsUtilisateur));
                        return (
                          <Card key={user.idUtilisateur} variant="outlined" sx={{ borderRadius: 3 }}>
                            <CardContent>
                              <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                  <Box>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                      {user.prenomUtilisateur || 'Utilisateur'} {user.nomUtilisateur}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {user.email || 'Email non renseigne'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {user.telephoneUtilisateur || 'Telephone non renseigne'}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    size="small"
                                    color={Number(user.actifUtilisateur || 1) === 1 ? 'success' : 'default'}
                                    label={Number(user.actifUtilisateur || 1) === 1 ? 'Actif' : 'Bloque'}
                                  />
                                </Stack>

                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                  <Chip
                                    size="small"
                                    color={getUserRole(user) === 'lecteur' ? 'warning' : 'primary'}
                                    label={getUserRole(user) === 'lecteur' ? 'Lecteur' : 'Gestionnaire'}
                                  />
                                  {permissions.map((permission) => (
                                    <Chip
                                      key={`${user.idUtilisateur}${permission}`}
                                      size="small"
                                      variant="outlined"
                                      label={MODULE_PERMISSION_LABELS[permission]}
                                    />
                                  ))}
                                </Stack>

                                <Stack direction="row" spacing={1}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<EditRounded />}
                                    onClick={() => handleEditSecondaryUser(user)}
                                  >
                                    Modifier
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<LockResetRounded />}
                                    onClick={() => handleOpenResetSecondaryPassword(user)}
                                  >
                                    Mot de passe
                                  </Button>
                                  <Button
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                    startIcon={<DeleteRounded />}
                                    onClick={() => setDeletingSecondaryUser(user)}
                                  >
                                    Supprimer
                                  </Button>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}

        {!canManageSecondaryUsers && !isFixedDesktopSuperAdmin && (
          <Alert severity="info">
            La creation des utilisateurs secondaires est reservee a l&apos;administrateur principal de cette eglise.
          </Alert>
        )}

        <Divider />

        <Card>
          <CardHeader
            avatar={<StorageRounded color="primary" />}
            title="Connexion et URL navigateur"
            subheader="Cette adresse pointe vers la vraie interface de l'application accessible depuis ton telephone."
          />
          <CardContent>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="stretch">
              <Stack spacing={3} sx={{ flex: 1, minWidth: 0 }}>
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

                {desktopAlert && <Alert severity={desktopAlert.severity}>{desktopAlert.message}</Alert>}

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

        <ConfirmDialog
          open={Boolean(deletingSecondaryUser)}
          title="Supprimer cet utilisateur secondaire"
          message={`L'utilisateur ${deletingSecondaryUser?.nomUtilisateur || ''} sera retire de cette eglise.`}
          confirmText="Supprimer"
          loading={isDeletingSecondaryUser}
          onConfirm={handleConfirmDeleteSecondaryUser}
          onClose={() => setDeletingSecondaryUser(null)}
        />

        <Dialog
          open={Boolean(resetPasswordUser)}
          onClose={handleCloseResetSecondaryPassword}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Reinitialiser le mot de passe</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Alert severity="info">
                Cette action est visible uniquement par l&apos;administrateur principal. Elle remplace le mot de passe de{' '}
                <strong>
                  {resetPasswordUser?.prenomUtilisateur || 'cet utilisateur'} {resetPasswordUser?.nomUtilisateur || ''}
                </strong>
                .
              </Alert>
              <TextField
                autoFocus
                fullWidth
                type="password"
                label="Nouveau mot de passe"
                value={resetPasswordForm.password}
                onChange={(event) =>
                  setResetPasswordForm((prev) => ({ ...prev, password: event.target.value }))
                }
              />
              <TextField
                fullWidth
                type="password"
                label="Confirmer le mot de passe"
                value={resetPasswordForm.confirmPassword}
                error={Boolean(
                  resetPasswordForm.confirmPassword
                  && resetPasswordForm.password !== resetPasswordForm.confirmPassword
                )}
                helperText={
                  resetPasswordForm.confirmPassword
                  && resetPasswordForm.password !== resetPasswordForm.confirmPassword
                    ? 'La confirmation ne correspond pas.'
                    : ' '
                }
                onChange={(event) =>
                  setResetPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseResetSecondaryPassword} disabled={isResettingSecondaryPassword}>
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleResetSecondaryPassword}
              disabled={isResettingSecondaryPassword}
            >
              {isResettingSecondaryPassword ? 'Reinitialisation...' : 'Reinitialiser'}
            </Button>
          </DialogActions>
        </Dialog>

        <NotificationComponent />
      </Stack>
    </DashboardContent>
  );
}









