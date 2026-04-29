import { Helmet } from 'react-helmet-async';

import { UserImportView } from 'src/sections/user/view/user-import/user-import-view';

export default function UserImportPage() {
  return (
    <>
      <Helmet>
        <title> Import membres | Ma Communaute </title>
      </Helmet>

      <UserImportView />
    </>
  );
}
