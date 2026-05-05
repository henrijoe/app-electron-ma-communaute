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
      subtitle={metaLabel}
      countLabel="Total ecritures"
      countValue={items.length}
      variant="plain"
      showDocumentMeta={false}
    >
      <ComptabilitePrintHero
        title="Journal general des ecritures"
        description="Ce document presente toutes les ecritures comptables visibles selon les filtres courants, avec les recettes, les depenses et la situation nette de tresorerie."
        chips={[
          `${items.length} ecriture(s)`,
          filterLabel,
          search.trim() ? 'Recherche active' : 'Sans recherche textuelle',
        ]}
        variant="plain"
      />

      <ComptabiliteSummaryCards totals={totals} variant="plain" />

      {items.length === 0 ? (
        <PrintEmptyState
          title="Aucune ecriture"
          message="Aucune ecriture comptable ne correspond aux criteres actuels."
        />
      ) : (
        <PrintTable minWidth={900}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 110 }}>Date</TableCell>
              <TableCell sx={{ width: 170 }}>Libelle</TableCell>
              <TableCell sx={{ width: 90 }}>Type</TableCell>
              <TableCell sx={{ width: 120 }} align="right">Entree</TableCell>
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

      <Box className="print-block-avoid-break" sx={{ mt: 2.5 }}>
        <Typography variant="caption" sx={{ color: '#5c6f82' }}>
          Le journal de caisse reprend automatiquement les informations de l&apos;eglise configurees dans les parametres et les donnees comptables actuellement visibles dans l&apos;application.
        </Typography>
      </Box>
    </PrintDocumentLayout>
  );
}

export default ComptabiliteJournalDocument;