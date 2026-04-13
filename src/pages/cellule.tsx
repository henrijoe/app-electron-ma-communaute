import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { CelluleView } from 'src/sections/cellule/view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{`Cellule - ${CONFIG.appName}`}</title>
      </Helmet>

      <CelluleView />
    </>
  );
}
