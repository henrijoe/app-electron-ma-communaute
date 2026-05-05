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
