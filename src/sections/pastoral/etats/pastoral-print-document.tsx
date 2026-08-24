// ============================================================================
// pastoral-print-document.tsx
// Contenu imprimable (PDF/impression) de la page "Suivi pastoral". Reçoit
// exactement la liste déjà filtrée par la page (onglet, priorité, recherche,
// période) et l'affiche sous forme de tableau, avec un sous-titre qui rappelle
// la période et le filtre actifs pour que le document imprimé reste lisible
// une fois détaché de l'écran.
// ============================================================================
import Typography from '@mui/material/Typography';

import {
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  PrintTable,
  PrintEmptyState,
  PrintDocumentLayout,
} from 'src/components/print/print-document';

type PrintIdentity = {
  email?: string;
  logoUtilisateur?: string;
  nomTemple?: string;
  nomUtilisateur?: string;
  prenomUtilisateur?: string;
  telephoneUtilisateur?: string;
};

// Version simplifiee d'un item pastoral, juste ce qu'il faut pour l'imprimer
// (evite de dependre du type complet de pastoral-view.tsx).
export type PastoralPrintRow = {
  id: string;
  name: string;
  priorityLabel: string;
  categories: string;
  details: string;
  contact?: string;
  residence?: string;
};

type PastoralPrintDocumentProps = {
  identity?: PrintIdentity;
  rows: PastoralPrintRow[];
  subtitle: string;
};

export function PastoralPrintDocument({ identity, rows, subtitle }: PastoralPrintDocumentProps) {
  return (
    <PrintDocumentLayout identity={identity} title="Suivi pastoral" orientation="landscape">
      <Typography variant="body2" sx={{ mb: 1.5, color: '#475569' }}>
        {subtitle}
      </Typography>

      {rows.length === 0 ? (
        <PrintEmptyState
          title="Aucune situation à afficher"
          message="Aucun élément ne correspond aux filtres sélectionnés pour cette période."
        />
      ) : (
        <PrintTable minWidth={980}>
          <TableHead>
            <TableRow>
              <TableCell align="center">N°</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Priorité</TableCell>
              <TableCell>Situations</TableCell>
              <TableCell>Détails</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Résidence</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell align="center">
                  <Typography fontWeight={700}>{index + 1}</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={700}>{row.name}</Typography>
                </TableCell>
                <TableCell>{row.priorityLabel}</TableCell>
                <TableCell>{row.categories}</TableCell>
                <TableCell>{row.details}</TableCell>
                <TableCell>{row.contact || 'Non spécifié'}</TableCell>
                <TableCell>{row.residence || 'Non spécifié'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </PrintTable>
      )}
    </PrintDocumentLayout>
  );
}

export default PastoralPrintDocument;
