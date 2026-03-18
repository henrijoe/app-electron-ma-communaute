import { Helmet } from 'react-helmet-async';

import { SettingsView } from 'src/sections/settings/view/settings-view';

export default function SettingsPage() {
  return (
    <>
      <Helmet>
        <title> Parametres | Ma Communaute </title>
      </Helmet>

      <SettingsView />
    </>
  );
}
