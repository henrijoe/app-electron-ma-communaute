// Construit une URL d'asset stable, quel que soit l'ecran ou la route en cours.
export const resolveStaticAssetUrl = (assetPath: string): string => {
  if (!assetPath) {
    return assetPath;
  }

  // On laisse intacts les chemins deja complets ou speciaux.
  if (/^(https?:|data:|blob:|file:)/i.test(assetPath)) {
    return assetPath;
  }

  const normalizedAssetPath = assetPath.replace(/^\/+/, '');
  // On repart toujours de la racine de l'application pour eviter les chemins casses sur les pages detail.
  const basePath = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  // En mode Electron packagé, `origin` peut être `null`/`file://` et casser les assets publics.
  const currentLocation =
    typeof window !== 'undefined' ? window.location.href : 'http://localhost/';
  const baseUrl = new URL(basePath, currentLocation).toString();

  return new URL(normalizedAssetPath, baseUrl).toString();
};
