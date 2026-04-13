import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { SocialView } from 'src/sections/social/view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{`Cas sociaux - ${CONFIG.appName}`}</title>
      </Helmet>

      <SocialView />
    </>
  );
}
