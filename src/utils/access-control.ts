import type { IReduxState } from 'src/store/store';
import type { ModulePermissionKey, IUtilisateur, UserRole } from 'src/store/userSlice';

export const ALL_MODULE_PERMISSIONS: ModulePermissionKey[] = [
  'dashboard',
  'user',
  'culte',
  'departement',
  'cellule',
  'groupe',
  'social',
  'galerie',
  'agenda',
  'comptabilite',
  'settings',
];

export const MODULE_PERMISSION_LABELS: Record<ModulePermissionKey, string> = {
  dashboard: 'Dashboard',
  user: 'Membres',
  culte: 'Cultes',
  departement: 'Departements',
  cellule: 'Cellules',
  groupe: 'Groupes',
  social: 'Cas sociaux',
  galerie: 'Galerie',
  agenda: 'Agenda',
  comptabilite: 'Comptabilite',
  settings: 'Parametres',
};

export const parsePermissions = (rawPermissions?: string | null): ModulePermissionKey[] => {
  if (!rawPermissions) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawPermissions);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is ModulePermissionKey => ALL_MODULE_PERMISSIONS.includes(item));
  } catch (_error) {
    return [];
  }
};

export const stringifyPermissions = (permissions: ModulePermissionKey[]): string =>
  JSON.stringify(Array.from(new Set(permissions)).filter((item) => ALL_MODULE_PERMISSIONS.includes(item)));

export const getUserRole = (user?: Partial<IUtilisateur> | null): UserRole => {
  const role = String(user?.roleUtilisateur || '').trim();

  if (role === 'gestionnaire' || role === 'lecteur' || role === 'admin') {
    return role;
  }

  return 'admin';
};

export const getEffectivePermissions = (user?: Partial<IUtilisateur> | null): ModulePermissionKey[] => {
  const role = getUserRole(user);

  if (role === 'admin') {
    return ALL_MODULE_PERMISSIONS;
  }

  const parsedPermissions = parsePermissions(user?.permissionsUtilisateur || '');
  return parsedPermissions.length > 0 ? parsedPermissions : ['dashboard'];
};

export const isReadOnlyUser = (user?: Partial<IUtilisateur> | null): boolean => getUserRole(user) === 'lecteur';

export const getScopeUserIdFromUser = (user?: Partial<IUtilisateur> | null): number | null => {
  const parentId = Number(user?.idUtilisateurParent || 0);
  const currentId = Number(user?.idUtilisateur || 0);

  if (parentId > 0) {
    return parentId;
  }

  return currentId > 0 ? currentId : null;
};

export const canAccessModule = (user: Partial<IUtilisateur> | null | undefined, permission: ModulePermissionKey): boolean =>
  getEffectivePermissions(user).includes(permission);

export const canManageModule = (user: Partial<IUtilisateur> | null | undefined, permission: ModulePermissionKey): boolean =>
  canAccessModule(user, permission) && !isReadOnlyUser(user);

export const getSessionUser = (state: IReduxState | any): Partial<IUtilisateur> | null => {
  const appUser = state?.application?.userConnected || null;
  const authUser = state?.authentification?.utilisateurData || null;
  return appUser && Object.keys(appUser).length > 0 ? appUser : authUser;
};

export const getSessionScopeUserId = (state: IReduxState | any): number | null => getScopeUserIdFromUser(getSessionUser(state));
