import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PublicEnfantRegistrationView } from 'src/sections/ecodim/view/public-enfant-registration-view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{`Inscription enfant - ${CONFIG.appName}`}</title>
      </Helmet>

      <PublicEnfantRegistrationView />
    </>
  );
}
