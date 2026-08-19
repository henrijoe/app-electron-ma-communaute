const ACTION_JOURNAL_LEGACY_STORAGE_KEY = 'ma-communaute-action-journal-v1';
const ACTION_JOURNAL_STORAGE_PREFIX = `${ACTION_JOURNAL_LEGACY_STORAGE_KEY}:scope`;
const ACTION_JOURNAL_MAX_ENTRIES = 500;

export type ActionJournalEntry = {
  id: string;
  date: string;
  user: string;
  action: string;
  module: string;
  details?: string;
};

const slugifyScope = (value: unknown): string =>
  String(value || 'eglise')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'eglise';

const readPersistedContext = (): { storageKey: string; userLabel: string } => {
  if (typeof window === 'undefined') {
    return {
      storageKey: `${ACTION_JOURNAL_STORAGE_PREFIX}:unknown`,
      userLabel: 'Utilisateur inconnu',
    };
  }

  try {
    const persistedRoot = JSON.parse(localStorage.getItem('persist:root') || '{}');
    const application = persistedRoot.application ? JSON.parse(persistedRoot.application) : {};
    const auth = persistedRoot.authentification ? JSON.parse(persistedRoot.authentification) : {};
    const user = application.userConnected || auth.utilisateurData || {};
    const fullName = [user.prenomUtilisateur, user.nomUtilisateur].filter(Boolean).join(' ').trim();
    const accountId = Number(user.idUtilisateurParent || user.idUtilisateur || 0);
    const churchSlug = slugifyScope(user.nomEgliseCourt || user.nomTemple);
    const scope = accountId > 0 ? `account-${accountId}` : churchSlug;

    return {
      storageKey: `${ACTION_JOURNAL_STORAGE_PREFIX}:${scope}`,
      userLabel: fullName || user.nomUtilisateur || 'Utilisateur connecté',
    };
  } catch (_error) {
    return {
      storageKey: `${ACTION_JOURNAL_STORAGE_PREFIX}:unknown`,
      userLabel: 'Utilisateur connecté',
    };
  }
};

export const getActionJournalEntries = (): ActionJournalEntry[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const { storageKey } = readPersistedContext();
    const entries = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(entries) ? entries : [];
  } catch (_error) {
    return [];
  }
};

export const clearActionJournalEntries = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const { storageKey } = readPersistedContext();
  localStorage.removeItem(storageKey);
  localStorage.removeItem(ACTION_JOURNAL_LEGACY_STORAGE_KEY);
};

export const recordActionJournalEntry = (
  entry: Omit<ActionJournalEntry, 'id' | 'date' | 'user'>
) => {
  if (typeof window === 'undefined') {
    return;
  }

  const { storageKey, userLabel } = readPersistedContext();
  const entries = getActionJournalEntries();
  const nextEntry: ActionJournalEntry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: new Date().toISOString(),
    user: userLabel,
    ...entry,
    details: entry.details || '',
  };

  localStorage.setItem(
    storageKey,
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
    details: '',
  };
};
