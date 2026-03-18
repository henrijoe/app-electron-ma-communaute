import ReactDOM from 'react-dom/client';
import { Suspense, StrictMode } from 'react';
import { CookiesProvider } from "react-cookie";
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';

import App from './app';
import { setGlobalStore } from './utils/functions';
import store from './store/store';

// Initialisez le store global pour les utilitaires
setGlobalStore(store);

const persistor = persistStore(store);
const AppRouter = (window as any)?.desktopApp?.isDesktop ? HashRouter : BrowserRouter;

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HelmetProvider>
          <AppRouter>
            <Suspense>
              <CookiesProvider>
                <App />
              </CookiesProvider>
            </Suspense>
          </AppRouter>
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
