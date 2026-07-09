// apiClient.ts
import type { ModulePermissionKey } from 'src/store/userSlice';

import { normalizeText } from './text';
import { canManageModule } from './access-control';
import { sanitizeSensitiveData } from './sensitive-data';
import { getServerUrl, getConnectionMode, getCurrentSessionUser } from './functions';

export const BASE_URL_DEV = 'http://localhost:49300/';
export const BASE_URL_ONLINE = import.meta.env.VITE_API_URL || '';
const DEFAULT_LOCAL_API_PORT = '49300';
const DEFAULT_REQUEST_TIMEOUT_MS = 15000;
const LOCAL_AUTH_TOKEN_KEY = 'ma-communaute-local-auth-token';

const normalizeBaseUrl = (url: string): string => (url.endsWith('/') ? url : `${url}/`);
const getLocalApiPort = (): string => String(import.meta.env.VITE_LOCAL_API_PORT || DEFAULT_LOCAL_API_PORT);

const isLoopbackHost = (hostname?: string): boolean =>
  !hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]';

const isTunnelHost = (hostname?: string): boolean => {
  const normalizedHostname = String(hostname || '').toLowerCase();
  return normalizedHostname.endsWith('.loca.lt');
};

const getBrowserLocalApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    return BASE_URL_DEV;
  }

  const { protocol, hostname } = window.location;

  if (isLoopbackHost(hostname)) {
    return BASE_URL_DEV;
  }

  if (isTunnelHost(hostname)) {
    return `${protocol}//${hostname}/`;
  }

  return `${protocol}//${hostname}:${getLocalApiPort()}/`;
};

const normalizeConfiguredApiUrl = (url: string): string => {
  if (!url || typeof window === 'undefined') {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    const currentHost = window.location.hostname;

    const isKnownFrontendPort = parsedUrl.port === '3039' || parsedUrl.port === '5173';

    if (isTunnelHost(parsedUrl.hostname)) {
      parsedUrl.port = '';
      return parsedUrl.toString();
    }

    if (getApiMode() === 'local' && parsedUrl.port && parsedUrl.port !== getLocalApiPort() && (
      parsedUrl.hostname === currentHost || isKnownFrontendPort
    )) {
      parsedUrl.port = getLocalApiPort();
      return parsedUrl.toString();
    }
  } catch (_error) {
    return url;
  }

  return url;
};

export const getApiMode = (): 'local' | 'online' => getConnectionMode();

const canUseLocalStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const saveLocalAuthToken = (token?: string | null): void => {
  if (!canUseLocalStorage()) {
    return;
  }

  const normalizedToken = String(token || '').trim();

  if (normalizedToken) {
    window.localStorage.setItem(LOCAL_AUTH_TOKEN_KEY, normalizedToken);
    return;
  }

  window.localStorage.removeItem(LOCAL_AUTH_TOKEN_KEY);
};

export const getLocalAuthToken = (): string => {
  if (!canUseLocalStorage()) {
    return '';
  }

  return window.localStorage.getItem(LOCAL_AUTH_TOKEN_KEY) || '';
};

export const clearLocalAuthToken = (): void => {
  saveLocalAuthToken('');
};

const assertCanManageModule = (permission: ModulePermissionKey, actionLabel?: string): void => {
  const currentUser = getCurrentSessionUser();

  if (!currentUser) {
    return;
  }

  if (!canManageModule(currentUser, permission)) {
    throw new ApiError(
      actionLabel || "Vous avez uniquement un acces en lecture sur ce module.",
      403,
      { permission }
    );
  }
};

// Fonction pour obtenir l'URL de base
export const getBaseUrl = (): string => {
  // En developpement, utilise localhost:49300 (serveur Express local)
  if (import.meta.env.DEV) {
    return getBrowserLocalApiBaseUrl();
  }

  // En production, utilise soit:
  // 1. L'URL du serveur depuis le store (si disponible)
  // 2. Une variable d'environnement VITE_API_URL
  // 3. L'URL de ton backend heberge


  const serverUrl = getServerUrl();
  if (serverUrl) {
    const apiServerUrl = normalizeConfiguredApiUrl(serverUrl);
    return apiServerUrl.endsWith('/') ? apiServerUrl : `${apiServerUrl}/`;
  }

  // Fallback: variable d'environnement ou URL par defaut
  return import.meta.env.VITE_API_URL ||
    (isLoopbackHost(window.location.hostname)
      ? BASE_URL_DEV
      : getBrowserLocalApiBaseUrl()
      // : 'https://votre-backend-production.com/'
    );
};

