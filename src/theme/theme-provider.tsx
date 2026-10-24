import type {} from '@mui/lab/themeAugmentation';
import type {} from '@mui/material/themeCssVarsAugmentation';

import { useMemo, useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useSelector } from 'react-redux';

import CssBaseline from '@mui/material/CssBaseline';
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  useColorScheme,
} from '@mui/material/styles';

import type { IReduxState } from 'src/store/store';

import { createTheme } from './create-theme';
import {
  lireAccent,
  ecrireAccent,
  normaliserCouleur,
  COULEUR_PAR_DEFAUT,
  COULEURS_PROPOSEES,
} from './accents';

type Props = {
  children: React.ReactNode;
};

type ContexteAccent = {
  /** La teinte choisie, au format `#RRGGBB`. */
  accent: string;
  changerAccent: (couleur: string) => void;
  retablirAccent: () => void;
};

const AccentContext = createContext<ContexteAccent>({
  accent: COULEUR_PAR_DEFAUT,
  changerAccent: () => {},
  retablirAccent: () => {},
});

/** Couleur d'accent courante, et de quoi en changer. */
export const useAccent = () => useContext(AccentContext);

export { COULEUR_PAR_DEFAUT, COULEURS_PROPOSEES };

function ThemeModeSync({ children }: Props) {
  const { setMode } = useColorScheme();
  const themeMode = useSelector((state: IReduxState) => state.application.themeMode || 'light');

  useEffect(() => {
    setMode(themeMode);
  }, [setMode, themeMode]);

  return <>{children}</>;
}

export function ThemeProvider({ children }: Props) {
  const [accent, setAccent] = useState<string>(() => lireAccent());

  // Le thème n'est reconstruit que lorsque l'accent change : le rebâtir à chaque
  // rendu redessinerait toute l'application pour rien.
  const theme = useMemo(() => createTheme(accent), [accent]);

  const changerAccent = useCallback((couleur: string) => {
    // Une teinte invalide est ignorée : sans ce garde-fou, un collage approximatif
    // casserait tout le thème.
    const normalisee = normaliserCouleur(couleur);
    if (!normalisee) {
      return;
    }

    setAccent(normalisee);
    ecrireAccent(normalisee);
  }, []);

  const retablirAccent = useCallback(() => {
    setAccent(COULEUR_PAR_DEFAUT);
    ecrireAccent(COULEUR_PAR_DEFAUT);
  }, []);

  const valeur = useMemo(
    () => ({ accent, changerAccent, retablirAccent }),
    [accent, changerAccent, retablirAccent]
  );

  return (
    <AccentContext.Provider value={valeur}>
      {/* `key` force la reconstruction des variables CSS : sans elle, le
          fournisseur garde les couleurs du premier thème qu'il a reçu. */}
      <CssVarsProvider key={accent} theme={theme} defaultMode="light">
        <CssBaseline />
        <ThemeModeSync>{children}</ThemeModeSync>
      </CssVarsProvider>
    </AccentContext.Provider>
  );
}
