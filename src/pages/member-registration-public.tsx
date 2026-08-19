import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PublicMemberRegistrationView } from 'src/sections/user/view/public-member-registration-view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{`Inscription membre - ${CONFIG.appName}`}</title>
      </Helmet>

      <PublicMemberRegistrationView />
    </>
  );
}
