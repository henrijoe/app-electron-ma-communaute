import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { GroupeView } from 'src/sections/groupe/view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{`Groupe - ${CONFIG.appName}`}</title>
      </Helmet>

      <GroupeView />
    </>
  );
}
