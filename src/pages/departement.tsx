import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { DepartementView } from 'src/sections/departement/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Département - ${CONFIG.appName}`}</title>
      </Helmet>

      <DepartementView/>
    </>
  );
}
