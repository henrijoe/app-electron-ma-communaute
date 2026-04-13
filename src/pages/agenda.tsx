import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { AgendaView } from 'src/sections/agenda/view';

export default function AgendaPage() {
  return (
    <>
      <Helmet>
        <title>{`Agenda - ${CONFIG.appName}`}</title>
      </Helmet>

      <AgendaView />
    </>
  );
}
