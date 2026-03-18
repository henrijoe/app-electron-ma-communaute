// storeUtils.ts
import type { IAppState } from "../store/appSlice";

let storeInstance: any = null;

export const setStore = (store: any) => {
  storeInstance = store;
};

export const getServerUrl = () => {
  if (!storeInstance) {
    console.warn('Store not initialized');
    return '';
  }
  
  const appState = storeInstance.getState()?.application as IAppState;
  return appState.serverUrl || '';
};

export const getStore = () => storeInstance;