import type { IComptabiliteItem } from 'src/store/comptabiliteSlice';

import React from 'react';

import { Box, Stack, Divider, Typography } from '@mui/material';

import { PrintEmptyState, PrintDocumentLayout } from 'src/components/print/print-document';

import {
  ComptabilitePrintHero,
  formatComptabiliteDate,
  ComptabiliteSummaryCards,
  computeComptabiliteTotals,
  buildComptabiliteMetaLabel,
  comptabiliteCurrencyFormatter,
} from './comptabilite-print-shared';

type ComptabiliteSummaryDocumentProps = {
  items: IComptabiliteItem[];
  search: string;
  filterLabel: string;
};

export function ComptabiliteSummaryDocument({ items, search, filterLabel }: ComptabiliteSummaryDocumentProps) {
  const totals = computeComptabiliteTotals(items);
  const latestOperation = items[0];
  const nombreEntrees = items.filter((item) => item.typeComptabilite === 'entree').length;
  const nombreSorties = items.filter((item) => item.typeComptabilite === 'sortie').length;

  return (
    <PrintDocumentLayout
      title="Situation de tresorerie"
      variant="plain"
      showDocumentMeta={false}
    >


      {items.length === 0 ? (
        <PrintEmptyState
          title="Aucune donnee comptable"
          message="Aucune ecriture disponible pour produire la synthese de tresorerie."
        />
      ) : (
        <>
          <ComptabiliteSummaryCards totals={totals} variant="plain" />

          <Box className="print-block-avoid-break" sx={{ p: 0, borderRadius: 0, border: 'none', background: 'transparent' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} divider={<Divider orientation="vertical" flexItem />}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" sx={{ color: '#5c6f82', letterSpacing: 0.8 }}>
                  Solde actuel
                </Typography>
                <Typography variant="h3" sx={{ mt: 0.75, color: totals.solde >= 0 ? '#1d4ed8' : '#b91c1c', fontWeight: 900 }}>
                  {comptabiliteCurrencyFormatter.format(totals.solde)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#4a5b70', maxWidth: 420 }}>
                  Le solde correspond a la difference entre les encaissements et les decaissements visibles dans la periode ou la vue actuelle.
                </Typography>
              </Box>

              <Stack spacing={1.2} sx={{ flex: 1 }}>
                <Typography variant="overline" sx={{ color: '#5c6f82', letterSpacing: 0.8 }}>
                  Derniere ecriture observee
                </Typography>
                <Typography variant="h6" sx={{ color: '#0f274a', fontWeight: 800 }}>
                  {latestOperation?.nomComptabilite || '--'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#44556a' }}>
                  Date: {formatComptabiliteDate(latestOperation?.dateComptabilite)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#44556a' }}>
                  Type: {latestOperation?.typeComptabilite === 'entree' ? 'Entree' : 'Sortie'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#44556a' }}>
                  Montant: {comptabiliteCurrencyFormatter.format(Number(latestOperation?.montantComptabilite || 0))}
                </Typography>
                <Typography variant="body2" sx={{ color: '#44556a' }}>
                  Observation: {latestOperation?.observationComptabilite || '--'}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </>
      )}
    </PrintDocumentLayout>
  );
}

export default ComptabiliteSummaryDocument;