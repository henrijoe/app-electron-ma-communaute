import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Chip, Typography } from '@mui/material';
import { normalizeText } from 'src/utils/text';

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
import { dataResponsabilite } from '../../../store/membreSlice';
import { formaterValueLabels } from '../view/filterbyIndice';
import { formatMembreForDisplay, getPhotoUrl } from '../utils';

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
      subtitle="Etat imprimable complet des membres avec photo, rattachement, responsabilite et contact principal."
      countLabel="Total membres"
      countValue={listMembre?.length || 0}
    >
      {!listMembre?.length ? (
        <PrintEmptyState
          title="Aucun membre trouve"
          message="Aucun membre n'est actuellement enregistre dans la base locale."
        />
      ) : (
        <PrintTable minWidth={1120}>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ width: 52 }}>
                N°
              </TableCell>
              <TableCell align="center" sx={{ width: 86 }}>
                Photo
              </TableCell>
              <TableCell sx={{ width: 280 }}>Nom et prenoms</TableCell>
              <TableCell>Residence</TableCell>
              <TableCell>Responsabilite</TableCell>
              <TableCell align="center">Baptise(e)</TableCell>
              <TableCell>Departement</TableCell>
              <TableCell>Cellule</TableCell>
              <TableCell>Contact</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {listMembre.map((item: any, index: number) => {
              // On reutilise le formatteur metier deja existant pour garder les memes libelles.
              const formattedMembre = formatMembreForDisplay(item);
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
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        border: '2px solid rgba(25, 118, 210, 0.22)',
                      }}
                    >
                      {!photoUrl &&
                        `${item.nomMembre?.charAt(0) || ''}${item.prenomMembre?.charAt(0) || ''}`}
                    </Avatar>
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {normalizeText(`${item.nomMembre || ''} ${item.prenomMembre || ''}`.trim()) || 'Non specifie'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
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
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={formattedMembre.baptemeEauMembre}
                      size="small"
                      color={formattedMembre.baptemeEauMembre === 'Oui' ? 'success' : 'default'}
                      sx={{ fontWeight: 700, minWidth: 64 }}
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
                      sx={{ fontWeight: 700 }}
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
