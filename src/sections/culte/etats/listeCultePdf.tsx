import React from 'react';
import { useSelector } from 'react-redux';

import { Box, Chip, Typography } from '@mui/material';

import {
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  PrintTable,
  PrintEmptyState,
  PrintDocumentLayout,
} from 'src/components/print/print-document';

import { getEcodimLabel, formatDateShort, getTypeCulteLabel } from '../utils';

import type { IReduxState } from '../../../store/store';

const formatCurrency = (amount: string) => {
  // On convertit les chaînes numériques pour garder un affichage monetaire stable.
  const parsedAmount = Number(amount || 0);

  // Si la conversion échoue, on garde une valeur par défaut lisible pour l'impression.
  if (Number.isNaN(parsedAmount)) {
    return '0 FCFA';
  }

  // On retourne un montant formate au style francophone.
  return `${parsedAmount.toLocaleString('fr-FR')} FCFA`;
};

const getParticipantCount = (culte: any) => {
  // On additionne hommes et femmes en forçant des nombres valides.
  const hommes = Number(culte.nombreHommeCulte || 0);
  const femmes = Number(culte.nombreFemmeCulte || 0);

  // En cas de valeur incohérente, on retombe sur zéro sans casser l'état imprimable.
  return (Number.isNaN(hommes) ? 0 : hommes) + (Number.isNaN(femmes) ? 0 : femmes);
};

type ListeDesCultesProps = {
  /**
   * Lignes à imprimer : celles que le tableau affiche, recherche et filtres
   * compris. Omise, la propriété laisse l'état reprendre la liste complète du
   * store, qui était le comportement d'origine.
   */
  cultes?: any[];
  /** Filtre actif, rappelé sous le titre pour que la feuille se relise seule. */
  sousTitre?: string;
};

export const ListeDesCultes = ({ cultes, sousTitre }: ListeDesCultesProps) => {
  const listCulte = useSelector((state: IReduxState) => state.culte.listCulte);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);
  const sourceCultes = Array.isArray(cultes) ? cultes : (listCulte || []);

  // On trie du plus récent au plus ancien pour obtenir une lecture chronologique naturelle.
  const sortedCultes = [...sourceCultes].sort((a, b) => {
    const dateA = new Date(a.dateCulte).getTime();
    const dateB = new Date(b.dateCulte).getTime();
    return dateB - dateA;
  });

  return (
    <PrintDocumentLayout
      identity={utilisateurData}
      title="Liste des cultes"
    >
      {sousTitre && (
        <Typography variant="body2" sx={{ mb: 1.5, color: '#475569' }}>
          {sousTitre}
        </Typography>
      )}

        <PrintTable minWidth={1080}>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ width: 56 }}>
                No
              </TableCell>
              <TableCell sx={{ width: 110 }}>Date</TableCell>
              <TableCell sx={{ width: 160 }}>Type</TableCell>
              <TableCell>Dirigeant</TableCell>
              <TableCell>Prédicateur</TableCell>
              <TableCell>Thème / passage</TableCell>
              <TableCell align="center" sx={{ width: 110 }}>
                Participants
              </TableCell>
              <TableCell align="center" sx={{ width: 110 }}>
                Ecodim
              </TableCell>
              <TableCell align="right" sx={{ width: 130 }}>
                Offrande
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedCultes.map((item, index) => (
              <TableRow key={item.idCulte || index}>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={700}>
                    {index + 1}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {formatDateShort(item.dateCulte)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={getTypeCulteLabel(item.typeCulte) || 'Non spécifié'}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{item.dirigeant || 'Non spécifié'}</Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{item.predication || 'Non spécifié'}</Typography>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {item.themePredication || 'Thème non spécifié'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.passageBiblique || 'Passage non spécifié'}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <Typography variant="body2" fontWeight={700}>
                    {getParticipantCount(item)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    H {item.nombreHommeCulte || 0} / F {item.nombreFemmeCulte || 0}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={getEcodimLabel(item.ecodim) || 'Non'}
                    size="small"
                    color={getEcodimLabel(item.ecodim) === 'Oui' ? 'success' : 'default'}
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>

                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700}>
                    {formatCurrency(item.offrandeCulte)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </PrintTable>
    </PrintDocumentLayout>
  );
};
