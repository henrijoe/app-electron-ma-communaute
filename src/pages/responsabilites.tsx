import { Helmet } from 'react-helmet-async';

import { ResponsabilitesView } from 'src/sections/responsabilites/view/responsabilites-view';

export default function ResponsabilitesPage() {
  return (
    <>
      <Helmet>
        <title> Responsabilités | Ma Communauté </title>
      </Helmet>

      <ResponsabilitesView />
    </>
  );
}
