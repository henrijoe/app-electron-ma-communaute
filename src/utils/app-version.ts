import packageJson from '../../package.json';

const formatDateLabel = (value?: string): string => {
  if (!value) {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date());
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .format(date);
};

export const APP_VERSION =
  (typeof __APP_VERSION__ === 'string' && __APP_VERSION__) || packageJson.version || '1.0.0';

export const APP_BUILD_DATE =
  (typeof __APP_BUILD_DATE__ === 'string' && __APP_BUILD_DATE__) ||
  formatDateLabel(import.meta.env.VITE_APP_BUILD_DATE);

export const APP_VERSION_LABEL = `v. ${APP_VERSION} (${APP_BUILD_DATE})`;
