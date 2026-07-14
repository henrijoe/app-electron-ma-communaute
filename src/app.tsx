import 'src/global.css';

import { Router } from 'src/routes/sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { ThemeProvider } from 'src/theme/theme-provider';

import { AppRuntimeBootstrap } from 'src/components/desktop/app-runtime-bootstrap';
import { DesktopSecurityBootstrap } from 'src/components/desktop/desktop-security-bootstrap';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  return (
    <ThemeProvider>
      <AppRuntimeBootstrap />
      <DesktopSecurityBootstrap />
      <Router />
    </ThemeProvider>
  );
}
