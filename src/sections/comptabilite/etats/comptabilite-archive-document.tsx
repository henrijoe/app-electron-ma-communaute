import type { IComptabiliteItem } from 'src/store/comptabiliteSlice';

import React from 'react';

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
  computeComptabiliteTotals,
  buildComptabiliteMetaLabel,
  comptabiliteCurrencyFormatter,
} from './comptabilite-print-shared';

type ComptabiliteArchiveDocumentProps = {
  items: IComptabiliteItem[];
  filterLabel: string;
};

export function ComptabiliteArchiveDocument({
  items,
  filterLabel,
}: ComptabiliteArchiveDocumentProps) {
  const totals = computeComptabiliteTotals(items);

  return (
    <PrintDocumentLayout
      title="Archive comptable"
      variant="plain"
      showDocumentMeta={false}
    >

      {items.length === 0 ? (
        <PrintEmptyState
          title="Aucune écriture archivée"
          message="Aucune écriture supprimée n'est actuellement disponible dans l'archive comptable."
        />
      ) : (
        <>
          <PrintTable minWidth={1180}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 110 }}>Date</TableCell>
                <TableCell sx={{ width: 180 }}>Libellé</TableCell>
                <TableCell sx={{ width: 110 }}>Type</TableCell>
                <TableCell align="right" sx={{ width: 130 }}>
                  Montant
                </TableCell>
                <TableCell sx={{ width: 140 }}>Supprimé le</TableCell>
                <TableCell sx={{ width: 170 }}>Supprimé par</TableCell>
                <TableCell sx={{ width: 260 }}>Motif</TableCell>
                <TableCell align="right" sx={{ width: 150 }}>
                  Impact solde
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const montant = Number(item.montantComptabilite || 0);
                const impact = item.typeComptabilite === 'entree' ? montant : -montant;

                return (
                  <TableRow key={item.idComptabilite || `${item.nomComptabilite}-${item.dateComptabilite}`}>
                    <TableCell>{formatComptabiliteDate(item.dateComptabilite)}</TableCell>
                    <TableCell>{item.nomComptabilite || '--'}</TableCell>
                    <TableCell>{item.typeComptabilite === 'entree' ? 'Entree' : 'Sortie'}</TableCell>
                    <TableCell align="right">
                      {comptabiliteCurrencyFormatter.format(montant)}
                    </TableCell>
                    <TableCell>{formatComptabiliteDate(item.dateSuppressionComptabilite)}</TableCell>
                    <TableCell>{item.nomUtilisateurSuppression || '--'}</TableCell>
                    <TableCell>{item.motifSuppressionComptabilite || '--'}</TableCell>
                    <TableCell align="right">
                      {comptabiliteCurrencyFormatter.format(impact)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </PrintTable>

          <PrintTable minWidth={620}>
            <TableHead>
              <TableRow>
                <TableCell>Total entrées archivées</TableCell>
                <TableCell>Total sorties archivées</TableCell>
                <TableCell>Impact net archivé</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{comptabiliteCurrencyFormatter.format(totals.entree)}</TableCell>
                <TableCell>{comptabiliteCurrencyFormatter.format(totals.sortie)}</TableCell>
                <TableCell>{comptabiliteCurrencyFormatter.format(totals.solde)}</TableCell>
              </TableRow>
            </TableBody>
          </PrintTable>
        </>
      )}
    </PrintDocumentLayout>
  );
}

export default ComptabiliteArchiveDocument;