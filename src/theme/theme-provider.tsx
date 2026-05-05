import type {} from '@mui/lab/themeAugmentation';
import type {} from '@mui/material/themeCssVarsAugmentation';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import CssBaseline from '@mui/material/CssBaseline';
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  useColorScheme,
} from '@mui/material/styles';

import type { IReduxState } from 'src/store/store';

import { createTheme } from './create-theme';

type Props = {
  children: React.ReactNode;
};

function ThemeModeSync({ children }: Props) {
  const { setMode } = useColorScheme();
  const themeMode = useSelector((state: IReduxState) => state.application.themeMode || 'light');

  useEffect(() => {
    setMode(themeMode);
  }, [setMode, themeMode]);

  return <>{children}</>;
}

export function ThemeProvider({ children }: Props) {
  const theme = createTheme();

  return (
    <CssVarsProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <ThemeModeSync>{children}</ThemeModeSync>
    </CssVarsProvider>
  );
}
