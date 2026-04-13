import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Chip, Typography } from '@mui/material';

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

export const ListeDesDepartements = () => {
  const listDepartement = useSelector((state: IReduxState) => state.departement.listDepartement);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);

  // On trie les departements par nom long pour obtenir un etat alphabetique facile a lire.
  const sortedDepartements = [...(listDepartement || [])].sort((a, b) =>
    (a.libelleLongDepartement || '').localeCompare(b.libelleLongDepartement || '')
  );

  return (
    <PrintDocumentLayout
      identity={utilisateurData}
      title="Liste des departements"
      subtitle="Etat imprimable des departements de la communaute avec leurs sigles, slogans et responsables actuels."
      countLabel="Total departements"
      countValue={sortedDepartements.length}
    >
      {sortedDepartements.length === 0 ? (
        <PrintEmptyState
          title="Aucun departement trouve"
          message="Aucun departement n'est encore enregistre dans la base locale."
        />
      ) : (
        <PrintTable minWidth={920}>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ width: 56 }}>
                N°
              </TableCell>
              <TableCell>Departement</TableCell>
              <TableCell align="center" sx={{ width: 140 }}>
                Sigle
              </TableCell>
              <TableCell>Slogan</TableCell>
              <TableCell>Responsable</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </PrintTable>
      )}
    </PrintDocumentLayout>
  );
};
