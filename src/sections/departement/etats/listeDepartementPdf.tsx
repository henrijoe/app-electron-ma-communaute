import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { HeaderPageComponents } from './HeaderPageComponent';
import type { IReduxState } from '../../../store/store';

export const ListeDesDepartements = () => {
  const listDepartement = useSelector((state: IReduxState) => state.departement.listDepartement);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);

  const sortedDepartements = [...(listDepartement || [])].sort((a, b) =>
    (a.libelleLongDepartement || '').localeCompare(b.libelleLongDepartement || '')
  );

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        p: 3,
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
      }}
    >
      <HeaderPageComponents paramEtab={utilisateurData} />

      <Box
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: 'white',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: 1,
              mb: 1,
            }}
          >
            Liste des départements
          </Typography>
          <Divider sx={{ width: '80%', my: 2 }} />
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
              maxWidth: 600,
            }}
          >
            Vue imprimable des départements enregistrés pour cette communauté.
          </Typography>
        </Box>

        <Box
          sx={{
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'white',
          }}
        >
          <Box sx={{ overflowX: 'auto' }}>
            <Table
              sx={{
                minWidth: 900,
                '& .MuiTableCell-root': {
                  py: 1.5,
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    borderRight: 'none',
                  },
                },
                '& .MuiTableHead-root': {
                  backgroundColor: 'primary.lighter',
                  '& .MuiTableCell-root': {
                    color: 'primary.dark',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    borderBottom: '2px solid',
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: 60 }}>
                    N°
                  </TableCell>
                  <TableCell>Département</TableCell>
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
                      <Typography variant="body2" fontWeight="medium">
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {item.libelleLongDepartement || 'Non spécifié'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.libelleCourtDepartement || '-'}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.sloganDepartement || 'Non spécifié'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.responsableDepartement || 'Non spécifié'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {sortedDepartements.length === 0 && (
            <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Aucun département trouvé
              </Typography>
              <Typography variant="body2">
                Aucun département n&apos;est encore enregistré.
              </Typography>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Document généré le {new Date().toLocaleDateString('fr-FR')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total : {sortedDepartements.length} département(s)
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

