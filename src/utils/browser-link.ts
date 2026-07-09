export type LinkedBrowserContext = {
  linked: true;
  browserUrl: string;
  username: string;
  accountId: number | null;
  churchName: string;
  linkedAt: string;
};

const STORAGE_KEY = 'communaute-linked-browser-context';

const normalizeUrl = (value: string): string =>
  String(value || '')
    .trim()
    .replace(/\/+$/, '');

const parsePositiveInteger = (value: unknown): number | null => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return Math.trunc(parsedValue);
};

const canUseBrowserStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const readLinkedBrowserContext = (): LinkedBrowserContext | null => {
  if (!canUseBrowserStorage()) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    const browserUrl = normalizeUrl(String(parsedValue?.browserUrl || ''));

    if (!browserUrl) {
      return null;
    }

    return {
      linked: true,
      browserUrl,
      username: String(parsedValue?.username || '').trim(),
      accountId: parsePositiveInteger(parsedValue?.accountId),
      churchName: String(parsedValue?.churchName || '').trim(),
      linkedAt: String(parsedValue?.linkedAt || new Date().toISOString()),
    };
  } catch (_error) {
    return null;
  }
};

export const saveLinkedBrowserContext = (
  value: Partial<LinkedBrowserContext>
): LinkedBrowserContext | null => {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const browserUrl = normalizeUrl(String(value.browserUrl || window.location.origin || ''));

  if (!browserUrl) {
    return null;
  }

  const context: LinkedBrowserContext = {
    linked: true,
    browserUrl,
    username: String(value.username || '').trim(),
    accountId: parsePositiveInteger(value.accountId),
    churchName: String(value.churchName || '').trim(),
    linkedAt: String(value.linkedAt || new Date().toISOString()),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  } catch (_error) {
    return context;
  }

  return context;
};

export const captureLinkedBrowserContextFromCurrentUrl = (): LinkedBrowserContext | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const currentUrl = new URL(window.location.href);

    if (currentUrl.searchParams.get('linked') !== '1') {
      return readLinkedBrowserContext();
    }

    const context = saveLinkedBrowserContext({
      browserUrl: currentUrl.origin,
      username: currentUrl.searchParams.get('user') || '',
      accountId: parsePositiveInteger(currentUrl.searchParams.get('accountId')),
      churchName: currentUrl.searchParams.get('church') || '',
    });

    currentUrl.searchParams.delete('linked');
    currentUrl.searchParams.delete('user');
    currentUrl.searchParams.delete('accountId');
    currentUrl.searchParams.delete('church');
    window.history.replaceState({}, '', currentUrl.toString());

    return context;
  } catch (_error) {
    return readLinkedBrowserContext();
  }
};

export const buildLinkedBrowserSignInUrl = (
  baseUrl: string,
  {
    username,
    accountId,
    churchName,
  }: {
    username?: string;
    accountId?: number | null;
    churchName?: string;
  }
): string => {
  const normalizedBaseUrl = normalizeUrl(baseUrl);
  const signInUrl = new URL(
    '/sign-in',
    normalizedBaseUrl.endsWith('/') ? normalizedBaseUrl : `${normalizedBaseUrl}/`
  );

  signInUrl.searchParams.set('linked', '1');

  if (String(username || '').trim()) {
    signInUrl.searchParams.set('user', String(username).trim());
  }

  if (parsePositiveInteger(accountId)) {
    signInUrl.searchParams.set('accountId', String(parsePositiveInteger(accountId)));
  }

  if (String(churchName || '').trim()) {
    signInUrl.searchParams.set('church', String(churchName).trim());
  }

  return signInUrl.toString();
};
