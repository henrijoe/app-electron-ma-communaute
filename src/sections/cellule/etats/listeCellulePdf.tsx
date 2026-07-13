import React from 'react';
import { useSelector } from 'react-redux';

import { Typography } from '@mui/material';

import { normalizeText } from 'src/utils/text';
import { findResponsableContact } from 'src/utils/responsable-members';

import {
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  PrintTable,
  PrintEmptyState,
  PrintDocumentLayout,
} from 'src/components/print/print-document';

import type { IReduxState } from '../../../store/store';
import type { IMembre } from '../../../store/membreSlice';

export const ListeDesCellules = () => {
  const listCellule = useSelector((state: IReduxState) => state.cellule.listCellule);
  const listMembre = useSelector((state: IReduxState) => state.membre.listMembre);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);
  const sortedCellules = [...(listCellule || [])].sort((a, b) => (a.nomCellule || '').localeCompare(b.nomCellule || ''));
  const membres = Array.isArray(listMembre) ? (listMembre as IMembre[]) : [];

  return (
    <PrintDocumentLayout
      identity={utilisateurData}
      title="Liste des cellules"
    >
      {sortedCellules.length === 0 ? (
        <PrintEmptyState title="Aucune cellule trouvée" message="Aucune cellule n'est encore enregistrée dans la base locale." />
      ) : (
        <PrintTable minWidth={980}>
          <TableHead>
            <TableRow>
              <TableCell align="center">N°</TableCell>
              <TableCell>Cellule</TableCell>
              <TableCell>Lieu</TableCell>
              <TableCell align="center">Effectif</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Numéro responsable</TableCell>
              <TableCell>Responsable visite</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCellules.map((item, index) => (
              <TableRow key={item.idCellule || index}>
                <TableCell align="center"><Typography fontWeight={700}>{index + 1}</Typography></TableCell>
                <TableCell><Typography fontWeight={700}>{normalizeText(item.nomCellule) || 'Non definie'}</Typography></TableCell>
                <TableCell>{normalizeText(item.lieuCellule) || 'Non defini'}</TableCell>
                <TableCell align="center">{item.nombreMembreCellule || ''}</TableCell>
                <TableCell>{normalizeText(item.responsableCellule) || 'Non defini'}</TableCell>
                <TableCell>{findResponsableContact(membres, item.responsableCellule) || 'Non defini'}</TableCell>
                <TableCell>{normalizeText(item.responsableVisiteCellule) || 'Non defini'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </PrintTable>
      )}
    </PrintDocumentLayout>
  );
};
