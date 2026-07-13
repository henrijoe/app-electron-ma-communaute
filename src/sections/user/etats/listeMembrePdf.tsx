import React from 'react';
import { useSelector } from 'react-redux';

import { Chip, Avatar, Typography } from '@mui/material';

import { normalizeText } from 'src/utils/text';

import {
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  PrintTable,
  PrintEmptyState,
  PrintDocumentLayout,
} from 'src/components/print/print-document';

import { getPhotoUrl } from '../utils';
import { formaterValueLabels } from '../view/filterbyIndice';
import { dataResponsabilite } from '../../../store/membreSlice';

import type { IReduxState } from '../../../store/store';

const formatContact = (contact: string) => {
  if (!contact) {
    return 'Non spécifié';
  }

  const cleanedContact = contact.replace(/\D/g, '');

  if (cleanedContact.length === 10) {
    return cleanedContact.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  return contact;
};

const getBaptemeDisplay = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return { color: 'default' as const, label: 'Non renseigné' };
  }

  const normalizedValue = String(value).trim();

  if (normalizedValue === '1') {
    return { color: 'success' as const, label: 'Oui' };
  }

  if (normalizedValue === '0' || normalizedValue === '2') {
    return { color: 'default' as const, label: 'Non' };
  }

  return {
    color: normalizedValue.toLowerCase() === 'oui' ? ('success' as const) : ('default' as const),
    label: normalizeText(normalizedValue) || 'Non renseigné',
  };
};

export const ListeDesMembres = () => {
  const listMembre = useSelector((state: IReduxState) => state.membre.listMembre);
  const dataFilterDepartement = useSelector((state: IReduxState) => state.departement.dataFilterDepartement);
  const dataFilterCellule = useSelector((state: IReduxState) => state.cellule.dataFilterCellule);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);

  const dataDepartement = formaterValueLabels(
    dataFilterDepartement,
    'idDepartement',
    'libelleCourtDepartement'
  );
  const dataCellule = formaterValueLabels(dataFilterCellule, 'idCellule', 'nomCellule');

  const getMembreResponsabilite = (id: number) => {
    const responsabilite = dataResponsabilite?.find((item) => item.value === id);
    return responsabilite?.label || 'Non spécifié';
  };

  const getMembreDepartement = (id: number) => {
    const departement = dataDepartement?.find((item: any) => item.value === id);
    return departement?.label || 'Non spécifié';
  };

  const getMembreCellule = (id: number) => {
    const cellule = dataCellule?.find((item: any) => item.value === id);
    return cellule?.label || 'Non spécifié';
  };

  return (
    <PrintDocumentLayout identity={utilisateurData} title="Liste des membres">
      {!listMembre?.length ? (
        <PrintEmptyState
          title="Aucun membre trouvé"
          message="Aucun membre n'est actuellement enregistré dans la base locale."
        />
      ) : (
        <PrintTable minWidth={1180}>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ width: 42 }}>
                N°
              </TableCell>
              <TableCell align="center" sx={{ width: 66 }}>
                Photo
              </TableCell>
              <TableCell sx={{ width: 170 }}>Nom et prénoms</TableCell>
              <TableCell sx={{ width: 105 }}>Résidence</TableCell>
              <TableCell sx={{ width: 118 }}>Responsabilité</TableCell>
              <TableCell align="center" sx={{ width: 82 }}>
                Baptisé(e)
              </TableCell>
              <TableCell sx={{ width: 110 }}>Département</TableCell>
              <TableCell sx={{ width: 110 }}>Cellule</TableCell>
              <TableCell sx={{ width: 118 }}>Contact</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {listMembre.map((item: any, index: number) => {
              const baptemeDisplay = getBaptemeDisplay(item.baptemeEauMembre);
              const photoUrl = getPhotoUrl(item.photoMembre);

              return (
                <TableRow key={item.idMembre || index}>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={700}>
                      {index + 1}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Avatar
                      src={photoUrl || undefined}
                      alt={`${item.nomMembre || ''} ${item.prenomMembre || ''}`}
                      sx={{
                        width: 40,
                        height: 40,
                        mx: 'auto',
                        border: '2px solid rgba(25, 118, 210, 0.22)',
                      }}
                    >
                      {!photoUrl &&
                        `${item.nomMembre?.charAt(0) || ''}${item.prenomMembre?.charAt(0) || ''}`}
                    </Avatar>
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                      {normalizeText(`${item.nomMembre || ''} ${item.prenomMembre || ''}`.trim()) ||
                        'Non spécifié'}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', lineHeight: 1.15, wordBreak: 'break-all' }}
                    >
                      {normalizeText(item.emailMembre) || 'Email non spécifié'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {normalizeText(item.residenceMembre) || 'Non spécifié'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={normalizeText(getMembreResponsabilite(item.idResponsabilite))}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{
                        maxWidth: '100%',
                        fontWeight: 700,
                        '& .MuiChip-label': {
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                      }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={baptemeDisplay.label}
                      size="small"
                      color={baptemeDisplay.color}
                      sx={{ fontWeight: 700, minWidth: 56 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{normalizeText(getMembreDepartement(item.idDepartement))}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={normalizeText(getMembreCellule(item.idCellule))}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{
                        maxWidth: '100%',
                        fontWeight: 700,
                        '& .MuiChip-label': {
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {formatContact(item.contactMembre)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </PrintTable>
      )}
    </PrintDocumentLayout>
  );
};