export const resolveApiBaseUrl = (): string => {
  const connectionMode = getApiMode();
  const serverUrl = getServerUrl();

  if ((window as any)?.desktopApp?.isDesktop) {
    return normalizeBaseUrl(import.meta.env.VITE_LOCAL_API_URL || BASE_URL_DEV);
  }

  if (connectionMode === 'online') {
    if (serverUrl) {
      return normalizeBaseUrl(serverUrl);
    }

    if (BASE_URL_ONLINE) {
      return normalizeBaseUrl(BASE_URL_ONLINE);
    }
  }

  if (serverUrl) {
    return normalizeBaseUrl(normalizeConfiguredApiUrl(serverUrl));
  }

  if (import.meta.env.VITE_LOCAL_API_URL) {
    return normalizeBaseUrl(import.meta.env.VITE_LOCAL_API_URL);
  }

  if (import.meta.env.DEV || getApiMode() === 'local') {
    return normalizeBaseUrl(getBrowserLocalApiBaseUrl());
  }

  return normalizeBaseUrl(BASE_URL_ONLINE || BASE_URL_DEV);
};

// Interface pour la structure d'une reponse du serveur
export interface IServerResponse {
  status: number;
  data?: any;
  error?: any;
  errors?: any;
  message?: string;
}

// Interface pour la configuration d'une requete
export interface IConfig extends RequestInit {
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;

  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const isLikelyNetworkError = (error: unknown): boolean =>
  error instanceof TypeError && /failed to fetch|networkerror|load failed|fetch/i.test(error.message);

const getHttpStatusMessage = (status: number): string => {
  switch (status) {
    case 0:
      return "Impossible de joindre le serveur. Verifiez votre connexion et l'adresse du serveur dans les paramètres.";
    case 400:
      return 'La demande envoyée est incomplete ou incorrecte. Verifiez les informations saisies puis reéssayez.';
    case 401:
      return 'Votre session a expiré ou vos identifiants sont incorrects. Reconnectez-vous pour continuer.';
    case 403:
      return "Vous n'avez pas l'autorisation d'effectuer cette action.";
    case 404:
      return "Le service demande est introuvable. Verifiez que l'application utilise bien l'adresse du serveur local en port 49300.";
    case 408:
      return 'Le serveur met trop de temps a repondre. Verifiez le reseau puis reessayez.';
    case 409:
      return 'Cette action entre en conflit avec des données déjà existantes. Verifiez les informations puis reessayez.';
    case 413:
      return 'Le fichier ou les données envoyees sont trop volumineux.';
    case 422:
      return 'Certaines informations saisies ne sont pas valides. Verifiez le formulaire puis reessayez.';
    case 429:
      return 'Trop de tentatives en peu de temps. Patientez un moment puis reessayez.';
    case 500:
      return 'Le serveur a rencontre une erreur interne. Reessayez, puis contactez le support si le probleme continue.';
    case 502:
    case 503:
    case 504:
      return "Le serveur est momentanement indisponible. Verifiez qu'il est demarre puis reessayez.";
    default:
      if (status >= 500) {
        return 'Le serveur a rencontré une erreur. Reéssayez dans quelques instants.';
      }
      if (status >= 400) {
        return "La demande n'a pas pu être traitée. Verifiez les informations puis reéssayez.";
      }
      return 'Une erreur est survenue pendant la communication avec le serveur.';
  }
};

const buildNetworkErrorMessage = (url: string): string => {
  const port = getLocalApiPort();
  const baseMessage = `Impossible de joindre le serveur local. Verifiez que le serveur est demarre et que le port ${port} est autorisé par le pare-feu.`;

  if (typeof window !== 'undefined' && !isLoopbackHost(window.location.hostname)) {
    return `${baseMessage} Votre appareil doit etre sur le même reseau Wi-Fi. Adresse utilisee: ${url}`;
  }

  return `${baseMessage} Adresse utilisée: ${url}`;
};

export const getApiErrorMessage = (error: unknown, fallback = 'Une erreur est survenue.'): string => {
  if (error instanceof ApiError) {
    return normalizeText(error.message || getHttpStatusMessage(error.status) || fallback);
  }

  if (error instanceof Error && error.message) {
    return normalizeText(error.message);
  }

  return normalizeText(fallback);
};

// Extrait un message exploitable depuis les differents formats d'erreur du backend.
const buildErrorMessage = (data: any, fallback: string): string => {
  if (!data) return fallback;

  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.errors === 'string') return data.errors;
  if (typeof data?.error?.message === 'string') return data.error.message;
  if (typeof data?.errors?.message === 'string') return data.errors.message;

