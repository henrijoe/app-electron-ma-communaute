import React from 'react';
import { useSelector } from 'react-redux';

import { Box, Chip, Typography } from '@mui/material';

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

export const ListeDesDepartements = () => {
  const listDepartement = useSelector((state: IReduxState) => state.departement.listDepartement);
  const listMembre = useSelector((state: IReduxState) => state.membre.listMembre);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);
  const membres = Array.isArray(listMembre) ? (listMembre as IMembre[]) : [];

  // On trie les departements par nom long pour obtenir un etat alphabetique facile a lire.
  const sortedDepartements = [...(listDepartement || [])].sort((a, b) =>
    (a.libelleLongDepartement || '').localeCompare(b.libelleLongDepartement || '')
  );

  return (
    <PrintDocumentLayout
      identity={utilisateurData}
      title="Liste des départements"
    >
      {sortedDepartements.length === 0 ? (
        <PrintEmptyState
          title="Aucun département trouvé"
          message="Aucun département n'est encore enregistré dans la base locale."
        />
      ) : (
        <PrintTable minWidth={1040}>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ width: 56 }}>
                N°
              </TableCell>
              <TableCell>Département</TableCell>
              <TableCell align="center" sx={{ width: 140 }}>
                Sigle
              </TableCell>
              <TableCell>Slogan</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Numéro responsable</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedDepartements.map((item, index) => (
              <TableRow key={item.idDepartement || index}>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={700}>
                    {index + 1}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {item.libelleLongDepartement || 'Non specifie'}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={item.libelleCourtDepartement || '-'}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 800 }}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{item.sloganDepartement || 'Non specifie'}</Typography>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {item.responsableDepartement || 'Non specifie'}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {findResponsableContact(membres, item.responsableDepartement) || 'Non specifie'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </PrintTable>
      )}
    </PrintDocumentLayout>
  );
};
