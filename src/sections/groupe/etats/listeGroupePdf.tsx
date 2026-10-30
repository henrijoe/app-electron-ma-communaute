import React from 'react';
import { useSelector } from 'react-redux';

import { Typography } from '@mui/material';

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

type ListeDesGroupesProps = {
  /**
   * Lignes à imprimer : celles que le tableau affiche, recherche et filtres
   * compris. Omise, la propriété laisse l'état reprendre la liste complète du
   * store, qui était le comportement d'origine.
   */
  groupes?: any[];
  /** Filtre actif, rappelé sous le titre pour que la feuille se relise seule. */
  sousTitre?: string;
};

export const ListeDesGroupes = ({ groupes, sousTitre }: ListeDesGroupesProps) => {
  const listGroupe = useSelector((state: IReduxState) => state.groupe.listGroupe);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);
  const sourceGroupes = Array.isArray(groupes) ? groupes : (listGroupe || []);
  const sortedGroupes = [...sourceGroupes].sort((a, b) =>
    (a.libelleGroupe || '').localeCompare(b.libelleGroupe || '')
  );

  return (
    <PrintDocumentLayout identity={utilisateurData} title="Liste des groupes">
      {sousTitre && (
        <Typography variant="body2" sx={{ mb: 1.5, color: '#475569' }}>
          {sousTitre}
        </Typography>
      )}
      {sortedGroupes.length === 0 ? (
        <PrintEmptyState title="Aucun groupe trouvé" message="Aucun groupe n'est encore enregistré dans la base locale." />
      ) : (
        <PrintTable minWidth={940}>
          <TableHead>
            <TableRow>
              <TableCell align="center">N°</TableCell>
              <TableCell>Groupe</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Responsable</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedGroupes.map((item, index) => (
              <TableRow key={item.idGroupe || index}>
                <TableCell align="center">
                  <Typography fontWeight={700}>{index + 1}</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={700}>{item.libelleGroupe || 'Non défini'}</Typography>
                </TableCell>
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
