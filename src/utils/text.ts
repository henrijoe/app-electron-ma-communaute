// Normalise les textes qui arrivent mal encodes (mojibake) pour l'affichage UI.
export const normalizeText = (value: unknown): string => {
  if (value === null || value === undefined) return '';

  const raw = String(value);
  if (!raw) return '';

  let fixed = raw;

  // Tentative de re-decoder les chaines UTF-8 lues en latin1.
  try {
    const decoded = decodeURIComponent(escape(raw));
    const mojibakeScore = (input: string) => (input.match(/[ÃÂâ�]/g) || []).length;
    if (mojibakeScore(decoded) < mojibakeScore(raw)) {
      fixed = decoded;
    }
  } catch {
    // On garde la valeur initiale si le re-decodage echoue.
  }

  // Nettoyage des symboles courants d'encodage casse.
  return fixed
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/Â/g, '')
    .replace(/�/g, '')
    .trim();
};

export const normalizeForSearch = (value: unknown): string =>
  normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
