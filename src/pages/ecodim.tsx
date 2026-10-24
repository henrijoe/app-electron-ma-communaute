import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { EcodimView } from 'src/sections/ecodim/view/ecodim-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Ecodim - ${CONFIG.appName}`}</title>
      </Helmet>

      <EcodimView />
    </>
  );
}