  return fallback;
};

// Assemble l'URL finale sans doublon de slash entre base et route.
const cleanUrl = (baseUrl: string, route: string): string => {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanRoute = route.startsWith('/') ? route : `/${route}`;
  return `${cleanBase}${cleanRoute}`;
};

export const getPhotosBaseUrl = (): string => cleanUrl(resolveApiBaseUrl(), 'photos');

const normalizePhotoName = (photoName: string): string => {
  if (!photoName) return '';

  return photoName
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^photos\//i, '')
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
};

export const buildPhotoUrl = (photoName: string): string => {
  const normalized = normalizePhotoName(photoName);
  return cleanUrl(resolveApiBaseUrl(), normalized ? `photos/${normalized}` : 'photos');
};

const normalizeChurchLogoName = (logoName: string): string => {
  if (!logoName) return '';

  return logoName
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^church-logos\//i, '')
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
};

export const buildChurchLogoUrl = (logoName: string, cacheKey?: string | number): string => {
  const normalized = normalizeChurchLogoName(logoName);
  const url = cleanUrl(resolveApiBaseUrl(), normalized ? `church-logos/${normalized}` : 'church-logos');
  const normalizedCacheKey = cacheKey ? encodeURIComponent(String(cacheKey)) : '';

  return normalizedCacheKey ? `${url}?v=${normalizedCacheKey}` : url;
};

const normalizeGaleriePath = (filePath: string): string => {
  if (!filePath) return '';

  return filePath
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^galerie-media\//i, '')
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
};

export const buildGalerieMediaUrl = (filePath: string): string => {
  const normalized = normalizeGaleriePath(filePath);
  return cleanUrl(resolveApiBaseUrl(), normalized ? `galerie-media/${normalized}` : 'galerie-media');
};

export const buildGalerieDownloadUrl = (idGalerie: number | string, idUtilisateur?: number | null): string => {
  const suffix = typeof idUtilisateur === 'number' ? `?idUtilisateur=${encodeURIComponent(String(idUtilisateur))}` : '';
  return cleanUrl(resolveApiBaseUrl(), `communaute/telechargergalerie/${idGalerie}${suffix}`);
};
// Point d'entree commun pour toutes les requetes HTTP du front.
export async function request<T>(
  route: string,
  config?: IConfig,
  customBaseUrl?: string
): Promise<T> {
  const baseUrl = customBaseUrl || resolveApiBaseUrl();
  const url = cleanUrl(baseUrl, route);

  try {
    if ((window as any)?.desktopApp?.isDesktop) {
      console.info('[desktop-api]', url);
    }

    const isFormDataBody = typeof FormData !== 'undefined' && config?.body instanceof FormData;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), DEFAULT_REQUEST_TIMEOUT_MS);

    const response = await fetch(url, {
      ...config,
      signal: config?.signal || controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
        ...(getLocalAuthToken() ? { Authorization: `Bearer ${getLocalAuthToken()}` } : {}),
        ...config?.headers,
      },
    });

    window.clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const responseData = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message = buildErrorMessage(responseData, getHttpStatusMessage(response.status));
      throw new ApiError(message, response.status, responseData);
    }

    return sanitizeSensitiveData(responseData) as T;
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);

    if (error instanceof ApiError) {
      if (error.status === 401) {
        clearLocalAuthToken();
      }

      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(
        "Le serveur local ne repond pas. Verifiez que l'application desktop est ouverte et que le backend local a bien demarre.",
        408,
        { url }
      );
    }

    if (isLikelyNetworkError(error)) {
      throw new ApiError(buildNetworkErrorMessage(url), 0, {
        url,
        originalMessage: error instanceof Error ? error.message : String(error),
      });
    }

    throw error;
  }
}

  // API client specifique pour le backend de l'application
