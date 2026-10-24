// functions.ts
import type { IAppState } from '../store/appSlice';
import type { IAuthentificationState } from '../store/userSlice';
import { getScopeUserIdFromUser } from './access-control';

let globalStore: any = null;

export const setGlobalStore = (store: any) => {
  globalStore = store;
};

export const isDev = () => import.meta.env.DEV;

const getStoreState = () => {
  if (!globalStore) {
    console.warn('Store not initialized');
    return null;
  }

  try {
    return globalStore.getState();
  } catch (error) {
    console.error('Error getting store state:', error);
    return null;
  }
};

export const getServerUrl = (): string => {
  const state = getStoreState();
  if (!state) return '';

  try {
    const appState = state.application as IAppState;
    return appState.serverUrl || '';
  } catch (error) {
    console.error('Error getting server URL:', error);
    return '';
  }
};

export const getConnectionMode = (): 'local' | 'online' => {
  const state = getStoreState();
  if (!state) return 'local';

  try {
    const appState = state.application as IAppState;
    return appState.connectionMode || 'local';
  } catch (error) {
    console.error('Error getting connection mode:', error);
    return 'local';
  }
};

export const getThemeMode = (): 'light' | 'dark' => {
  const state = getStoreState();
  if (!state) return 'light';

  try {
    const appState = state.application as IAppState;
    return appState.themeMode || 'light';
  } catch (error) {
    console.error('Error getting theme mode:', error);
    return 'light';
  }
};

export const getCurrentSessionUser = (): any => {
  const state = getStoreState();
  if (!state) return null;

  const authState = state.authentification as IAuthentificationState;
  const appUser = state.application?.userConnected;
  const authUser = authState?.utilisateurData;

  if (appUser && Object.keys(appUser).length > 0) {
    return appUser;
  }

  return authUser || null;
};

export const getCurrentScopeUserId = (): number | null => getScopeUserIdFromUser(getCurrentSessionUser());

/** Jeton d'accès de la session, joint par apiClient à chaque requête protégée. */
export const getSessionToken = (): string => {
  const state = getStoreState();
  if (!state) return '';

  const authState = state.authentification as IAuthentificationState;
  return String(authState?.token || '');
};

/** Vrai si l'application considère qu'une session est ouverte. */
const sessionOuverte = (): boolean => {
  const state = getStoreState();

  return Boolean(state?.application?.userLoggedIn) && Boolean(state?.authentification?.connecter);
};

/**
 * Coupe la session quand l'API la refuse.
 *
 * Deux situations y mènent, et toutes deux donnaient le même écran : une liste
 * vide avec une alerte en bas, sans jamais revenir à la page de connexion.
 *
 *  - Le jeton vaut douze heures. Passé ce délai, rien ne le retirait du
 *    stockage : il repartait à chaque requête et l'API répondait 401.
 *  - Une session ouverte avant l'ajout des jetons a été conservée telle quelle
 *    par redux-persist : « connecté », mais avec un jeton vide. Aucun en-tête
 *    n'était alors envoyé, et l'API répondait 401 elle aussi — indéfiniment.
 *
 * Vu de l'écran, les deux ressemblent à une base vide. On ne regarde donc pas
 * si un jeton a été envoyé, mais si l'application se croit connectée : dans ce
 * cas, un 401 ne peut signifier qu'une chose, la session ne vaut plus rien.
 *
 * Le routeur, qui s'appuie sur « userLoggedIn » et « connecter », ramène
 * ensuite de lui-même à la page de connexion.
 *
 * Sur la page de connexion, aucune session n'est ouverte : un mot de passe
 * erroné, qui répond lui aussi 401, ne déclenche donc rien.
 *
 * Les actions sont désignées par leur nom plutôt qu'importées : les slices
 * utilisent déjà ce fichier, et un import direct créerait un cycle.
 *
 * La session refermée sert de garde : les requêtes parallèles tombées sur le
 * même refus ne rejouent pas la déconnexion.
 */
export const terminerSessionExpiree = (): void => {
  if (!globalStore?.dispatch || !sessionOuverte()) {
    return;
  }

  globalStore.dispatch({ type: 'authentification/setToken', payload: '' });
  globalStore.dispatch({ type: 'authentification/setConnecter', payload: false });
  globalStore.dispatch({ type: 'authentification/setUtilisateurData', payload: {} });
  globalStore.dispatch({ type: 'application/setUserLoggedIn', payload: false });
  globalStore.dispatch({ type: 'application/setUserConnected', payload: {} });
};
