// functions.ts
import type { IAppState } from "../store/appSlice";

// Variable globale pour stocker le store
let globalStore: any = null;

// Enregistre l'instance Redux dans une variable globale reutilisable.
export const setGlobalStore = (store: any) => {
  // Remplace la reference courante du store par celle recue en parametre.
  globalStore = store;
};

// Indique si l'application tourne en mode developpement Vite.
export const isDev = () => import.meta.env.DEV;

// Retourne l'URL du serveur en lisant l'etat Redux global.
export const getServerUrl = (): string => {
  // Si le store n'a pas encore ete initialise, on journalise l'alerte.
  if (!globalStore) {
    // Affiche un avertissement utile pendant le debug.
    console.warn('Store not initialized');
    // Retourne une chaine vide pour eviter une erreur d'acces au store.
    return '';
  }
  
  // Encadre l'acces au store pour capturer toute erreur inattendue.
  try {
    // Recupere la partie `application` de l'etat global et la type.
    const appState = globalStore.getState()?.application as IAppState;
    // Renvoie l'URL du serveur si elle existe, sinon une chaine vide.
    return appState.serverUrl || '';
  } catch (error) {
    // Trace l'erreur pour faciliter le diagnostic.
    console.error('Error getting server URL:', error);
    // Retourne une valeur par defaut neutre en cas d'echec.
    return '';
  }
};

// Retourne le mode de connexion courant (`local` ou `online`).
export const getConnectionMode = (): 'local' | 'online' => {
  // Sans store initialise, on force le mode local par securite.
  if (!globalStore) {
    // Valeur par defaut avant que Redux soit disponible.
    return 'local';
  }

  // Protege la lecture du store contre les erreurs runtime.
  try {
    // Recupere la branche `application` de l'etat global.
    const appState = globalStore.getState()?.application as IAppState;
    // Renvoie le mode enregistre ou `local` si absent.
    return appState.connectionMode || 'local';
  } catch (error) {
    // Ecrit l'erreur dans la console pour le debug.
    console.error('Error getting connection mode:', error);
    // Revient au mode local si la lecture du store echoue.
    return 'local';
  }
};
