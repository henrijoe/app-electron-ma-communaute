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
import { normalizeText } from 'src/utils/text';
import type { IReduxState } from '../../../store/store';

export const ListeDesCellules = () => {
  const listCellule = useSelector((state: IReduxState) => state.cellule.listCellule);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);
  const sortedCellules = [...(listCellule || [])].sort((a, b) => (a.nomCellule || '').localeCompare(b.nomCellule || ''));

  return (
    <PrintDocumentLayout
      identity={utilisateurData}
      title="Liste des cellules"
      subtitle="Etat imprimable des cellules avec leurs responsables, lieux et effectifs."
      countLabel="Total cellules"
      countValue={sortedCellules.length}
    >
      {sortedCellules.length === 0 ? (
        <PrintEmptyState title="Aucune cellule trouvee" message="Aucune cellule n'est encore enregistree dans la base locale." />
      ) : (
        <PrintTable minWidth={980}>
          <TableHead>
            <TableRow>
              <TableCell align="center">N?</TableCell>
              <TableCell>Cellule</TableCell>
              <TableCell>Lieu</TableCell>
              <TableCell align="center">Effectif</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Responsable visite</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCellules.map((item, index) => (
              <TableRow key={item.idCellule || index}>
                <TableCell align="center"><Typography fontWeight={700}>{index + 1}</Typography></TableCell>
                <TableCell><Typography fontWeight={700}>{normalizeText(item.nomCellule) || 'Non definie'}</Typography></TableCell>
                <TableCell>{normalizeText(item.lieuCellule) || 'Non defini'}</TableCell>
                <TableCell align="center">{item.nombreMembreCellule || '0'}</TableCell>
                <TableCell>{normalizeText(item.responsableCellule) || 'Non defini'}</TableCell>
                <TableCell>{normalizeText(item.responsableVisiteCellule) || 'Non defini'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </PrintTable>
      )}
    </PrintDocumentLayout>
  );
};
