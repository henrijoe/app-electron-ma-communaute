import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CulteView } from 'src/sections/culte/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Culte - ${CONFIG.appName}`}</title>
      </Helmet>

      <CulteView/>
    </>
  );
}