export const apiClient = {
  // Recupere l'IP et l'URL LAN du serveur pour affichage dans l'application.
  getServerInfo: () =>
    request<IServerResponse>('communaute/server-info', { method: 'GET' }),

  getTunnelStatus: () =>
    request<IServerResponse>('communaute/tunnel/status', { method: 'GET' }),

  startTunnel: (data: { contactEglise?: string; nomTemple?: string; ttlMinutes?: number }) =>
    request<IServerResponse>('communaute/tunnel/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  stopTunnel: () =>
    request<IServerResponse>('communaute/tunnel/stop', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // Retourne l'etat courant du blocage desktop pour l'utilisateur cible.
  getDesktopSecurityStatus: (nomUtilisateur: string) =>
    request<IServerResponse>(
      `communaute/desktop-control/status?nomUtilisateur=${encodeURIComponent(nomUtilisateur)}`,
      { method: 'GET' }
    ),

  // Permet au superadmin de debloquer l'application desktop pour une nouvelle periode.
  unlockDesktopAccess: (data: { nomUtilisateur: string; password: string; extendDays?: number }) =>
    request<IServerResponse>('communaute/desktop-control/unlock', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Rattache la licence desktop locale a l'ordinateur courant.
  rebindDesktopLicenseMachine: (data: { nomUtilisateur: string; password: string }) =>
    request<IServerResponse>('communaute/desktop-control/rebind-machine', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Debloque l'application desktop avec un code offline fourni au client.
  unlockDesktopAccessWithCode: (data: { nomUtilisateur: string; code: string }) =>
    request<IServerResponse>('communaute/desktop-control/unlock-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Exporte une seule fois les codes initiaux generes avec la licence locale.
  exportDesktopUnlockCodes: (data: { nomUtilisateur: string; password: string }) =>
    request<IServerResponse>('communaute/desktop-control/unlock-codes/export', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Genere un nouveau pack de codes et remplace les codes non utilises.
  generateDesktopUnlockCodes: (data: { nomUtilisateur: string; password: string }) =>
    request<IServerResponse>('communaute/desktop-control/unlock-codes/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Restaure une sauvegarde SQLite locale depuis un fichier zip.
  restoreSqliteBackup: (data: { nomUtilisateur: string; password: string; backupFile: File }) => {
    const formData = new FormData();
    formData.append('nomUtilisateur', data.nomUtilisateur);
    formData.append('password', data.password);
    formData.append('backup', data.backupFile);

    return request<IServerResponse>('communaute/desktop-control/sqlite-backups/restore', {
      method: 'POST',
      body: formData,
    });
  },

  // Membres
  // Recupere la liste complete des membres.
  getMembres: () =>
    request<IServerResponse>('communaute/listemembre', { method: 'GET' }),

  // Recupere uniquement les membres rattaches a un utilisateur.
  getMembresByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/recupmembrebyutilisateur/${idUtilisateur}`, { method: 'GET' }),

  // Cree un membre.
  createMembre: (data: any) =>
    request<IServerResponse>('communaute/inserermembre', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Met a jour un membre existant.
  updateMembre: (data: any) =>
    request<IServerResponse>('communaute/modifiermembre', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Supprime un membre en gardant le contexte utilisateur si besoin.
  deleteMembre: (idMembre: number, idUtilisateur?: number | null) =>
    request<IServerResponse>('communaute/supprimermembre', {
      method: 'POST',
      body: JSON.stringify({ idMembre, idUtilisateur }),
    }),


  // cultes
  // Recupere tous les cultes.
  getCultes: () =>
    request<IServerResponse>('communaute/listeculte', { method: 'GET' }),

  // Recupere les cultes d'un utilisateur.
  getCultesByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/recupcultebyutilisateur/${idUtilisateur}`, { method: 'GET' }),

  // Cree un culte.
  createCulte: (data: any) =>
    request<IServerResponse>('communaute/insererculte', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Met a jour un culte.
  updateCulte: (data: any) =>
    request<IServerResponse>('communaute/modifierculte', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Supprime un culte.
  deleteCulte: (idCulte: number, idUtilisateur?: number | null) =>
    request<IServerResponse>('communaute/supprimerculte', {
      method: 'POST',
      body: JSON.stringify({ idCulte, idUtilisateur }),
    }),

  // departements
  // Recupere la liste des departements.
  getDepartements: () =>
    request<IServerResponse>('communaute/listedepartement', { method: 'GET' }),

  // Recupere les departements lies a un utilisateur.
  getDepartementsByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/recupdepartementbyutilisateur/${idUtilisateur}`, { method: 'GET' }),

  // Cree un departement.
  createDepartement: (data: any) =>
    request<IServerResponse>('communaute/insererdepartement', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Met a jour un departement.
  updateDepartement: (data: any) =>
    request<IServerResponse>('communaute/modifierdepartement', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Supprime un departement.
  deleteDepartement: (idDepartement: number, idUtilisateur?: number | null) =>
    request<IServerResponse>('communaute/supprimerdepartement', {
      method: 'POST',
      body: JSON.stringify({ idDepartement, idUtilisateur }),
    }),

  // cellules
  // Recupere toutes les cellules.
  getCellules: () =>
    request<IServerResponse>('communaute/listecellule', { method: 'GET' }),

  // Recupere les cellules d'un utilisateur.
  getCellulesByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/recupcellulebyutilisateur/${idUtilisateur}`, { method: 'GET' }),

  // Cree une cellule.
  createCellule: (data: any) =>
    request<IServerResponse>('communaute/inserercellule', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Met a jour une cellule.
  updateCellule: (data: any) =>
    request<IServerResponse>('communaute/modifiercellule', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Supprime une cellule.
  deleteCellule: (idCellule: number, idUtilisateur?: number | null) =>
    request<IServerResponse>('communaute/supprimercellule', {
      method: 'POST',
      body: JSON.stringify({ idCellule, idUtilisateur }),
    }),

  // groupes
  // Recupere tous les groupes.
  getGroupes: () =>
    request<IServerResponse>('communaute/listegroupe', { method: 'GET' }),

  // Recupere les groupes d'un utilisateur.
  getGroupesByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/recupgroupebyutilisateur/${idUtilisateur}`, { method: 'GET' }),

  // Cree un groupe.
  createGroupe: (data: any) =>
    request<IServerResponse>('communaute/inserergroupe', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Met a jour un groupe.
  updateGroupe: (data: any) =>
    request<IServerResponse>('communaute/modifiergroupe', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Supprime un groupe.
  deleteGroupe: (idGroupe: number, idUtilisateur?: number | null) =>
    request<IServerResponse>('communaute/supprimergroupe', {
      method: 'POST',
      body: JSON.stringify({ idGroupe, idUtilisateur }),
    }),

  // familles de jeunesse
  getFamillesJeunesseByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/recupfamillejeunessebyutilisateur/${idUtilisateur}`, { method: 'GET' }),

  createFamilleJeunesse: (data: any) =>
    request<IServerResponse>('communaute/insererfamillejeunesse', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFamilleJeunesse: (data: any) =>
    request<IServerResponse>('communaute/modifierfamillejeunesse', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteFamilleJeunesse: (idFamilleJeunesse: number, idUtilisateur?: number | null) =>
    request<IServerResponse>('communaute/supprimerfamillejeunesse', {
      method: 'POST',
      body: JSON.stringify({ idFamilleJeunesse, idUtilisateur }),
    }),

  // responsabilites
  getResponsabilites: () =>
    request<IServerResponse>('communaute/listeresponsabilite', { method: 'GET' }),

  createResponsabilite: (data: any) =>
    request<IServerResponse>('communaute/insererresponsabilite', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateResponsabilite: (data: any) =>
    request<IServerResponse>('communaute/modifierresponsabilite', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteResponsabilite: (idResponsabilite: number) =>
    request<IServerResponse>('communaute/supprimerresponsabilite', {
      method: 'POST',
      body: JSON.stringify({ idResponsabilite }),
    }),
  // agenda
  getAgendaByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/recupagendabyutilisateur/${idUtilisateur}`, { method: 'GET' }),

  createAgenda: (data: any) =>
    request<IServerResponse>('communaute/insereragenda', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAgenda: (data: any) =>
    request<IServerResponse>('communaute/modifieragenda', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteAgenda: (idAgenda: number, idUtilisateur?: number | null) =>
    request<IServerResponse>('communaute/supprimeragenda', {
      method: 'POST',
      body: JSON.stringify({ idAgenda, idUtilisateur }),
    }),

  // comptabilite
  getComptabilitesByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/listecomptabilite/${idUtilisateur}`, { method: 'GET' }),

  getComptabilitesSupprimeesByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/listecomptabilitesupprimee/${idUtilisateur}`, { method: 'GET' }),

  createComptabilite: (data: any) => {
    assertCanManageModule('comptabilite');
    return request<IServerResponse>('communaute/inserercomptabilite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateComptabilite: (data: any) => {
    assertCanManageModule('comptabilite');
    return request<IServerResponse>(`communaute/modifiercomptabilite/${data.idComptabilite}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteComptabilite: (idComptabilite: number, idUtilisateur?: number | null, motifSuppressionComptabilite?: string) => {
    assertCanManageModule('comptabilite');
    return request<IServerResponse>(`communaute/supprimercomptabilite/${idComptabilite}`, {
      method: 'POST',
      body: JSON.stringify({ idComptabilite, idUtilisateur, motifSuppressionComptabilite }),
    });
  },

  restoreComptabilite: (idComptabilite: number) => {
    assertCanManageModule('comptabilite');
    return request<IServerResponse>(`communaute/restaurercomptabilite/${idComptabilite}`, {
      method: 'POST',
      body: JSON.stringify({ idComptabilite }),
    });
  },

  deleteComptabilitePermanently: (idComptabilite: number, nomUtilisateur: string) => {
    assertCanManageModule('comptabilite');
    return request<IServerResponse>(`communaute/supprimercomptabilitedefinitivement/${idComptabilite}`, {
      method: 'POST',
      body: JSON.stringify({ idComptabilite, nomUtilisateur }),
    });
  },
  // galerie
  getGaleriesByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/recupgaleriebyutilisateur/${idUtilisateur}`, { method: 'GET' }),

  createGalerie: (data: any) =>
    request<IServerResponse>('communaute/inserergalerie', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateGalerie: (data: any) =>
    request<IServerResponse>('communaute/modifiergalerie', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteGalerie: (idGalerie: number, idUtilisateur?: number | null) =>
    request<IServerResponse>('communaute/supprimergalerie', {
      method: 'POST',
      body: JSON.stringify({ idGalerie, idUtilisateur }),
    }),

  getGalerieImages: (idGalerie: number | string) =>
    request<IServerResponse>(`communaute/recupimagesgalerie/${idGalerie}`, { method: 'GET' }),

  addGalerieImages: (data: any) =>
    request<IServerResponse>('communaute/ajouterimagesgalerie', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteGalerieImage: (idGalerieImage: number, idUtilisateur?: number | null) =>
    request<IServerResponse>('communaute/supprimerimagegalerie', {
      method: 'POST',
      body: JSON.stringify({ idGalerieImage, idUtilisateur }),
    }),

  updateGalerieImage: (data: { idGalerieImage: number; legendeImage: string; idUtilisateur?: number | null }) =>
    request<IServerResponse>('communaute/modifierimagegalerie', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  setGalerieCover: (data: { idGalerie: number; idGalerieImage: number; idUtilisateur?: number | null }) =>
    request<IServerResponse>('communaute/definircouverturegalerie', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // cas sociaux - mariages
  // Recupere les mariages de l'utilisateur connecte.
  getMariagesByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/recupmariagebyutilisateur/${idUtilisateur}`, { method: 'GET' }),

  // Cree un mariage.
  createMariage: (data: any) =>
    request<IServerResponse>('communaute/inserermariage', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Met a jour un mariage.
  updateMariage: (data: any) =>
    request<IServerResponse>('communaute/modifiermariage', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Supprime un mariage.
  deleteMariage: (idMariage: number) =>
    request<IServerResponse>('communaute/supprimermariage', {
      method: 'POST',
      body: JSON.stringify({ idMariage }),
    }),

  // cas sociaux - naissances
  // Recupere les naissances de l'utilisateur connecte.
  getNaissancesByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/recupnaissancebyutilisateur/${idUtilisateur}`, { method: 'GET' }),

  // Cree une naissance.
  createNaissance: (data: any) =>
    request<IServerResponse>('communaute/inserernaissance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Met a jour une naissance.
  updateNaissance: (data: any) =>
    request<IServerResponse>('communaute/modifiernaissance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Supprime une naissance.
  deleteNaissance: (idNaissance: number, idUtilisateur?: number | null) =>
    request<IServerResponse>('communaute/supprimernaissance', {
      method: 'POST',
      body: JSON.stringify({ idNaissance, idUtilisateur }),
    }),

  // cas sociaux - deces
  // Recupere les deces de l'utilisateur connecte.
  getDecesByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/recupdecesbyutilisateur/${idUtilisateur}`, { method: 'GET' }),

  // Cree un deces.
  createDeces: (data: any) =>
    request<IServerResponse>('communaute/insererdeces', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Met a jour un deces.
  updateDeces: (data: any) =>
    request<IServerResponse>('communaute/modifierdeces', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Supprime un deces.
  deleteDeces: (idDeces: number) =>
    request<IServerResponse>('communaute/supprimerdeces', {
      method: 'POST',
      body: JSON.stringify({ idDeces }),
    }),

  // cas sociaux - maladies
  // Recupere les maladies de l'utilisateur connecte.
  getMaladiesByUtilisateur: (idUtilisateur: number | string) =>
    request<IServerResponse>(`communaute/recupmaladiebyutilisateur/${idUtilisateur}`, { method: 'GET' }),

  // Cree un cas de maladie.
  createMaladie: (data: any) =>
    request<IServerResponse>('communaute/inserermaladie', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Met a jour un cas de maladie.
  updateMaladie: (data: any) =>
    request<IServerResponse>('communaute/modifiermaladie', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Supprime un cas de maladie.
  deleteMaladie: (idMaladie: number) =>
    request<IServerResponse>('communaute/supprimermaladie', {
      method: 'POST',
      body: JSON.stringify({ idMaladie }),
    }),

  // Utilisateur
  // Authentifie un utilisateur avec son nom et son mot de passe.
  login: (data: { nomUtilisateur: string; password: string }) =>
    request<IServerResponse>('communaute/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  requestPasswordReset: (data: { nomUtilisateur: string; email: string }) =>
    request<IServerResponse>('communaute/demander-reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resetPassword: (data: {
    nomUtilisateur: string;
    email: string;
    code: string;
    password: string;
    confirmPassword: string;
  }) =>
    request<IServerResponse>('communaute/reinitialiser-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Cree un compte utilisateur dans le backend principal.
  registerUtilisateur: (data: {
    logoUtilisateur?: string;
    logoEglise?: string;
    nomTemple: string;
    nomEgliseCourt?: string;
    lieuEglise?: string;
    nomUtilisateur: string;
    prenomUtilisateur: string;
    telephoneUtilisateur: string;
    telephoneSecretariatEglise?: string;
    pasteurPrincipal?: string;
    pasteurSecondaire?: string;
    pasteurTroisieme?: string;
    telephonePasteurPrincipal?: string;
    telephonePasteurSecondaire?: string;
    telephonePasteurTroisieme?: string;
    capaciteAccueilEglise?: string;
    nombreCultesDimanche?: string;
    emailEglise?: string;
    boitePostaleEglise?: string;
    dateCreationEglise?: string;
    nombrePasteursEglise?: string;
    nombreAnciensEglise?: string;
    nombreDiacresEglise?: string;
    modeVersetDashboard?: string;
    versetDashboardReference?: string;
    versetDashboardTexte?: string;
    password?: string;
    confirmPassword?: string;
    email?: string;
  }) =>
    request<IServerResponse>('communaute/ajouterutilisateur', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Met a jour les informations du profil et de l'eglise rattaches a l'utilisateur.
  updateUtilisateur: (data: {
    idUtilisateur: number;
    logoUtilisateur?: string;
    logoEglise?: string;
    nomTemple: string;
    nomEgliseCourt?: string;
    lieuEglise?: string;
    nomUtilisateur: string;
    prenomUtilisateur: string;
    telephoneUtilisateur: string;
    telephoneSecretariatEglise?: string;
    pasteurPrincipal?: string;
    pasteurSecondaire?: string;
    pasteurTroisieme?: string;
    telephonePasteurPrincipal?: string;
    telephonePasteurSecondaire?: string;
    telephonePasteurTroisieme?: string;
    capaciteAccueilEglise?: string;
    nombreCultesDimanche?: string;
    emailEglise?: string;
    boitePostaleEglise?: string;
    dateCreationEglise?: string;
    nombrePasteursEglise?: string;
    nombreAnciensEglise?: string;
    nombreDiacresEglise?: string;
    modeVersetDashboard?: string;
    versetDashboardReference?: string;
    versetDashboardTexte?: string;
    password?: string;
    confirmPassword?: string;
    email?: string;
  }) =>
    request<IServerResponse>('communaute/modifierutilisateur', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Demande au backend de creer la base SQLite locale de la communaute.
  createCommunauteDatabase: (data: {
    idUtilisateur: number;
    nomTemple: string;
    nomEglise: string;
    dossierBase?: string;
  }) =>
    request<IServerResponse>('communaute/creer-base-sqlite', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Cree l'eglise rattachee a l'utilisateur nouvellement inscrit.
  createEglise: (data: {
    nomEglise: string;
    idUtilisateur: number;
    idComptabilite?: number;
  }) =>
    request<IServerResponse>('communaute/inserereglise', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Alias historique pour recuperer les cultes d'un utilisateur.
  getCulteByUtilisateur: (idUtilisateur: string) =>
    request<IServerResponse>(`communaute/recupcultebyutilisateur/${idUtilisateur}`, {
      method: 'GET',
    }),


  // Endpoint de test pour verifier que le backend repond.
  testConnection: () =>
    request<IServerResponse>('test', { method: 'GET' }),

  // Prepare la future synchronisation des donnees distantes vers la base locale.
  syncRemoteToLocal: (data?: { idUtilisateur?: number | string }) =>
    request<IServerResponse>('communaute/sync/remote-to-local', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  // Effectue une requete GET libre vers le backend.
  get: <T = IServerResponse>(route: string, config?: IConfig) =>
    request<T>(route, { method: 'GET', ...config }),

  // Effectue une requete POST libre vers le backend.
  post: <T = IServerResponse>(route: string, data?: any, config?: IConfig) =>
    request<T>(route, {
      method: 'POST',
      body: JSON.stringify(data),
      ...config
    }),

  // Effectue une requete PUT libre vers le backend.
  put: <T = IServerResponse>(route: string, data?: any, config?: IConfig) =>
    request<T>(route, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...config
    }),

  // Effectue une requete DELETE libre vers le backend.
  delete: <T = IServerResponse>(route: string, config?: IConfig) =>
    request<T>(route, { method: 'DELETE', ...config }),
};










