import { Helmet } from 'react-helmet-async';

import { SettingsView } from 'src/sections/settings/view/settings-view';

export default function SettingsPage() {
  return (
    <>
      <Helmet>
        <title> Paramètres | Ma Communauté </title>
      </Helmet>

      <SettingsView />
    </>
  );
}
