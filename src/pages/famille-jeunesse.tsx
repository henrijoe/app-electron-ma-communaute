import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { FamilleJeunesseView } from 'src/sections/famille-jeunesse/view/famille-jeunesse-view';

export default function FamilleJeunessePage() {
  return (
    <>
      <Helmet>
        <title>{`Famille de jeunesse - ${CONFIG.appName}`}</title>
      </Helmet>

      <FamilleJeunesseView />
    </>
  );
}
