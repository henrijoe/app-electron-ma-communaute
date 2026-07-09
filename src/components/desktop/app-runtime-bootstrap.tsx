import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setConnectionMode, setServerUrl, setUserConnected } from 'src/store/appSlice';
import type { IReduxState } from 'src/store/store';
import { setUtilisateurData, type IUtilisateur } from 'src/store/userSlice';
import { getScopeUserIdFromUser, getSessionUser } from 'src/utils/access-control';
import {
  captureLinkedBrowserContextFromCurrentUrl,
  readLinkedBrowserContext,
  saveLinkedBrowserContext,
} from 'src/utils/browser-link';
import { sanitizeSensitiveData } from 'src/utils/sensitive-data';
import { subscribeToCommunauteEvent } from 'src/utils/socket-client';

const LOCAL_API_PORT = '49300';

const SHARED_CHURCH_FIELDS: Array<keyof IUtilisateur> = [
  'logoEglise',
  'nomTemple',
  'nomEgliseCourt',
  'lieuEglise',
  'telephoneSecretariatEglise',
  'pasteurPrincipal',
  'pasteurSecondaire',
  'pasteurTroisieme',
  'telephonePasteurPrincipal',
  'telephonePasteurSecondaire',
  'telephonePasteurTroisieme',
  'capaciteAccueilEglise',
  'nombreCultesDimanche',
  'emailEglise',
  'boitePostaleEglise',
  'dateCreationEglise',
  'nombrePasteursEglise',
  'nombreAnciensEglise',
  'nombreDiacresEglise',
  'modeVersetDashboard',
  'versetDashboardReference',
  'versetDashboardTexte',
];

const DIRECT_USER_FIELDS: Array<keyof IUtilisateur> = [
  'nomUtilisateur',
  'prenomUtilisateur',
  'telephoneUtilisateur',
  'email',
  'roleUtilisateur',
  'permissionsUtilisateur',
  'actifUtilisateur',
];

const isDesktopRuntime = (): boolean =>
  typeof window !== 'undefined' && Boolean((window as any)?.desktopApp?.isDesktop);

const isLoopbackHost = (hostname?: string): boolean =>
  !hostname ||
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '::1' ||
  hostname === '[::1]';

const isPrivateIpv4Address = (value: string): boolean =>
  value.startsWith('10.') ||
  value.startsWith('192.168.') ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(value);

const shouldPreferCurrentBrowserLocalApi = (): boolean => {
  if (typeof window === 'undefined' || isDesktopRuntime()) {
    return false;
  }

  const { hostname, port } = window.location;

  return (
    port === LOCAL_API_PORT ||
    port === '5173' ||
    port === '3039' ||
    isLoopbackHost(hostname) ||
    isPrivateIpv4Address(hostname)
  );
};

const resolveCurrentBrowserLocalApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return `http://localhost:${LOCAL_API_PORT}`;
  }

  const { protocol, hostname } = window.location;

  if (isLoopbackHost(hostname)) {
    return `http://localhost:${LOCAL_API_PORT}`;
  }

  return `${protocol}//${hostname}:${LOCAL_API_PORT}`;
};

const pickPatch = (
  payload: Record<string, unknown>,
  fields: Array<keyof IUtilisateur>
): Partial<IUtilisateur> =>
  fields.reduce<Partial<IUtilisateur>>((accumulator, field) => {
    if (field in payload) {
      accumulator[field] = payload[field] as never;
    }

    return accumulator;
  }, {});

export function AppRuntimeBootstrap() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state: IReduxState) => getSessionUser(state));
  const currentSessionUserId = Number(sessionUser?.idUtilisateur || 0);
  const currentAccountId = getScopeUserIdFromUser(sessionUser) || 0;

  useEffect(() => {
    if (isDesktopRuntime()) {
      return;
    }

    const linkedContext = captureLinkedBrowserContextFromCurrentUrl();

    if (!linkedContext && !shouldPreferCurrentBrowserLocalApi()) {
      return;
    }

    dispatch(setConnectionMode('local'));
    dispatch(setServerUrl(linkedContext?.browserUrl || resolveCurrentBrowserLocalApiUrl()));
  }, [dispatch]);

  useEffect(() => {
    if (isDesktopRuntime() || !sessionUser || !currentAccountId) {
      return;
    }

    const linkedContext = readLinkedBrowserContext();

    if (!linkedContext) {
      return;
    }

    saveLinkedBrowserContext({
      ...linkedContext,
      username: sessionUser.nomUtilisateur || linkedContext.username,
      accountId: currentAccountId,
      churchName: sessionUser.nomEgliseCourt || sessionUser.nomTemple || linkedContext.churchName,
    });
  }, [currentAccountId, sessionUser]);

  useEffect(() => {
    if (!sessionUser || (!currentSessionUserId && !currentAccountId)) {
      return undefined;
    }

    return subscribeToCommunauteEvent('modifierUtilisateur', (payload = {}) => {
      const targetUserId = Number(payload.idUtilisateur || 0);
      const targetParentId = Number(payload.idUtilisateurParent || 0);
      const targetsCurrentUser = targetUserId > 0 && targetUserId === currentSessionUserId;
      const targetsCurrentChurch =
        currentAccountId > 0 &&
        (targetUserId === currentAccountId || targetParentId === currentAccountId);

      if (!targetsCurrentUser && !targetsCurrentChurch) {
        return;
      }

      const sharedChurchPatch = pickPatch(payload, SHARED_CHURCH_FIELDS);
      const directUserPatch = targetsCurrentUser ? pickPatch(payload, DIRECT_USER_FIELDS) : {};

      if (
        Object.keys(sharedChurchPatch).length === 0 &&
        Object.keys(directUserPatch).length === 0
      ) {
        return;
      }

      const nextSessionUser = sanitizeSensitiveData({
        ...sessionUser,
        ...sharedChurchPatch,
        ...directUserPatch,
        __syncAt: Number(payload.__syncAt || Date.now()),
      }) as IUtilisateur;

      dispatch(setUtilisateurData(nextSessionUser));
      dispatch(setUserConnected(nextSessionUser));
    });
  }, [currentAccountId, currentSessionUserId, dispatch, sessionUser]);

  return null;
}
