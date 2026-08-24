import { Fragment } from 'react';

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

import type { ProgrammeEglise } from '../view/programme-eglise-manager';

type ProgrammePrintDocumentProps = {
  programmes: ProgrammeEglise[];
  horaires?: string;
  themeAnnee?: string;
};

// Regroupe les lignes par mois pour reproduire la mise en page du document papier
// (une section "FEVRIER 2026", une section "MARS 2026", etc. — voir programme-eglise-manager.tsx).
const groupByMonth = (programmes: ProgrammeEglise[]) => {
  const groups = new Map<string, ProgrammeEglise[]>();

  programmes.forEach((programme) => {
    const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(
      new Date(`${programme.dateProgramme}T00:00:00`)
    );
    const capitalized = monthLabel.toUpperCase();
    const bucket = groups.get(capitalized) || [];
    bucket.push(programme);
    groups.set(capitalized, bucket);
  });

  return Array.from(groups.entries());
};

const formatJour = (isoDate: string) => {
  const label = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date(`${isoDate}T00:00:00`));
  return label.toUpperCase();
};

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(new Date(`${isoDate}T00:00:00`));

export function ProgrammePrintDocument({ programmes, horaires, themeAnnee }: ProgrammePrintDocumentProps) {
  const groups = groupByMonth(programmes);

  return (
    <PrintDocumentLayout title="Programme de service" orientation="portrait">
      {programmes.length === 0 ? (
        <PrintEmptyState
          title="Aucun programme"
          message="Aucun culte n'est encore programmé pour cette église."
        />
      ) : (
        <PrintTable minWidth={720}>
          <TableHead>
            <TableRow>
              <TableCell>Jour</TableCell>
              <TableCell align="center">Date</TableCell>
              <TableCell>Direction</TableCell>
              <TableCell>Sainte Cène</TableCell>
              <TableCell>Prédication</TableCell>
              <TableCell>Offrandes</TableCell>
              <TableCell>Annonces</TableCell>
              <TableCell>Thématiques / Observations</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map(([month, monthProgrammes]) => (
              <Fragment key={month}>
                <TableRow>
                  <TableCell colSpan={8} sx={{ fontWeight: 900, bgcolor: '#eaf2ff !important' }}>
                    {month}
                  </TableCell>
                </TableRow>
                {monthProgrammes.map((programme) => (
                  <TableRow key={programme.idProgramme}>
                    <TableCell>{formatJour(programme.dateProgramme)}</TableCell>
                    <TableCell align="center">
                      <strong>{formatDate(programme.dateProgramme)}</strong>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{programme.direction || '-'}</TableCell>
                    <TableCell>{programme.saintCene || ''}</TableCell>
                    <TableCell>{programme.predication || ''}</TableCell>
                    <TableCell>{programme.offrandes || ''}</TableCell>
                    <TableCell>{programme.annonces || ''}</TableCell>
                    <TableCell>{programme.thematique || ''}</TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </PrintTable>
      )}

      {(horaires || themeAnnee) && (
        <Box sx={{ mt: 2 }}>
          {horaires && (
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>{horaires}</Typography>
          )}
          {themeAnnee && (
            <Typography sx={{ mt: 0.5, fontSize: '0.8rem', textAlign: 'center', fontStyle: 'italic' }}>
              Thème local : « {themeAnnee} »
            </Typography>
          )}
        </Box>
      )}
    </PrintDocumentLayout>
  );
}

export default ProgrammePrintDocument;
