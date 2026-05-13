import packageJson from '../../package.json';

const formatDateLabel = (value?: string): string => {
  if (!value) {
    return '12-05-2026';
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
    .format(date)
    .replace(/\//g, '-');
};

export const APP_VERSION = packageJson.version || '1.0.0';

export const APP_BUILD_DATE = formatDateLabel(import.meta.env.VITE_APP_BUILD_DATE);

export const APP_VERSION_LABEL = `Version ${APP_VERSION} (${APP_BUILD_DATE})`;
