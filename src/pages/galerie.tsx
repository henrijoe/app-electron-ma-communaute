import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { GalerieView } from 'src/sections/galerie/view';

export default function GaleriePage() {
  return (
    <>
      <Helmet>
        <title>{`Galerie - ${CONFIG.appName}`}</title>
      </Helmet>

      <GalerieView />
    </>
  );
}
