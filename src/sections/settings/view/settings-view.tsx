import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  AccountCircleRounded,
  AutorenewRounded,
  ChurchRounded,
  ContentCopyRounded,
  DeleteRounded,
  EditRounded,
  FileDownloadRounded,
  GroupAddRounded,
  LanguageRounded,
  LaunchRounded,
  LinkOffRounded,
  LinkRounded,
  LockPersonRounded,
  LockResetRounded,
  MenuBookRounded,
  SaveRounded,
  StorageRounded,
  SystemUpdateRounded,
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
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ConfirmDialog from 'src/components/alert/confirmDialog';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import { normalizeDashboardVerseMode, type DashboardVerseMode } from 'src/data/daily-verses';
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
  clearActionJournalEntries,
  getActionJournalEntries,
  type ActionJournalEntry,
} from 'src/utils/action-journal';
import {
  ALL_MODULE_PERMISSIONS,
  MODULE_PERMISSION_LABELS,
  getScopeUserIdFromUser,
  getUserRole,
  parsePermissions,
  stringifyPermissions,
} from 'src/utils/access-control';
import { buildLinkedBrowserSignInUrl } from 'src/utils/browser-link';
import { sanitizeSensitiveData } from 'src/utils/sensitive-data';
import { subscribeToCommunauteEvent } from 'src/utils/socket-client';
import { fDate } from 'src/utils/format-time';

type ConnectionMode = 'local' | 'online';

type TunnelStatus = {
  active: boolean;
  expiresAt: string | null;
  localPort: number | null;
  requestedSubdomain: string;
  startedAt: string | null;
  url: string;
};

const emptyTunnelStatus: TunnelStatus = {
  active: false,
  expiresAt: null,
  localPort: null,
  requestedSubdomain: '',
  startedAt: null,
  url: '',
};

type DesktopUpdateStatus = {
  supported: boolean;
  checking: boolean;
  available: boolean;
  downloaded: boolean;
  currentVersion: string;
  latestVersion?: string;
  message?: string;
  error?: string;
  progress?: {
    percent?: number;
    transferred?: number;
    total?: number;
  } | null;
  lastCheckedAt?: string;
};

type ProfileFormState = {
  logoUtilisateur: string;
  logoEglise: string;
  nomTemple: string;
  nomEgliseCourt: string;
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
  modeVersetDashboard: DashboardVerseMode;
  versetDashboardReference: string;
  versetDashboardTexte: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const emptyProfileForm: ProfileFormState = {
  logoUtilisateur: '',
  logoEglise: '',
  nomTemple: '',
  nomEgliseCourt: '',
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
  modeVersetDashboard: 'daily',
  versetDashboardReference: '',
  versetDashboardTexte: '',
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

type DesktopUnlockCode = {
  id: string;
  code: string;
  label: string;
  durationDays: number;
  createdAt: string;
};

const emptyResetSecondaryPasswordForm: ResetSecondaryPasswordFormState = {
  password: '',
  confirmPassword: '',
};

const buildSharedChurchProfileData = (
  source: Partial<ProfileFormState & IUtilisateur>
): Partial<IUtilisateur> => ({
  logoEglise: source.logoEglise || '',
  nomTemple: source.nomTemple || '',
  nomEgliseCourt: source.nomEgliseCourt || '',
  lieuEglise: source.lieuEglise || '',
  telephoneSecretariatEglise: source.telephoneSecretariatEglise || '',
  pasteurPrincipal: source.pasteurPrincipal || '',
  pasteurSecondaire: source.pasteurSecondaire || '',
  pasteurTroisieme: source.pasteurTroisieme || '',
  telephonePasteurPrincipal: source.telephonePasteurPrincipal || '',
  telephonePasteurSecondaire: source.telephonePasteurSecondaire || '',
  telephonePasteurTroisieme: source.telephonePasteurTroisieme || '',
  capaciteAccueilEglise: source.capaciteAccueilEglise || '',
  nombreCultesDimanche: source.nombreCultesDimanche || '',
  emailEglise: source.emailEglise || '',
  boitePostaleEglise: source.boitePostaleEglise || '',
  dateCreationEglise: source.dateCreationEglise || '',
  nombrePasteursEglise: source.nombrePasteursEglise || '',
  nombreAnciensEglise: source.nombreAnciensEglise || '',
  nombreDiacresEglise: source.nombreDiacresEglise || '',
  modeVersetDashboard: normalizeDashboardVerseMode(source.modeVersetDashboard),
  versetDashboardReference: source.versetDashboardReference || '',
  versetDashboardTexte: source.versetDashboardTexte || '',
});

const buildSecondaryUserFormFromEntity = (user: IUtilisateur): SecondaryUserFormState => ({
  idUtilisateur: Number(user.idUtilisateur || 0),
  nomUtilisateur: user.nomUtilisateur || '',
  prenomUtilisateur: user.prenomUtilisateur || '',
  telephoneUtilisateur: user.telephoneUtilisateur || '',
  email: user.email || '',
  password: '',
  confirmPassword: '',
  roleUtilisateur: getUserRole(user) === 'lecteur' ? 'lecteur' : 'gestionnaire',
  permissions: Array.from(
    new Set(['dashboard', ...parsePermissions(user.permissionsUtilisateur)])
  ) as ModulePermissionKey[],
  actifUtilisateur: Number(user.actifUtilisateur || 1),
});

const normalizePermissions = (permissions: ModulePermissionKey[]): ModulePermissionKey[] =>
  Array.from(
    new Set(['dashboard', ...permissions.filter((item) => ALL_MODULE_PERMISSIONS.includes(item))])
  ) as ModulePermissionKey[];

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
const buildBrowserUrlFromIp = (ipAddress: string, port = 49300): string =>
  `http://${ipAddress}:${port}`;
const getCurrentBrowserOrigin = (): string => normalizeBrowserUrl(window.location.origin);
const buildLocalApiUrlFromCurrentHost = (): string => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:49300';
  }

  return buildBrowserUrlFromIp(window.location.hostname);
};

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

const getChurchLogoPreviewUrl = (
  value?: string,
  cacheKey?: string | number
): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (/^(data:|https?:|blob:|file:)/i.test(value)) {
    return value;
  }

  return buildChurchLogoUrl(value, cacheKey);
};

const sanitizeFileNamePart = (value: string): string =>
  (value || 'eglise')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'eglise';

const buildDesktopUnlockCodesText = (codes: DesktopUnlockCode[], churchName: string): string =>
  [
    'Codes de déblocage offline - Ma Communauté',
    `Église: ${churchName || '-'}`,
    `Généré le : ${new Date().toLocaleString('fr-FR')}`,
    '',
    'Important:',
    '- Chaque code est a usage unique.',
    '- Donne un seul code au client quand il faut renouveler son accès.',
    "- Après utilisation, le même code ne pourra plus débloquer l'application.",
    '',
    ...codes.map(
      (code, index) =>
        `${String(index + 1).padStart(2, '0')}. ${code.code} - ${code.label} - ${code.durationDays} jours`
    ),
    '',
  ].join('\n');

