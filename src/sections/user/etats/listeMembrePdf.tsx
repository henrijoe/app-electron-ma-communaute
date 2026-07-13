import React from 'react';
import { useSelector } from 'react-redux';

import { Chip, Avatar, Typography, Table } from '@mui/material';

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
  // On affiche une valeur neutre quand aucun contact n'est disponible.
  if (!contact) {
    return 'Non specifie';
  }

  // On retire les caracteres non numeriques pour les numeros classiques.
  const cleanedContact = contact.replace(/\D/g, '');

  // Si on a exactement 10 chiffres, on applique un format plus lisible a l'impression.
  if (cleanedContact.length === 10) {
    return cleanedContact.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  // Sinon on garde le texte initial pour ne rien perdre.
  return contact;
};

const getBaptemeDisplay = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return { color: 'default' as const, label: 'Non renseigne' };
  }

  const normalizedValue = String(value).trim();

  if (normalizedValue === '1') {
    return { color: 'success' as const, label: 'Oui' };
  }

  if (normalizedValue === '0' || normalizedValue === '2') {
    return { color: 'default' as const, label: 'Non' };
  }

  return {
    color: normalizedValue.toLowerCase() === 'oui' ? 'success' as const : 'default' as const,
    label: normalizeText(normalizedValue) || 'Non renseigne',
  };
};

export const ListeDesMembres = () => {
  const listMembre = useSelector((state: IReduxState) => state.membre.listMembre);
  const dataFilterDepartement = useSelector((state: IReduxState) => state.departement.dataFilterDepartement);
  const dataFilterCellule = useSelector((state: IReduxState) => state.cellule.dataFilterCellule);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);

  // On transforme les listes de reference en couples value/label pour les affichages papier.
  const dataDepartement = formaterValueLabels(
    dataFilterDepartement,
    'idDepartement',
    'libelleCourtDepartement'
  );
  const dataCellule = formaterValueLabels(dataFilterCellule, 'idCellule', 'nomCellule');

  const getMembreResponsabilite = (id: number) => {
    // On retrouve le libelle de responsabilite a partir de son identifiant.
    const responsabilite = dataResponsabilite?.find((item) => item.value === id);
    return responsabilite?.label || 'Non specifie';
  };

  const getMembreDepartement = (id: number) => {
    // On retrouve le departement en version courte pour garder une cellule compacte.
    const departement = dataDepartement?.find((item: any) => item.value === id);
    return departement?.label || 'Non specifie';
  };

  const getMembreCellule = (id: number) => {
    // On retrouve la cellule rattachee pour enrichir la ligne du membre.
    const cellule = dataCellule?.find((item: any) => item.value === id);
    return cellule?.label || 'Non specifie';
  };

  return (
    <PrintDocumentLayout
      identity={utilisateurData}
      title="Liste des membres"
    // showCountMeta={false}
    // variant="plain"
    >
      {!listMembre?.length ? (
        <PrintEmptyState
          title="Aucun membre trouve"
          message="Aucun membre n'est actuellement enregistre dans la base locale."
        />
      ) : (
        <Table
          sx={{
            width: '100%',
            tableLayout: 'fixed'
          }}
        >

          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ width: 42 }}>
                N°
              </TableCell>
              <TableCell align="center" sx={{ width: 66 }}>
                Photo
              </TableCell>
              <TableCell sx={{ width: 160 }}>Nom et prenoms</TableCell>
              <TableCell sx={{ width: 105 }}>Residence</TableCell>
              <TableCell sx={{ width: 118 }}>Responsabilite</TableCell>
              <TableCell align="center" sx={{ width: 82 }}>
                Baptisé(e)
              </TableCell>
              <TableCell sx={{ width: 110 }}>Departement</TableCell>
              <TableCell sx={{ width: 110 }}>Cellule</TableCell>
              <TableCell sx={{ width: 118 }}>Contact</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {listMembre.map((item: any, index: number) => {
              const baptemeDisplay = getBaptemeDisplay(item.baptemeEauMembre);
              // On resolve la photo avec la logique web/electron deja centralisee.
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
                      {normalizeText(`${item.nomMembre || ''} ${item.prenomMembre || ''}`.trim()) || 'Non specifie'}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', lineHeight: 1.15, wordBreak: 'break-all' }}
                    >
                      {normalizeText(item.emailMembre) || 'Email non specifie'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{normalizeText(item.residenceMembre) || 'Non specifie'}</Typography>
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
        </Table>
      )}
    </PrintDocumentLayout>
  );
};