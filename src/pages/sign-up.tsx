import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { SignUpView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Inscription - ${CONFIG.appName}`}</title>
      </Helmet>

      <SignUpView />
    </>
  );
}