const downloadDesktopUnlockCodesFile = (
  codes: DesktopUnlockCode[],
  churchName: string,
  suffix: string
): void => {
  const fileContent = buildDesktopUnlockCodesText(codes, churchName);
  const fileName = `codes-deblocage-${sanitizeFileNamePart(churchName)}-${suffix}.txt`;
  const fileBlob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const fileUrl = URL.createObjectURL(fileBlob);
  const link = document.createElement('a');

  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(fileUrl);
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
  const utilisateurData = useSelector(
    (state: IReduxState) => state.authentification.utilisateurData
  );
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
  const [tunnelStatus, setTunnelStatus] = useState<TunnelStatus>(emptyTunnelStatus);
  const [isTunnelLoading, setIsTunnelLoading] = useState(false);
  const [extendDays, setExtendDays] = useState('30');
  const [unlockPassword, setUnlockPassword] = useState('');
  const [isExportingUnlockCodes, setIsExportingUnlockCodes] = useState(false);
  const [isGeneratingUnlockCodes, setIsGeneratingUnlockCodes] = useState(false);
  const [isRebindingMachine, setIsRebindingMachine] = useState(false);
  const [isCreatingSqliteBackup, setIsCreatingSqliteBackup] = useState(false);
  const [isOpeningSqliteFolder, setIsOpeningSqliteFolder] = useState(false);
  const [isRestoringSqliteBackup, setIsRestoringSqliteBackup] = useState(false);
  const [desktopUpdateStatus, setDesktopUpdateStatus] = useState<DesktopUpdateStatus | null>(null);
  const [isCheckingDesktopUpdate, setIsCheckingDesktopUpdate] = useState(false);
  const [isInstallingDesktopUpdate, setIsInstallingDesktopUpdate] = useState(false);
  const [actionJournalEntries, setActionJournalEntries] = useState<ActionJournalEntry[]>(() =>
    getActionJournalEntries()
  );
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm);
  const [secondaryUsers, setSecondaryUsers] = useState<IUtilisateur[]>([]);
  const [loadingSecondaryUsers, setLoadingSecondaryUsers] = useState(false);
  const [secondaryUserForm, setSecondaryUserForm] =
    useState<SecondaryUserFormState>(emptySecondaryUserForm);
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

  const sessionUser = useMemo(
    () => ({ ...utilisateurData, ...userConnected }),
    [userConnected, utilisateurData]
  );
  const desktopUnlockCodesChurchName = String(
    sessionUser?.nomEgliseCourt ||
      profileForm.nomEgliseCourt ||
      sessionUser?.nomTemple ||
      profileForm.nomTemple ||
      currentUsername ||
      'eglise'
  );
  const currentRole = useMemo(() => getUserRole(sessionUser), [sessionUser]);
  const currentSessionUserId = Number(sessionUser?.idUtilisateur || 0);
  const currentAccountId = getScopeUserIdFromUser(sessionUser) || 0;
  const isSecondarySessionUser = Number(sessionUser?.idUtilisateurParent || 0) > 0;
  const canManageSecondaryUsers =
    currentRole === 'admin' &&
    currentSessionUserId > 0 &&
    !isSecondarySessionUser &&
    currentAccountId > 0;
  const isUrlReady = useMemo(() => isValidHttpUrl(browserUrl), [browserUrl]);
  const tunnelExpiresAtLabel = useMemo(
    () => (tunnelStatus.expiresAt ? new Date(tunnelStatus.expiresAt).toLocaleString('fr-FR') : ''),
    [tunnelStatus.expiresAt]
  );
  const desktopLicenseExpiresAt = applicationState.desktopSecurityExpiresAt;
  const desktopSecurityMessage = applicationState.desktopSecurityMessage;
  const isDesktopBlocked = applicationState.desktopSecurityBlocked;
  const desktopDaysRemaining = applicationState.desktopSecurityDaysRemaining;
  const isDesktopMachineCurrent = applicationState.desktopSecurityMachineCurrent;
  const desktopMachineDescription = applicationState.desktopSecurityMachineDescription;
  const desktopCurrentMachineDescription =
    applicationState.desktopSecurityCurrentMachineDescription;
  const isFixedDesktopSuperAdmin =
    Number(userConnected?.idUtilisateur ?? utilisateurData?.idUtilisateur ?? -1) === 0;
  const canManageDesktopUpdates = isDesktopApp && (isFixedDesktopSuperAdmin || canManageSecondaryUsers);
  const canManageDesktopBackups = isDesktopApp && (isFixedDesktopSuperAdmin || canManageSecondaryUsers);
  const canInspectDesktopLicense = isDesktopApp || isFixedDesktopSuperAdmin;
  const desktopCountdown = useMemo(
    () => getDesktopCountdown(desktopLicenseExpiresAt, countdownNow),
    [countdownNow, desktopLicenseExpiresAt]
  );
  const churchLogoPreviewUrl = useMemo(
    () => getChurchLogoPreviewUrl(profileForm.logoEglise, sessionUser?.__syncAt),
    [profileForm.logoEglise, sessionUser?.__syncAt]
  );
  const secondaryUserCount = secondaryUsers.length;
  const isEditingSecondaryUser = Boolean(secondaryUserForm.idUtilisateur);
  const desktopUpdateProgress = Math.round(Number(desktopUpdateStatus?.progress?.percent || 0));
  const desktopUpdateChip = desktopUpdateStatus?.checking
    ? { color: 'info' as const, label: 'Recherche...' }
    : desktopUpdateStatus?.downloaded
      ? { color: 'success' as const, label: 'Prête à installer' }
      : desktopUpdateStatus?.available
        ? { color: 'warning' as const, label: 'Nouvelle version' }
        : desktopUpdateStatus?.supported === false
          ? { color: 'default' as const, label: 'Non disponible' }
          : { color: 'success' as const, label: 'À jour' };

  const desktopAlert = useMemo(() => {
    if (isDesktopBlocked) {
      return {
        severity: 'error',
        message:
          desktopSecurityMessage ||
          "L'application desktop est actuellement bloquée. Contacte le développeur pour renouveler l'accès.",
      } as const;
    }

    if (desktopDaysRemaining <= 1) {
      return {
        severity: 'warning',
        message: `L'application sera bloquée dans ${desktopDaysRemaining || 1} jour. Veuillez contacter le developpeur.`,
      } as const;
    }

    if (desktopDaysRemaining <= 3) {
      return {
        severity: 'warning',
        message: `L'application sera bloquée dans ${desktopDaysRemaining} jours. Veuillez contacter le developpeur.`,
      } as const;
    }

    if (desktopDaysRemaining <= 7) {
      return {
        severity: 'info',
        message: `L'application sera bloquée dans ${desktopDaysRemaining} jours. Pense a contacter le developpeur pour eviter une interruption.`,
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
      nomEgliseCourt: source?.nomEgliseCourt || '',
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
      modeVersetDashboard: normalizeDashboardVerseMode(source?.modeVersetDashboard),
      versetDashboardReference: source?.versetDashboardReference || '',
      versetDashboardTexte: source?.versetDashboardTexte || '',
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
      setSecondaryUsers(sanitizeSensitiveData(Array.isArray(response?.data) ? response.data : []));
    } catch (error: any) {
      showNotification(
        error?.message || 'Impossible de charger les utilisateurs secondaires.',
        'error'
      );
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
          machineBinding: status.machineBinding,
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
          const localApiUrl = buildLocalApiUrlFromCurrentHost();
          setBrowserUrlInput(localApiUrl);
          dispatch(setServerUrl(localApiUrl));
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

  const refreshTunnelStatus = useCallback(async () => {
    try {
      const response = await apiClient.getTunnelStatus();
      setTunnelStatus(response?.data || emptyTunnelStatus);
    } catch (error) {
      setTunnelStatus(emptyTunnelStatus);
    }
  }, []);

  useEffect(() => {
    detectPreferredBrowserUrl();
    refreshDesktopSecurityStatus();
    refreshTunnelStatus();
  }, [detectPreferredBrowserUrl, refreshDesktopSecurityStatus, refreshTunnelStatus]);

  useEffect(() => {
    if (!isDesktopApp || !(window as any)?.desktopUpdater) {
      return undefined;
    }

    const updater = (window as any).desktopUpdater;

    updater
      .getStatus()
      .then((status: DesktopUpdateStatus) => {
        setDesktopUpdateStatus(status);
      })
      .catch(() => {
        setDesktopUpdateStatus({
          supported: false,
          checking: false,
          available: false,
          downloaded: false,
          currentVersion: '',
          message: 'Impossible de lire le statut des mises à jour.',
        });
      });

    if (!updater.onStatus) {
      return undefined;
    }

    return updater.onStatus((status: DesktopUpdateStatus) => {
      setDesktopUpdateStatus(status);
    });
  }, [isDesktopApp]);

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
    const nextConnectionMode = isDesktopApp ? 'local' : connectionMode;

    if (!isValidHttpUrl(normalizedUrl)) {
      showNotification(
        'Veuillez renseigner une URL valide du type http://192.168.1.25:49300',
        'warning'
      );
      return;
    }

    dispatch(setServerUrl(normalizedUrl));
    dispatch(setConnectionMode(nextConnectionMode));
    showNotification('Paramètres enregistrés avec succès', 'success');
  }, [browserUrl, connectionMode, dispatch, isDesktopApp, showNotification]);

  const handleOpenInBrowser = useCallback(async () => {
    const normalizedUrl = normalizeBrowserUrl(browserUrl);

    if (!isValidHttpUrl(normalizedUrl)) {
      showNotification('Veuillez enregistrer une URL navigateur valide avant ouverture', 'warning');
      return;
    }

    try {
      await openApplicationUrlInBrowser(
        buildLinkedBrowserSignInUrl(normalizedUrl, {
          username: currentUsername,
          accountId: currentAccountId,
          churchName:
            profileForm.nomEgliseCourt ||
            profileForm.nomTemple ||
            String(sessionUser?.nomEgliseCourt || sessionUser?.nomTemple || ''),
        })
      );
    } catch (error: any) {
      showNotification(error?.message || "Impossible d'ouvrir le navigateur", 'error');
    }
  }, [
    browserUrl,
    currentAccountId,
    currentUsername,
    profileForm.nomEgliseCourt,
    profileForm.nomTemple,
    sessionUser,
    showNotification,
  ]);

  const handleStartTunnel = useCallback(async () => {
    try {
      setIsTunnelLoading(true);
      const response = await apiClient.startTunnel({
        contactEglise:
          profileForm.telephoneSecretariatEglise ||
          profileForm.telephoneUtilisateur ||
          String(
            sessionUser?.telephoneSecretariatEglise || sessionUser?.telephoneUtilisateur || ''
          ),
        nomTemple:
          profileForm.nomEgliseCourt ||
          profileForm.nomTemple ||
          String(sessionUser?.nomEgliseCourt || sessionUser?.nomTemple || ''),
        ttlMinutes: 120,
      });

      setTunnelStatus(response?.data || emptyTunnelStatus);
      showNotification('Tunnel actif. Le lien est prêt à être partagé.', 'success');
    } catch (error: any) {
      showNotification(error?.message || "Impossible d'activer le tunnel.", 'error');
    } finally {
      setIsTunnelLoading(false);
    }
  }, [
    profileForm.nomTemple,
    profileForm.nomEgliseCourt,
    profileForm.telephoneSecretariatEglise,
    profileForm.telephoneUtilisateur,
    sessionUser,
    showNotification,
  ]);

  const handleStopTunnel = useCallback(async () => {
    try {
      setIsTunnelLoading(true);
      const response = await apiClient.stopTunnel();
      setTunnelStatus(response?.data || emptyTunnelStatus);
      showNotification('Tunnel désactivé.', 'success');
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de désactiver le tunnel.', 'error');
    } finally {
      setIsTunnelLoading(false);
    }
  }, [showNotification]);

  const handleCopyTunnelLink = useCallback(async () => {
    if (!tunnelStatus.url) {
      showNotification('Aucun lien tunnel actif à copier.', 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(tunnelStatus.url);
      showNotification('Lien tunnel copié.', 'success');
    } catch (error) {
      showNotification(
        'Impossible de copier automatiquement le lien. Sélectionne-le manuellement.',
        'warning'
      );
    }
  }, [showNotification, tunnelStatus.url]);

  const handleCheckDesktopUpdate = useCallback(async () => {
    const updater = (window as any)?.desktopUpdater;

    if (!updater?.check) {
      showNotification("La mise à jour automatique n'est pas disponible dans cette fenêtre.", 'info');
      return;
    }

    try {
      setIsCheckingDesktopUpdate(true);
      const status = (await updater.check()) as DesktopUpdateStatus;
      setDesktopUpdateStatus(status);

      if (status.downloaded) {
        showNotification('Mise à jour téléchargée. Tu peux redémarrer pour installer.', 'success');
      } else if (status.available) {
        showNotification('Nouvelle version trouvée. Téléchargement en cours.', 'info');
      } else if (status.supported === false) {
        showNotification(
          status.message || "La mise à jour automatique sera active dans l'exécutable installé.",
          'info'
        );
      } else {
        showNotification('Cette application est déjà à jour.', 'success');
      }
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de vérifier les mises à jour.', 'error');
    } finally {
      setIsCheckingDesktopUpdate(false);
    }
  }, [showNotification]);

  const handleInstallDesktopUpdate = useCallback(async () => {
    const updater = (window as any)?.desktopUpdater;

    if (!updater?.install) {
      showNotification("La mise à jour automatique n'est pas disponible dans cette fenêtre.", 'info');
      return;
    }

    try {
      setIsInstallingDesktopUpdate(true);
      const result = await updater.install();

      if (!result?.success) {
        throw new Error(result?.error || "Aucune mise à jour n'est prête à être installée.");
      }

      showNotification("Installation de la mise à jour après redémarrage de l'application.", 'info');
    } catch (error: any) {
      showNotification(error?.message || "Impossible d'installer la mise à jour.", 'error');
      setIsInstallingDesktopUpdate(false);
    }
  }, [showNotification]);

  const handleUnlockDesktop = useCallback(async () => {
    if (!currentUsername || !isFixedDesktopSuperAdmin) {
      showNotification("Seul le superadmin peut débloquer l'application", 'warning');
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
          machineBinding: status.machineBinding,
        })
      );

      setUnlockPassword('');
      showNotification('Application desktop débloquée avec succès', 'success');
    } catch (error: any) {
      showNotification(error?.message || "Impossible de débloquer l'application", 'error');
    }
  }, [
    currentUsername,
    dispatch,
    extendDays,
    isFixedDesktopSuperAdmin,
    showNotification,
    unlockPassword,
  ]);

  const handleRebindMachine = useCallback(async () => {
    if (!currentUsername || !isFixedDesktopSuperAdmin) {
      showNotification('Seul le superadmin peut rattacher la licence à ce poste.', 'warning');
      return;
    }

    if (!unlockPassword.trim()) {
      showNotification('Le mot de passe superadmin est requis', 'warning');
      return;
    }

    try {
      setIsRebindingMachine(true);
      const response = await apiClient.rebindDesktopLicenseMachine({
        nomUtilisateur: currentUsername,
        password: unlockPassword,
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

      showNotification('Licence rattachée à ce poste avec succès.', 'success');
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de rattacher la licence à ce poste.', 'error');
    } finally {
      setIsRebindingMachine(false);
    }
  }, [currentUsername, dispatch, isFixedDesktopSuperAdmin, showNotification, unlockPassword]);

  const handleExportInitialUnlockCodes = useCallback(async () => {
    if (!currentUsername || !isFixedDesktopSuperAdmin) {
      showNotification('Seul le superadmin peut exporter les codes de déblocage.', 'warning');
      return;
    }

    if (!unlockPassword.trim()) {
      showNotification('Le mot de passe superadmin est requis', 'warning');
      return;
    }

    try {
      setIsExportingUnlockCodes(true);
      const response = await apiClient.exportDesktopUnlockCodes({
        nomUtilisateur: currentUsername,
        password: unlockPassword,
      });
      const codes = (response?.data?.codes || []) as DesktopUnlockCode[];

      if (codes.length === 0) {
        throw new Error('Aucun code à exporter.');
      }

      downloadDesktopUnlockCodesFile(codes, desktopUnlockCodesChurchName, 'initial');
      showNotification(`${codes.length} code(s) de déblocage exporté(s).`, 'success');
    } catch (error: any) {
      showNotification(error?.message || "Impossible d'exporter les codes de déblocage.", 'error');
    } finally {
      setIsExportingUnlockCodes(false);
    }
  }, [
    currentUsername,
    desktopUnlockCodesChurchName,
    isFixedDesktopSuperAdmin,
    showNotification,
    unlockPassword,
  ]);

  const handleGenerateUnlockCodes = useCallback(async () => {
    if (!currentUsername || !isFixedDesktopSuperAdmin) {
      showNotification('Seul le superadmin peut générer les codes de déblocage.', 'warning');
      return;
    }

    if (!unlockPassword.trim()) {
      showNotification('Le mot de passe superadmin est requis', 'warning');
      return;
    }

    try {
      setIsGeneratingUnlockCodes(true);
      const response = await apiClient.generateDesktopUnlockCodes({
        nomUtilisateur: currentUsername,
        password: unlockPassword,
      });
      const codes = (response?.data?.codes || []) as DesktopUnlockCode[];

      if (codes.length === 0) {
        throw new Error('Aucun code généré.');
      }

      downloadDesktopUnlockCodesFile(codes, desktopUnlockCodesChurchName, 'nouveau-pack');
      showNotification(`${codes.length} nouveau(x) code(s) généré(s) et exporté(s).`, 'success');
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de générer les codes de déblocage.', 'error');
    } finally {
      setIsGeneratingUnlockCodes(false);
    }
  }, [
    currentUsername,
    desktopUnlockCodesChurchName,
    isFixedDesktopSuperAdmin,
    showNotification,
    unlockPassword,
  ]);

  const handleCreateSqliteBackup = useCallback(async () => {
    const backupApi = (window as any)?.desktopBackup;

    if (!canManageDesktopBackups || !backupApi?.create) {
      showNotification('La sauvegarde locale est disponible uniquement dans l’application desktop.', 'warning');
      return;
    }

    try {
      setIsCreatingSqliteBackup(true);
      const response = await backupApi.create();

      if (response?.canceled) {
        return;
      }

      if (!response?.success) {
        showNotification(response?.error || 'Impossible de créer la sauvegarde locale.', 'error');
        return;
      }

      showNotification(
        'Sauvegarde créée avec succès. Conservez ce fichier sur une clé USB ou un disque externe.',
        'success'
      );
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de créer la sauvegarde locale.', 'error');
    } finally {
      setIsCreatingSqliteBackup(false);
    }
  }, [canManageDesktopBackups, showNotification]);

  const handleOpenSqliteDataFolder = useCallback(async () => {
    const backupApi = (window as any)?.desktopBackup;

    if (!isDesktopApp || !backupApi?.openFolder) {
      showNotification('Le dossier des données locales est disponible uniquement dans l’application desktop.', 'warning');
      return;
    }

    try {
      setIsOpeningSqliteFolder(true);
      const response = await backupApi.openFolder();

      if (!response?.success) {
        showNotification(response?.error || 'Impossible d’ouvrir le dossier des données.', 'error');
      }
    } catch (error: any) {
      showNotification(error?.message || 'Impossible d’ouvrir le dossier des données.', 'error');
    } finally {
      setIsOpeningSqliteFolder(false);
    }
  }, [isDesktopApp, showNotification]);

  const handleRestoreSqliteBackup = useCallback(
    async () => {
      const backupApi = (window as any)?.desktopBackup;

      if (!currentUsername || !canManageDesktopBackups) {
        showNotification('Seul un administrateur principal peut restaurer une sauvegarde SQLite.', 'warning');
        return;
      }

      if (!backupApi?.restore) {
        showNotification(
          "La restauration locale est disponible uniquement dans l'application desktop.",
          'warning'
        );
        return;
      }

      const confirmed = window.confirm(
        'Cette action va remplacer les bases SQLite locales par le contenu de la sauvegarde. ' +
          'Une sauvegarde de sécurité sera créée avant la restauration. Continuer ?'
      );

      if (!confirmed) {
        return;
      }

      try {
        setIsRestoringSqliteBackup(true);
        const response = await backupApi.restore();

        if (response?.canceled) {
          return;
        }

        if (!response?.success) {
          showNotification(response?.error || 'Impossible de restaurer cette sauvegarde SQLite.', 'error');
          return;
        }

        const restoredCount = Number(response?.databaseCount || 0);

        showNotification(
          `Restauration terminée : ${restoredCount} base(s) restaurée(s). Redémarrez l'application pour recharger les données.`,
          'success'
        );
      } catch (error: any) {
        showNotification(
          error?.message || 'Impossible de restaurer cette sauvegarde SQLite.',
          'error'
        );
      } finally {
        setIsRestoringSqliteBackup(false);
      }
    },
    [canManageDesktopBackups, currentUsername, showNotification]
  );

  const handleClearActionJournal = useCallback(() => {
    clearActionJournalEntries();
    setActionJournalEntries([]);
    showNotification('Journal d’actions vidé.', 'success');
  }, [showNotification]);

  const handleRefreshActionJournal = useCallback(() => {
    setActionJournalEntries(getActionJournalEntries());
  }, []);

  const handleChangeProfileField = useCallback((field: keyof ProfileFormState, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleChurchLogoUpload = useCallback(
    async (file?: File | null) => {
      if (!file) {
        return;
      }

      try {
        const base64 = await convertFileToBase64DataUrl(file);
        handleChangeProfileField('logoEglise', base64);
        showNotification("Logo de l'église chargé. Enregistre pour le conserver.", 'info');
      } catch (_error) {
        showNotification('Impossible de charger ce logo.', 'error');
      }
    },
    [handleChangeProfileField, showNotification]
  );

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
      showNotification("Le nom de l'église est requis", 'warning');
      return;
    }

    if (
      (profileForm.password || profileForm.confirmPassword) &&
      profileForm.password !== profileForm.confirmPassword
    ) {
      showNotification('La confirmation du nouveau mot de passe ne correspond pas.', 'warning');
      return;
    }

    const payload = {
      ...existingUser,
      ...profileForm,
      idUtilisateur,
    };

    if (profileForm.password.trim()) {
      Object.assign(payload, {
        password: profileForm.password.trim(),
        confirmPassword: profileForm.confirmPassword.trim() || profileForm.password.trim(),
      });
    }

    try {
      setIsSavingProfile(true);
      const response = await apiClient.updateUtilisateur(payload);
      const savedUser = sanitizeSensitiveData(response?.data || payload);
      const sharedChurchProfileData = buildSharedChurchProfileData(savedUser);

      dispatch(setUtilisateurData(savedUser));
      dispatch(setUserConnected(savedUser));
      if (canManageSecondaryUsers && secondaryUsers.length > 0) {
        await Promise.all(
          secondaryUsers
            .filter((secondaryUser) => Number(secondaryUser.idUtilisateur || 0) > 0)
            .map((secondaryUser) =>
              apiClient.post('communaute/modifierutilisateur', {
                ...secondaryUser,
                ...sharedChurchProfileData,
                idUtilisateur: secondaryUser.idUtilisateur,
                idUtilisateurParent: currentAccountId,
                nomUtilisateur: secondaryUser.nomUtilisateur || '',
                prenomUtilisateur: secondaryUser.prenomUtilisateur || '',
                telephoneUtilisateur: secondaryUser.telephoneUtilisateur || '',
                email: secondaryUser.email || '',
                roleUtilisateur:
                  getUserRole(secondaryUser) === 'lecteur' ? 'lecteur' : 'gestionnaire',
                permissionsUtilisateur: stringifyPermissions(
                  normalizePermissions(parsePermissions(secondaryUser.permissionsUtilisateur))
                ),
                actifUtilisateur: Number(secondaryUser.actifUtilisateur || 1),
              })
            )
        );

        await loadSecondaryUsers();
      }

      setProfileForm((prev) => ({
        ...prev,
        ...savedUser,
        password: '',
        confirmPassword: '',
      }));
      showNotification("Informations de l'église enregistrées avec succès", 'success');
    } catch (error: any) {
      showNotification(
        error?.message || "Impossible d'enregistrer les informations de l'église",
        'error'
      );
    } finally {
      setIsSavingProfile(false);
    }
  }, [
    canManageSecondaryUsers,
    currentAccountId,
    dispatch,
    loadSecondaryUsers,
    profileForm,
    secondaryUsers,
    showNotification,
    userConnected,
    utilisateurData,
  ]);

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
      showNotification("Cette action est réservée à l'administrateur principal.", 'warning');
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
      showNotification('Le maximum de 5 utilisateurs secondaires a déjà été atteint.', 'warning');
      return;
    }

    if (!isEditingSecondaryUser && !secondaryUserForm.password.trim()) {
      showNotification('Le mot de passe du nouvel utilisateur est requis.', 'warning');
      return;
    }

    if (
      (secondaryUserForm.password || secondaryUserForm.confirmPassword) &&
      secondaryUserForm.password !== secondaryUserForm.confirmPassword
    ) {
      showNotification('La confirmation du mot de passe ne correspond pas.', 'warning');
      return;
    }

    const sharedChurchData = buildSharedChurchProfileData(sessionUser);

    const payload = {
      ...sharedChurchData,
      logoUtilisateur: '',
      idUtilisateur: secondaryUserForm.idUtilisateur || undefined,
      idUtilisateurParent: currentAccountId,
      nomUtilisateur: secondaryUserForm.nomUtilisateur.trim(),
      prenomUtilisateur: secondaryUserForm.prenomUtilisateur.trim(),
      telephoneUtilisateur: secondaryUserForm.telephoneUtilisateur.trim(),
      email: secondaryUserForm.email.trim(),
      roleUtilisateur: secondaryUserForm.roleUtilisateur,
      permissionsUtilisateur: stringifyPermissions(
        normalizePermissions(secondaryUserForm.permissions)
      ),
      actifUtilisateur: Number(secondaryUserForm.actifUtilisateur || 1),
    };

    if (secondaryUserForm.password.trim()) {
      Object.assign(payload, {
        password: secondaryUserForm.password.trim(),
        confirmPassword:
          secondaryUserForm.confirmPassword.trim() || secondaryUserForm.password.trim(),
      });
    }

    try {
      setIsSavingSecondaryUser(true);
      if (isEditingSecondaryUser && secondaryUserForm.idUtilisateur) {
        await apiClient.post('communaute/modifierutilisateur', payload);
        showNotification('Utilisateur secondaire mis à jour avec succès.', 'success');
      } else {
        await apiClient.post('communaute/ajouterutilisateur', payload);
        showNotification('Utilisateur secondaire créé avec succès.', 'success');
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
    sessionUser,
    showNotification,
  ]);

  const handleResetSecondaryPassword = useCallback(async () => {
    if (!canManageSecondaryUsers) {
      showNotification("Cette action est réservée à l'administrateur principal.", 'warning');
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

    const sharedChurchData = buildSharedChurchProfileData(sessionUser);

    const payload = {
      ...sharedChurchData,
      logoUtilisateur: '',
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
      showNotification('Mot de passe réinitialisé avec succès.', 'success');
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
      showNotification('Utilisateur secondaire supprimé avec succès.', 'success');
      setDeletingSecondaryUser(null);
      await loadSecondaryUsers();
    } catch (error: any) {
      showNotification(error?.message || 'Impossible de supprimer cet utilisateur.', 'error');
    } finally {
      setIsDeletingSecondaryUser(false);
    }
  }, [
    deletingSecondaryUser,
    handleResetSecondaryUserForm,
    loadSecondaryUsers,
    secondaryUserForm.idUtilisateur,
    showNotification,
  ]);

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Paramètres
          </Typography>
          <Typography color="text.secondary">
            Gère ici les informations de ton compte, de ton église et les paramètres techniques de
            l&apos;application.
          </Typography>
        </Box>

        {isFixedDesktopSuperAdmin && (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6">Compte a rebours avant blocage</Typography>
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
                        La licence est arrivee a expiration. Debloque le desktop pour relancer une
                        nouvelle periode.
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
            subheader="Ces données alimentent l'espace compte et les documents générés dans l'application."
          />
          <CardContent>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Nom utilisateur"
                  value={profileForm.nomUtilisateur}
                  onChange={(event) =>
                    handleChangeProfileField('nomUtilisateur', event.target.value)
                  }
                  disabled={isFixedDesktopSuperAdmin}
                  helperText={
                    isFixedDesktopSuperAdmin ? 'Le superadmin fixe se configure cote serveur.' : ''
                  }
                />
                <TextField
                  fullWidth
                  label="Prenom"
                  value={profileForm.prenomUtilisateur}
                  onChange={(event) =>
                    handleChangeProfileField('prenomUtilisateur', event.target.value)
                  }
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={profileForm.telephoneUtilisateur}
                  onChange={(event) =>
                    handleChangeProfileField('telephoneUtilisateur', event.target.value)
                  }
                />
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={profileForm.email}
                  onChange={(event) => handleChangeProfileField('email', event.target.value)}
                  helperText="Cet email servira a recuperer votre mot de passe en cas d'oubli."
                />
              </Stack>

              {isFixedDesktopSuperAdmin ? (
                <Alert severity="info">
                  Les identifiants du superadmin fixe se modifient dans la configuration backend,
                  pas dans le profil.
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
                    onChange={(event) =>
                      handleChangeProfileField('confirmPassword', event.target.value)
                    }
                    error={Boolean(
                      profileForm.confirmPassword &&
                        profileForm.password !== profileForm.confirmPassword
                    )}
                    helperText={
                      profileForm.confirmPassword &&
                      profileForm.password !== profileForm.confirmPassword
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
            title="Informations de l'église"
            subheader="Ces informations sont sauvegardées et pourront être réutilisées dans tous les documents imprimables."
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
                        alt={profileForm.nomTemple || 'Logo église'}
                        variant="rounded"
                        sx={{ width: 132, height: 132, borderRadius: 4, bgcolor: 'grey.100' }}
                      >
                        <ChurchRounded color="primary" sx={{ fontSize: 44 }} />
                      </Avatar>

                      <Stack spacing={0.75} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700} textAlign="center">
                          Logo de l&apos;église
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          Le logo est stocke localement et reutilise automatiquement dans les
                          impressions.
                        </Typography>
                      </Stack>

                      <Stack
                        direction={{ xs: 'column', sm: 'row', lg: 'column' }}
                        spacing={1.5}
                        sx={{ width: '100%' }}
                      >
                        <Button
                          component="label"
                          variant="contained"
                          startIcon={<UploadRounded />}
                          sx={{ width: '100%' }}
                        >
                          Telecharger le logo
                          <input
                            hidden
                            accept="image/*"
                            type="file"
                            onChange={(event) =>
                              handleChurchLogoUpload(event.target.files?.[0] || null)
                            }
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
                      label="Nom de l'église / temple"
                      value={profileForm.nomTemple}
                      onChange={(event) =>
                        handleChangeProfileField('nomTemple', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      label="Nom abrégé de l'église"
                      placeholder="Ex: EEAD ANDOKOI PENIEL"
                      value={profileForm.nomEgliseCourt}
                      onChange={(event) =>
                        handleChangeProfileField('nomEgliseCourt', event.target.value)
                      }
                      // helperText="Ce nom court sera affiche dans l&apos;entete de l&apos;application."
                    />
                    <TextField
                      fullWidth
                      label="Lieu de l'église"
                      value={profileForm.lieuEglise}
                      onChange={(event) =>
                        handleChangeProfileField('lieuEglise', event.target.value)
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Pasteur principal"
                      value={profileForm.pasteurPrincipal}
                      onChange={(event) =>
                        handleChangeProfileField('pasteurPrincipal', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      label="Téléphone pasteur principal"
                      value={profileForm.telephonePasteurPrincipal}
                      onChange={(event) =>
                        handleChangeProfileField('telephonePasteurPrincipal', event.target.value)
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Pasteur secondaire"
                      value={profileForm.pasteurSecondaire}
                      onChange={(event) =>
                        handleChangeProfileField('pasteurSecondaire', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      label="Téléphone pasteur secondaire"
                      value={profileForm.telephonePasteurSecondaire}
                      onChange={(event) =>
                        handleChangeProfileField('telephonePasteurSecondaire', event.target.value)
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="3ème pasteur"
                      value={profileForm.pasteurTroisieme}
                      onChange={(event) =>
                        handleChangeProfileField('pasteurTroisieme', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      label="Téléphone du 3ème pasteur"
                      value={profileForm.telephonePasteurTroisieme}
                      onChange={(event) =>
                        handleChangeProfileField('telephonePasteurTroisieme', event.target.value)
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Téléphone du secrétariat"
                      value={profileForm.telephoneSecretariatEglise}
                      onChange={(event) =>
                        handleChangeProfileField('telephoneSecretariatEglise', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      label="Email de l'église"
                      value={profileForm.emailEglise}
                      onChange={(event) =>
                        handleChangeProfileField('emailEglise', event.target.value)
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Boite postale"
                      value={profileForm.boitePostaleEglise}
                      onChange={(event) =>
                        handleChangeProfileField('boitePostaleEglise', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      type="date"
                      label="Date de creation"
                      value={profileForm.dateCreationEglise}
                      onChange={(event) =>
                        handleChangeProfileField('dateCreationEglise', event.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Capacite estimee de membres"
                      value={profileForm.capaciteAccueilEglise}
                      onChange={(event) =>
                        handleChangeProfileField('capaciteAccueilEglise', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Nombre de cultes par dimanche"
                      value={profileForm.nombreCultesDimanche}
                      onChange={(event) =>
                        handleChangeProfileField('nombreCultesDimanche', event.target.value)
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Nombre de pasteurs"
                      value={profileForm.nombrePasteursEglise}
                      onChange={(event) =>
                        handleChangeProfileField('nombrePasteursEglise', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Nombre d'anciens"
                      value={profileForm.nombreAnciensEglise}
                      onChange={(event) =>
                        handleChangeProfileField('nombreAnciensEglise', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Nombre de diacres"
                      value={profileForm.nombreDiacresEglise}
                      onChange={(event) =>
                        handleChangeProfileField('nombreDiacresEglise', event.target.value)
                      }
                    />
                  </Stack>
                </Stack>
              </Stack>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardHeader
                  avatar={<MenuBookRounded color="primary" />}
                  title="Verset du jour"
                  subheader="Choisis si un verset biblique doit apparaitre sur le tableau de bord."
                />
                <CardContent>
                  <Stack spacing={2.5}>
                    <TextField
                      select
                      fullWidth
                      label="Mode d'affichage"
                      value={profileForm.modeVersetDashboard}
                      onChange={(event) =>
                        handleChangeProfileField(
                          'modeVersetDashboard',
                          normalizeDashboardVerseMode(event.target.value)
                        )
                      }
                    >
                      <MenuItem value="disabled">Ne pas afficher</MenuItem>
                      <MenuItem value="daily">Verset automatique du jour</MenuItem>
                      <MenuItem value="custom">Verset personnalise</MenuItem>
                    </TextField>

                    {profileForm.modeVersetDashboard === 'daily' && (
                      <Alert severity="info">
                        L&apos;application affichera automatiquement un verset local different selon le
                        jour. Aucun acces internet n&apos;est necessaire.
                      </Alert>
                    )}

                    {profileForm.modeVersetDashboard === 'custom' && (
                      <Stack spacing={2}>
                        <TextField
                          fullWidth
                          label="Reference biblique"
                          placeholder="Ex: Jean 3:16"
                          value={profileForm.versetDashboardReference}
                          onChange={(event) =>
                            handleChangeProfileField(
                              'versetDashboardReference',
                              event.target.value
                            )
                          }
                        />
                        <TextField
                          fullWidth
                          multiline
                          minRows={3}
                          label="Texte du verset"
                          placeholder="Ex: Car Dieu a tant aime le monde..."
                          value={profileForm.versetDashboardTexte}
                          onChange={(event) =>
                            handleChangeProfileField('versetDashboardTexte', event.target.value)
                          }
                        />
                        <Alert severity="info">
                          Si le texte du verset personnalise est vide, aucun espace ne sera affiche
                          sur le tableau de bord.
                        </Alert>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              <Alert severity="info">
                Les données enregistrées ici sont réutilisées par le tableau de bord, l&apos;espace
                compte et les états imprimés. Tu peux les modifier à tout moment sans perdre les
                valeurs déjà saisies.
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
              title="Utilisateurs et droits d'accès"
              subheader="Créer jusqu'à 5 utilisateurs secondaires reliés à cette église. Les accès déterminent les onglets visibles, et le rôle lecteur bloque les actions d'écriture."
            />
            <CardContent>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3} alignItems="stretch">
                  <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                    <Alert severity="info">
                      Utilisateurs secondaires créés : {secondaryUserCount} / 5. Le dashboard reste
                      toujours accessible pour éviter de bloquer une session après connexion.
                    </Alert>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        label="Nom utilisateur"
                        value={secondaryUserForm.nomUtilisateur}
                        onChange={(event) =>
                          handleChangeSecondaryUserField('nomUtilisateur', event.target.value)
                        }
                      />
                      <TextField
                        fullWidth
                        label="Prenom"
                        value={secondaryUserForm.prenomUtilisateur}
                        onChange={(event) =>
                          handleChangeSecondaryUserField('prenomUtilisateur', event.target.value)
                        }
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        label="Téléphone"
                        value={secondaryUserForm.telephoneUtilisateur}
                        onChange={(event) =>
                          handleChangeSecondaryUserField('telephoneUtilisateur', event.target.value)
                        }
                      />
                      <TextField
                        fullWidth
                        type="email"
                        label="Email"
                        value={secondaryUserForm.email}
                        onChange={(event) =>
                          handleChangeSecondaryUserField('email', event.target.value)
                        }
                        helperText="Utile si un flux de recuperation par email est active pour cet utilisateur."
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        type="password"
                        label={
                          isEditingSecondaryUser
                            ? 'Nouveau mot de passe (facultatif)'
                            : 'Mot de passe'
                        }
                        value={secondaryUserForm.password}
                        onChange={(event) =>
                          handleChangeSecondaryUserField('password', event.target.value)
                        }
                      />
                      <TextField
                        fullWidth
                        type="password"
                        label={
                          isEditingSecondaryUser
                            ? 'Confirmer le nouveau mot de passe'
                            : 'Confirmer le mot de passe'
                        }
                        value={secondaryUserForm.confirmPassword}
                        onChange={(event) =>
                          handleChangeSecondaryUserField('confirmPassword', event.target.value)
                        }
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        select
                        fullWidth
                        label="Role"
                        value={secondaryUserForm.roleUtilisateur}
                        onChange={(event) =>
                          handleChangeSecondaryUserField('roleUtilisateur', event.target.value)
                        }
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
                        onChange={(event) =>
                          handleChangeSecondaryUserField(
                            'actifUtilisateur',
                            Number(event.target.value)
                          )
                        }
                      >
                        <MenuItem value="1">Actif</MenuItem>
                        <MenuItem value="0">Bloque</MenuItem>
                      </TextField>
                    </Stack>

                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Permissions par onglet</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Le rôle <strong>gestionnaire</strong> peut agir dans les modules choisis. Le
                        rôle <strong>lecteur</strong> peut seulement consulter les modules choisis.
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
                              onClick={
                                isLocked ? undefined : () => handleTogglePermission(permission)
                              }
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
                            ? "Mettre à jour l'utilisateur"
                            : "Créer l'utilisateur"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleResetSecondaryUserForm}
                        disabled={isSavingSecondaryUser}
                      >
                        Reinitialiser
                      </Button>
                    </Stack>
                  </Stack>

                  <Stack
                    spacing={1.5}
                    sx={{ width: { xs: '100%', xl: 360 }, minWidth: { xs: '100%', xl: 360 } }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      Utilisateurs secondaires
                    </Typography>
                    {loadingSecondaryUsers ? (
                      <Alert severity="info">Chargement des utilisateurs...</Alert>
                    ) : secondaryUsers.length === 0 ? (
                      <Alert severity="info">
                        Aucun utilisateur secondaire n&apos;a encore été créé pour cette église.
                      </Alert>
                    ) : (
                      secondaryUsers.map((user) => {
                        const permissions = normalizePermissions(
                          parsePermissions(user.permissionsUtilisateur)
                        );
                        return (
                          <Card
                            key={user.idUtilisateur}
                            variant="outlined"
                            sx={{ borderRadius: 3 }}
                          >
                            <CardContent>
                              <Stack spacing={1.5}>
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="flex-start"
                                  spacing={2}
                                >
                                  <Box>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                      {user.prenomUtilisateur || 'Utilisateur'}{' '}
                                      {user.nomUtilisateur}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {user.email || 'Email non renseigné'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {user.telephoneUtilisateur || 'Téléphone non renseigné'}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    size="small"
                                    color={
                                      Number(user.actifUtilisateur || 1) === 1
                                        ? 'success'
                                        : 'default'
                                    }
                                    label={
                                      Number(user.actifUtilisateur || 1) === 1 ? 'Actif' : 'Bloque'
                                    }
                                  />
                                </Stack>

                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                  <Chip
                                    size="small"
                                    color={getUserRole(user) === 'lecteur' ? 'warning' : 'primary'}
                                    label={
                                      getUserRole(user) === 'lecteur' ? 'Lecteur' : 'Gestionnaire'
                                    }
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
            La création des utilisateurs secondaires est réservée à l&apos;administrateur principal
            de cette église.
          </Alert>
        )}

        <Divider />

        <Card>
          <CardHeader
            avatar={<StorageRounded color="primary" />}
            title="Connexion et URL navigateur"
            subheader="Cette adresse pointe vers la vraie interface de l'application accessible depuis ton téléphone."
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
                  helperText="Adresse détectée automatiquement depuis la machine qui lance l'application."
                  disabled={isDetectingAddress}
                  InputProps={{
                    readOnly: Boolean((window as any)?.desktopNetwork?.getLocalAddress),
                    endAdornment: <LanguageRounded color={isUrlReady ? 'primary' : 'disabled'} />,
                  }}
                />

                <Box>
                  <Chip
                    color={isUrlReady ? 'success' : 'default'}
                    label={isUrlReady ? 'URL prête à être ouverte' : 'URL à vérifier'}
                    variant={isUrlReady ? 'filled' : 'outlined'}
                  />
                </Box>

                <Alert severity="info">
                  Le bouton ci-dessous ouvrira automatiquement cette adresse dans le navigateur.
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

                  {tunnelStatus.active ? (
                    <Button
                      color="error"
                      variant="outlined"
                      startIcon={<LinkOffRounded />}
                      onClick={handleStopTunnel}
                      disabled={isTunnelLoading}
                    >
                      Desactiver tunnel
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<LinkRounded />}
                      onClick={handleStartTunnel}
                      disabled={isTunnelLoading}
                    >
                      Tunnel
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyRounded />}
                    onClick={handleCopyTunnelLink}
                    disabled={!tunnelStatus.active || !tunnelStatus.url}
                  >
                    Copier
                  </Button>
                </Stack>

                <Divider />

                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Tunnel par Internet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active un lien public temporaire pour tester cette application locale depuis
                        Internet.
                      </Typography>
                    </Box>

                    <Chip
                      color={tunnelStatus.active ? 'success' : 'default'}
                      label={tunnelStatus.active ? 'Tunnel actif' : 'Tunnel inactif'}
                      variant={tunnelStatus.active ? 'filled' : 'outlined'}
                    />
                  </Stack>
                  
                  {tunnelStatus.active && tunnelStatus.url && (
                    <TextField
                      fullWidth
                      label="Lien tunnel public"
                      value={tunnelStatus.url}
                      InputProps={{
                        readOnly: true,
                        endAdornment: <LinkRounded color="success" />,
                      }}
                    />
                  )}
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
              subheader="Le renouvellement est reservé au developpeur de l&apos;application."
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
                  Expiration actuelle : {fDate(desktopLicenseExpiresAt) || 'non disponible'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Message courant : {desktopSecurityMessage || 'Aucun message'}
                </Typography>

                {isFixedDesktopSuperAdmin && (
                  <Alert severity={isDesktopMachineCurrent ? 'info' : 'warning'}>
                  Licence rattachée à : {desktopMachineDescription || 'poste non renseigné'}. Poste
                  actuel : {desktopCurrentMachineDescription || 'poste non détecté'}.
                  </Alert>
                )}

                {desktopAlert && (
                  <Alert severity={desktopAlert.severity}>{desktopAlert.message}</Alert>
                )}

                {isFixedDesktopSuperAdmin ? (
                  <>
                    <Alert severity="info">
                      Cette section de renouvellement est reservée au developpeur de
                      l&apos;application.
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

                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={handleRebindMachine}
                        disabled={isRebindingMachine}
                      >
                        {isRebindingMachine ? 'Association...' : 'Associer à ce poste'}
                      </Button>
                    </Stack>

                    <Divider />

                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="h6">Codes de déblocage offline</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pack de 25 codes : 10 codes de 30 jours, 5 de 60 jours, 5 de 6 mois et 5
                          de 1 an.
                        </Typography>
                      </Box>

                      <Alert severity="warning">
                        L&apos;export initial est disponible une seule fois. Générer un nouveau pack
                        remplace les codes non utilisés.
                      </Alert>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button
                          variant="outlined"
                          startIcon={<FileDownloadRounded />}
                          onClick={handleExportInitialUnlockCodes}
                          disabled={isExportingUnlockCodes || isGeneratingUnlockCodes}
                        >
                          {isExportingUnlockCodes ? 'Export...' : 'Exporter le pack initial'}
                        </Button>

                        <Button
                          variant="outlined"
                          color="warning"
                          startIcon={<AutorenewRounded />}
                          onClick={handleGenerateUnlockCodes}
                          disabled={isExportingUnlockCodes || isGeneratingUnlockCodes}
                        >
                          {isGeneratingUnlockCodes ? 'Génération...' : 'Générer un nouveau pack'}
                        </Button>
                      </Stack>
                    </Stack>

                  </>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        )}

        {canManageDesktopBackups && (
          <Card>
            <CardHeader
              avatar={<StorageRounded color="primary" />}
              title="Sauvegarde locale"
              subheader="Sauvegarder, restaurer ou ouvrir le dossier des données de cette église."
            />
            <CardContent>
              <Stack spacing={2.5}>
                <Alert severity="info">
                  Faites une sauvegarde avant chaque mise à jour, avant une grosse saisie ou avant
                  toute intervention sur le poste du client.
                </Alert>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<FileDownloadRounded />}
                    onClick={handleCreateSqliteBackup}
                    disabled={isCreatingSqliteBackup}
                  >
                    {isCreatingSqliteBackup ? 'Sauvegarde...' : 'Sauvegarder la base'}
                  </Button>

                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<UploadRounded />}
                    onClick={handleRestoreSqliteBackup}
                    disabled={isRestoringSqliteBackup}
                  >
                    {isRestoringSqliteBackup ? 'Restauration...' : 'Restaurer une sauvegarde'}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<StorageRounded />}
                    onClick={handleOpenSqliteDataFolder}
                    disabled={isOpeningSqliteFolder}
                  >
                    Ouvrir le dossier
                  </Button>
                </Stack>

                <Alert severity="warning">
                  Restaurer une sauvegarde remplace les données locales actuelles. Après une
                  restauration, redémarrez l’application desktop pour recharger correctement les
                  données.
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        )}

        {(canManageDesktopBackups || canManageDesktopUpdates || canManageSecondaryUsers) && (
          <Card>
            <CardHeader
              avatar={<MenuBookRounded color="primary" />}
              title="Guide d’installation"
              subheader="Les étapes essentielles à garder sous la main chez un client."
            />
            <CardContent>
              <Stack spacing={1.5}>
                {[
                  'Installer l’exécutable sur le poste principal de l’église.',
                  'Créer l’église et le compte administrateur principal.',
                  'Depuis Paramètres, utiliser Ouvrir dans le navigateur ou partager l’adresse locale affichée.',
                  'Faire une sauvegarde avant les mises à jour et avant les grosses saisies.',
                  'Quand une mise à jour est disponible, la lancer depuis la section Mises à jour.',
                ].map((step, index) => (
                  <Stack key={step} direction="row" spacing={1.5} alignItems="flex-start">
                    <Chip size="small" label={index + 1} color="primary" />
                    <Typography variant="body2">{step}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {(canManageDesktopBackups || canManageSecondaryUsers || isFixedDesktopSuperAdmin) && (
          <Card>
            <CardHeader
              avatar={<EditRounded color="primary" />}
              title="Journal d’actions"
              subheader="Dernières opérations enregistrées sur ce poste."
              action={
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={handleRefreshActionJournal}>
                    Actualiser
                  </Button>
                  <Button size="small" color="warning" onClick={handleClearActionJournal}>
                    Vider
                  </Button>
                </Stack>
              }
            />
            <CardContent>
              {actionJournalEntries.length === 0 ? (
                <Alert severity="info">Aucune action enregistrée sur ce poste pour le moment.</Alert>
              ) : (
                <Stack spacing={1.5}>
                  {actionJournalEntries.slice(0, 20).map((entry) => (
                    <Box
                      key={entry.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        justifyContent="space-between"
                      >
                        <Typography variant="subtitle2">
                          {entry.action} - {entry.module}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(entry.date).toLocaleString('fr-FR')}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {entry.user} - {entry.details}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        )}

        {canManageDesktopUpdates && (
          <Card>
            <CardHeader
              avatar={<SystemUpdateRounded color="primary" />}
              title="Mises à jour"
              subheader="Vérifie les nouvelles versions publiées sur GitHub Releases."
              action={
                <Chip
                  color={desktopUpdateChip.color}
                  label={desktopUpdateChip.label}
                  variant={desktopUpdateStatus?.supported === false ? 'outlined' : 'filled'}
                />
              }
            />
            <CardContent>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Version installée
                    </Typography>
                    <Typography variant="h6">
                      {desktopUpdateStatus?.currentVersion || 'Version inconnue'}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Dernière version trouvée
                    </Typography>
                    <Typography variant="h6">
                      {desktopUpdateStatus?.latestVersion || 'Non vérifiée'}
                    </Typography>
                  </Box>
                </Stack>

                {desktopUpdateStatus?.message && (
                  <Alert
                    severity={
                      desktopUpdateStatus.error
                        ? 'error'
                        : desktopUpdateStatus.downloaded
                          ? 'success'
                          : desktopUpdateStatus.available
                            ? 'info'
                            : 'info'
                    }
                  >
                    {desktopUpdateStatus.error || desktopUpdateStatus.message}
                  </Alert>
                )}

                {desktopUpdateProgress > 0 && desktopUpdateProgress < 100 && (
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 0.75 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Téléchargement
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {desktopUpdateProgress}%
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={desktopUpdateProgress} />
                  </Box>
                )}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<AutorenewRounded />}
                    onClick={handleCheckDesktopUpdate}
                    disabled={
                      isCheckingDesktopUpdate ||
                      desktopUpdateStatus?.checking ||
                      desktopUpdateStatus?.supported === false
                    }
                  >
                    {isCheckingDesktopUpdate || desktopUpdateStatus?.checking
                      ? 'Vérification...'
                      : 'Vérifier les mises à jour'}
                  </Button>

                  {desktopUpdateStatus?.downloaded && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<SystemUpdateRounded />}
                      onClick={handleInstallDesktopUpdate}
                      disabled={isInstallingDesktopUpdate}
                    >
                      {isInstallingDesktopUpdate ? 'Redémarrage...' : 'Redémarrer et installer'}
                    </Button>
                  )}
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Les mises à jour automatiques fonctionnent uniquement dans une version installée.
                  En développement, il faut reconstruire l&apos;application manuellement.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}

        <ConfirmDialog
          open={Boolean(deletingSecondaryUser)}
          title="Supprimer cet utilisateur secondaire"
          message={`L'utilisateur ${deletingSecondaryUser?.nomUtilisateur || ''} sera retiré de cette église.`}
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
                Cette action est visible uniquement par l&apos;administrateur principal. Elle
                remplace le mot de passe de{' '}
                <strong>
                  {resetPasswordUser?.prenomUtilisateur || 'cet utilisateur'}{' '}
                  {resetPasswordUser?.nomUtilisateur || ''}
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
                  resetPasswordForm.confirmPassword &&
                    resetPasswordForm.password !== resetPasswordForm.confirmPassword
                )}
                helperText={
                  resetPasswordForm.confirmPassword &&
                  resetPasswordForm.password !== resetPasswordForm.confirmPassword
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
            <Button
              onClick={handleCloseResetSecondaryPassword}
              disabled={isResettingSecondaryPassword}
            >
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
