import { Helmet } from 'react-helmet-async';

import { GuideView } from 'src/sections/guide/view/guide-view';

export default function GuidePage() {
  return (
    <>
      <Helmet>
        <title> Guide d&apos;utilisation | Ma Communaute </title>
      </Helmet>

      <GuideView />
    </>
  );
}
