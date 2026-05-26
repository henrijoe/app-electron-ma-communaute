import React from 'react';
import { useSelector } from 'react-redux';
import { Typography } from '@mui/material';

import {
  PrintDocumentLayout,
  PrintEmptyState,
  PrintTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'src/components/print/print-document';
import type { IReduxState } from '../../../store/store';

export const ListeDesGroupes = () => {
  const listGroupe = useSelector((state: IReduxState) => state.groupe.listGroupe);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);
  const sortedGroupes = [...(listGroupe || [])].sort((a, b) => (a.libelleGroupe || '').localeCompare(b.libelleGroupe || ''));

  return (
    <PrintDocumentLayout
      identity={utilisateurData}
      title="Liste des groupes"
      subtitle="Etat imprimable des groupes avec leurs descriptions et responsables." 
      countLabel="Total groupes"
      countValue={sortedGroupes.length}
    >
      {sortedGroupes.length === 0 ? (
        <PrintEmptyState title="Aucun groupe trouvé" message="Aucun groupe n'est encore enregistré dans la base locale." />
      ) : (
        <PrintTable minWidth={940}>
          <TableHead>
            <TableRow>
              <TableCell align="center">No</TableCell>
              <TableCell>Groupe</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Responsable</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedGroupes.map((item, index) => (
              <TableRow key={item.idGroupe || index}>
                <TableCell align="center"><Typography fontWeight={700}>{index + 1}</Typography></TableCell>
                <TableCell><Typography fontWeight={700}>{item.libelleGroupe || 'Non défini'}</Typography></TableCell>
                <TableCell>{item.descriptionGroupe || 'Non définie'}</TableCell>
                <TableCell>{item.responsableGroupe || 'Non défini'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </PrintTable>
      )}
    </PrintDocumentLayout>
  );
};
