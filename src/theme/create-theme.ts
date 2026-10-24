import type { Theme } from '@mui/material/styles';

import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

import { shadows, typography, components, colorSchemes, customShadows } from './core';
import { createPaletteChannel } from './styles';
import { construireGamme, COULEUR_PAR_DEFAUT } from './accents';

// ----------------------------------------------------------------------

/**
 * Remplace la couleur « primary » des deux schémas par l'accent choisi.
 *
 * Les schémas clair et sombre partagent la même gamme d'accent : ce sont les
 * fonds et les textes qui changent entre les deux, pas la couleur de marque.
 */
const appliquerAccent = (couleur: string) => {
  const primary = createPaletteChannel(construireGamme(couleur));

  return {
    light: {
      ...colorSchemes.light,
      palette: { ...colorSchemes.light?.palette, primary },
    },
    dark: {
      ...colorSchemes.dark,
      palette: { ...colorSchemes.dark?.palette, primary },
    },
  };
};

export function createTheme(couleurAccent: string = COULEUR_PAR_DEFAUT): Theme {
  const initialTheme = {
    colorSchemes: appliquerAccent(couleurAccent), shadows: shadows(),
 customShadows: customShadows(),
 shape: { borderRadius: 8 },
    components,
    typography, cssVarPrefix: '',
    shouldSkipGeneratingVar,
  };

  const theme = extendTheme(initialTheme);

  return theme;
}

// ----------------------------------------------------------------------

function shouldSkipGeneratingVar(keys: string[], value: string | number): boolean {
  const skipGlobalKeys = [
    'mixins',
    'overlays',
    'direction',
    'typography',
    'breakpoints',
    'transitions',
    'cssVarPrefix',
    'unstable_sxConfig',
  ];

  const skipPaletteKeys: {
    [key: string]: string[];
  } = {
 global: ['tonalOffset', 'dividerChannel', 'contrastThreshold'],
 grey: ['A100', 'A200', 'A400', 'A700'],
 text: ['icon'],
  };

  const isPaletteKey = keys[0] === 'palette';

  if (isPaletteKey) {
    const paletteType = keys[1];
    const skipKeys = skipPaletteKeys[paletteType] || skipPaletteKeys.global;

    return keys.some((key) => skipKeys?.includes(key));
  }

  return keys.some((key) => skipGlobalKeys?.includes(key));
}
