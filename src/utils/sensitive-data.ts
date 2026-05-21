const SENSITIVE_KEYS = new Set(['password', 'confirmPassword']);

export const sanitizeSensitiveData = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeSensitiveData(item)) as T;
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const sanitized: Record<string, unknown> = {};

  Object.entries(value as Record<string, unknown>).forEach(([key, entryValue]) => {
    if (SENSITIVE_KEYS.has(key)) {
      return;
    }

    sanitized[key] = sanitizeSensitiveData(entryValue);
  });

  return sanitized as T;
};
