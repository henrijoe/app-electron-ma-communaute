const ACTION_JOURNAL_STORAGE_KEY = 'ma-communaute-action-journal-v1';
const ACTION_JOURNAL_MAX_ENTRIES = 500;

export type ActionJournalEntry = {
  id: string;
  date: string;
  user: string;
  action: string;
  module: string;
  details: string;
};

const readPersistedUserLabel = (): string => {
  if (typeof window === 'undefined') {
    return 'Utilisateur inconnu';
  }

  try {
    const persistedRoot = JSON.parse(localStorage.getItem('persist:root') || '{}');
    const application = persistedRoot.application ? JSON.parse(persistedRoot.application) : {};
    const auth = persistedRoot.authentification ? JSON.parse(persistedRoot.authentification) : {};
    const user = application.userConnected || auth.utilisateurData || {};
    const fullName = [user.prenomUtilisateur, user.nomUtilisateur].filter(Boolean).join(' ').trim();

    return fullName || user.nomUtilisateur || 'Utilisateur connecté';
  } catch (_error) {
    return 'Utilisateur connecté';
  }
};

export const getActionJournalEntries = (): ActionJournalEntry[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const entries = JSON.parse(localStorage.getItem(ACTION_JOURNAL_STORAGE_KEY) || '[]');
    return Array.isArray(entries) ? entries : [];
  } catch (_error) {
    return [];
  }
};

export const clearActionJournalEntries = () => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(ACTION_JOURNAL_STORAGE_KEY);
};

export const recordActionJournalEntry = (entry: Omit<ActionJournalEntry, 'id' | 'date' | 'user'>) => {
  if (typeof window === 'undefined') {
    return;
  }

  const entries = getActionJournalEntries();
  const nextEntry: ActionJournalEntry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: new Date().toISOString(),
    user: readPersistedUserLabel(),
    ...entry,
  };

  localStorage.setItem(
    ACTION_JOURNAL_STORAGE_KEY,
    JSON.stringify([nextEntry, ...entries].slice(0, ACTION_JOURNAL_MAX_ENTRIES))
  );
};

export const describeJournalAction = (method: string, route: string) => {
  const normalizedRoute = route.toLowerCase();
  const normalizedMethod = method.toUpperCase();

  if (/login|connexion|server-info|status|recup|liste|byutilisateur/.test(normalizedRoute)) {
    return null;
  }

  const module =
    normalizedRoute.match(/membre/)
      ? 'Membres'
      : normalizedRoute.match(/culte/)
        ? 'Cultes'
        : normalizedRoute.match(/departement/)
          ? 'Départements'
          : normalizedRoute.match(/cellule/)
            ? 'Cellules'
            : normalizedRoute.match(/groupe/)
              ? 'Groupes'
              : normalizedRoute.match(/comptabil|offrande|depense|entree|sortie/)
                ? 'Comptabilité'
                : normalizedRoute.match(/settings|param|utilisateur|desktop-control/)
                  ? 'Paramètres'
                  : normalizedRoute.match(/social|mariage|naissance|deces|maladie/)
                    ? 'Cas sociaux'
                    : normalizedRoute.match(/galerie/)
                      ? 'Galerie'
                      : normalizedRoute.match(/agenda|evenement/)
                        ? 'Agenda'
                        : 'Application';

  const action =
    normalizedRoute.match(/supprim|delete/) || normalizedMethod === 'DELETE'
      ? 'Suppression'
      : normalizedRoute.match(/modif|update/) || normalizedMethod === 'PUT' || normalizedMethod === 'PATCH'
        ? 'Modification'
        : normalizedRoute.match(/restore|restaur/)
          ? 'Restauration'
          : normalizedRoute.match(/export/)
            ? 'Export'
            : 'Enregistrement';

  return {
    action,
    module,
    details: `${normalizedMethod} ${route}`,
  };
};
