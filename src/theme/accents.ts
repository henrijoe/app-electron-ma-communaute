import { darken, lighten, rgbToHex, getContrastRatio } from '@mui/material/styles';

// ----------------------------------------------------------------------
// Couleur d'accent de l'application.
//
// L'accent remplace la couleur « primary » du thème. Tout ce qui s'y réfère
// suit : boutons, icônes, liens, pastilles, onglet actif, barre latérale. Les
// écrans n'ont rien à savoir de ce réglage.
//
// N'importe quelle teinte peut être choisie, pas seulement celles proposées :
// la gamme complète et la couleur du texte s'en déduisent.

export const COULEUR_PAR_DEFAUT = '#1877F2';

/** Le gris très sombre du thème, préféré au noir pur, moins dur à l'œil. */
const TEXTE_SOMBRE = '#1C252E';

/** Les teintes proposées d'un clic. La couleur libre reste possible à côté. */
export const COULEURS_PROPOSEES: { libelle: string; hex: string }[] = [
  { libelle: 'Bleu', hex: '#1877F2' },
  { libelle: 'Vert', hex: '#22A355' },
  { libelle: 'Turquoise', hex: '#00B8D9' },
  { libelle: 'Bleu nuit', hex: '#2F3E6E' },
  { libelle: 'Violet', hex: '#7635DC' },
  { libelle: 'Bordeaux', hex: '#A4133C' },
  { libelle: 'Rouge', hex: '#E5452F' },
  { libelle: 'Orange', hex: '#E8831A' },
  { libelle: 'Marron', hex: '#8D5524' },
  { libelle: 'Ardoise', hex: '#4A5568' },
];

export type GammeAccent = {
  lighter: string;
  light: string;
  main: string;
  dark: string;
  darker: string;
  contrastText: string;
};

/** `#abc` et `abc` sont acceptés : un collage manuel prend souvent ces formes. */
export const normaliserCouleur = (valeur: string): string | null => {
  const brute = String(valeur || '').trim().replace(/^#/, '');

  if (/^[0-9a-f]{3}$/i.test(brute)) {
    const [r, v, b] = brute.split('');
    return `#${r}${r}${v}${v}${b}${b}`.toUpperCase();
  }

  if (/^[0-9a-f]{6}$/i.test(brute)) {
    return `#${brute}`.toUpperCase();
  }

  return null;
};

/**
 * Gamme complète déduite d'une seule teinte.
 *
 * Le texte posé sur la couleur est choisi par **contraste mesuré** : on garde
 * celui des deux — blanc ou presque-noir — qui se détache le mieux. Du blanc sur
 * un orange clair serait illisible, du noir sur un bleu nuit aussi.
 *
 * Comparer les deux vaut mieux que franchir un seuil : sur un bleu moyen, aucune
 * des deux options n'atteint 4,5, et un test par seuil retiendrait alors le
 * mauvais choix par défaut.
 *
 * Chaque nuance repasse en hexadécimal : `lighten` et `darken` renvoient du
 * `rgb(...)`, que la fabrique de palette du thème refuse.
 */
export const construireGamme = (couleur: string): GammeAccent => {
  const main = normaliserCouleur(couleur) || COULEUR_PAR_DEFAUT;

  return {
    lighter: rgbToHex(lighten(main, 0.82)).toUpperCase(),
    light: rgbToHex(lighten(main, 0.45)).toUpperCase(),
    main,
    dark: rgbToHex(darken(main, 0.28)).toUpperCase(),
    darker: rgbToHex(darken(main, 0.58)).toUpperCase(),
    contrastText:
      getContrastRatio(main, '#FFFFFF') >= getContrastRatio(main, TEXTE_SOMBRE)
        ? '#FFFFFF'
        : TEXTE_SOMBRE,
  };
};

const CLE_STOCKAGE = 'ma-communaute:accent';

/**
 * Couleur retenue sur cet appareil.
 *
 * Le réglage est propre à chaque personne et à son navigateur : il n'est pas
 * enregistré en base, et personne n'impose sa couleur aux autres.
 *
 * Toute lecture est protégée : en navigation privée ou avec les données de site
 * bloquées, `localStorage` peut lever au lieu de renvoyer vide.
 */
export const lireAccent = (): string => {
  try {
    return normaliserCouleur(window.localStorage.getItem(CLE_STOCKAGE) || '') || COULEUR_PAR_DEFAUT;
  } catch (_error) {
    return COULEUR_PAR_DEFAUT;
  }
};

export const ecrireAccent = (couleur: string): void => {
  try {
    window.localStorage.setItem(CLE_STOCKAGE, couleur);
  } catch (_error) {
    // Sans stockage, la couleur vaut pour la session en cours : c'est dégradé,
    // mais l'application reste utilisable.
  }
};
