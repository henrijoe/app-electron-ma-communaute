// Construit une URL d'asset compatible web + Electron packagé.
export const resolveStaticAssetUrl = (assetPath: string): string => {
  if (!assetPath) {
    return assetPath;
  }

  // On laisse intacts les chemins déjà complets ou spéciaux.
  if (/^(https?:|data:|blob:|file:)/i.test(assetPath)) {
    return assetPath;
  }

  const normalizedAssetPath = assetPath.replace(/^\/+/, '');
  const baseUrl = typeof document !== 'undefined' ? document.baseURI : window.location.href;

  return new URL(normalizedAssetPath, baseUrl).toString();
};

