import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { ComptabiliteView } from 'src/sections/comptabilite/view';

export default function ComptabilitePage() {
  return (
    <>
      <Helmet>
        <title>{`Comptabilité - ${CONFIG.appName}`}</title>
      </Helmet>

      <ComptabiliteView />
    </>
  );
}
