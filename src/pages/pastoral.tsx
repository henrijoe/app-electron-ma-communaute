import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { PastoralView } from 'src/sections/pastoral/view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{`Suivi pastoral - ${CONFIG.appName}`}</title>
      </Helmet>

      <PastoralView />
    </>
  );
}
