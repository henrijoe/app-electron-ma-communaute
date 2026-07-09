import type { IComptabiliteItem } from 'src/store/comptabiliteSlice';

import React from 'react';

import { Box, Typography } from '@mui/material';

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
  computeComptabiliteTotals,
  buildComptabiliteMetaLabel,
  comptabiliteCurrencyFormatter,
} from './comptabilite-print-shared';

type ComptabiliteJournalDocumentProps = {
  items: IComptabiliteItem[];
  search: string;
  filterLabel: string;
};

export function ComptabiliteJournalDocument({ items, search, filterLabel }: ComptabiliteJournalDocumentProps) {
  const totals = computeComptabiliteTotals(items);
  const metaLabel = buildComptabiliteMetaLabel(search, filterLabel);

  return (
    <PrintDocumentLayout
      title="Journal de caisse"
      variant="plain"
      showDocumentMeta={false}
    >

      <ComptabiliteSummaryCards totals={totals} variant="plain" />

      {items.length === 0 ? (
        <PrintEmptyState
          title="Aucune ecriture"
          message="Aucune écriture comptable ne correspond aux critères actuels."
        />
      ) : (
        <PrintTable minWidth={900}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 110 }}>Date</TableCell>
              <TableCell sx={{ width: 170 }}>Libellé</TableCell>
              <TableCell sx={{ width: 90 }}>Type</TableCell>
              <TableCell sx={{ width: 120 }} align="right">Entrée</TableCell>
              <TableCell sx={{ width: 120 }} align="right">Sortie</TableCell>
              <TableCell sx={{ width: 130 }} align="right">Impact net</TableCell>
              <TableCell sx={{ width: 240 }}>Observation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const impactNet = Number(item.entreeComptabilite || 0) - Number(item.sortieComptabilite || 0);
              return (
                <TableRow key={item.idComptabilite || `${item.nomComptabilite}-${item.dateComptabilite}`}>
                  <TableCell>{formatComptabiliteDate(item.dateComptabilite)}</TableCell>
                  <TableCell>{item.nomComptabilite || '--'}</TableCell>
                  <TableCell>{item.typeComptabilite === 'entree' ? 'Entree' : 'Sortie'}</TableCell>
                  <TableCell align="right">
                    {item.entreeComptabilite > 0 ? comptabiliteCurrencyFormatter.format(item.entreeComptabilite) : '--'}
                  </TableCell>
                  <TableCell align="right">
                    {item.sortieComptabilite > 0 ? comptabiliteCurrencyFormatter.format(item.sortieComptabilite) : '--'}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: 800,
                        color: impactNet >= 0 ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {comptabiliteCurrencyFormatter.format(impactNet)}
                    </Typography>
                  </TableCell>
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

export default ComptabiliteJournalDocument;