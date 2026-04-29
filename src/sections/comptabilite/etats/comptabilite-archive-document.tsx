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
      subtitle={buildComptabiliteMetaLabel('', `Archive superadmin | ${filterLabel}`)}
      countLabel="Ecritures archivees"
      countValue={items.length}
      variant="plain"
    >
      <ComptabilitePrintHero
        title="Ecritures supprimees et conservees"
        description="Ce document de controle liste les ecritures retirees de la comptabilite active, avec la trace de suppression, le motif fourni et l'utilisateur implique dans l'operation."
        chips={[
          `${items.length} ecriture(s) archivee(s)`,
          `${items.filter((item) => item.typeComptabilite === 'entree').length} entree(s) archivee(s)`,
          `${items.filter((item) => item.typeComptabilite === 'sortie').length} sortie(s) archivee(s)`,
        ]}
        variant="plain"
      />

      {items.length === 0 ? (
        <PrintEmptyState
          title="Aucune ecriture archivee"
          message="Aucune ecriture supprimee n'est actuellement disponible dans l'archive comptable."
        />
      ) : (
        <>
          <PrintTable minWidth={1180}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 110 }}>Date</TableCell>
                <TableCell sx={{ width: 180 }}>Libelle</TableCell>
                <TableCell sx={{ width: 110 }}>Type</TableCell>
                <TableCell align="right" sx={{ width: 130 }}>
                  Montant
                </TableCell>
                <TableCell sx={{ width: 140 }}>Supprime le</TableCell>
                <TableCell sx={{ width: 170 }}>Supprime par</TableCell>
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
                <TableCell>Total entrees archivees</TableCell>
                <TableCell>Total sorties archivees</TableCell>
                <TableCell>Impact net archive</TableCell>
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