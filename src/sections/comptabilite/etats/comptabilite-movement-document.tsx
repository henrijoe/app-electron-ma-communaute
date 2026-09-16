import type { ComptabiliteType, IComptabiliteItem } from 'src/store/comptabiliteSlice';

import React from 'react';

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

import {
  ComptabilitePrintHero,
  formatComptabiliteDate,
  ComptabiliteSummaryCards,
  filterComptabiliteByType,
  getComptabiliteTypeLabel,
  computeComptabiliteTotals,
  buildComptabiliteMetaLabel,
  comptabiliteCurrencyFormatter,
} from './comptabilite-print-shared';

type ComptabiliteMovementDocumentProps = {
  items: IComptabiliteItem[];
  type: ComptabiliteType;
  search: string;
  filterLabel: string;
};

export function ComptabiliteMovementDocument({
  items,
  type,
  search,
  filterLabel,
}: ComptabiliteMovementDocumentProps) {
  const typedItems = filterComptabiliteByType(items, type);
  const totals = computeComptabiliteTotals(typedItems);
  const isEntree = type === 'entree';
  const title = isEntree ? 'État des entrées' : 'État des sorties';
  const description = isEntree
    ? "Ce document regroupe les recettes enregistrées, avec leur détail, leur date et leur observation de caisse."
    : "Ce document regroupe les dépenses enregistrées, avec leur détail, leur date et leur observation de caisse.";

  return (
    <PrintDocumentLayout
      title={title}
      variant="plain"
      showDocumentMeta={false}
    >


      <ComptabiliteSummaryCards
        totals={totals}
        highlightedLabel={isEntree ? 'Total encaissé' : 'Total décaissé'}
        variant="plain"
      />

      {typedItems.length === 0 ? (
        <PrintEmptyState
          title={`Aucune ${isEntree ? 'entree' : 'sortie'}`}
          message={`Aucune ${isEntree ? 'recette' : 'depense'} ne correspond aux critères actuels.`}
        />
      ) : (
        <PrintTable minWidth={860}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 120 }}>Date</TableCell>
              <TableCell sx={{ width: 210 }}>Libellé</TableCell>
              <TableCell sx={{ width: 140 }} align="right">Montant</TableCell>
              <TableCell sx={{ width: 140 }}>Nature</TableCell>
              <TableCell sx={{ width: 250 }}>Observation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {typedItems.map((item) => {
              const montant = isEntree ? Number(item.entreeComptabilite || 0) : Number(item.sortieComptabilite || 0);
              return (
                <TableRow key={item.idComptabilite || `${item.nomComptabilite}-${item.dateComptabilite}`}>
                  <TableCell>{formatComptabiliteDate(item.dateComptabilite)}</TableCell>
                  <TableCell>{item.nomComptabilite || '--'}</TableCell>
                  <TableCell align="right">
                    <Typography component="span" sx={{ fontWeight: 800, color: isEntree ? '#166534' : '#991b1b' }}>
                      {comptabiliteCurrencyFormatter.format(montant)}
                    </Typography>
                  </TableCell>
                  <TableCell>{getComptabiliteTypeLabel(type)}</TableCell>
                  <TableCell>{item.observationComptabilite || '--'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </PrintTable>
      )}
    </PrintDocumentLayout>
  );
}

export default ComptabiliteMovementDocument;