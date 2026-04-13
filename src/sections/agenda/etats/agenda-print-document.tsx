import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';

import {
  PrintDocumentLayout,
  PrintEmptyState,
  PrintTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'src/components/print/print-document';
import type { IAgendaEvent } from 'src/store/agendaSlice';

type PrintIdentity = {
  email?: string;
  logoUtilisateur?: string;
  nomTemple?: string;
  nomUtilisateur?: string;
  prenomUtilisateur?: string;
  telephoneUtilisateur?: string;
};

type AgendaPrintDocumentProps = {
  events: IAgendaEvent[];
  identity?: PrintIdentity;
  monthLabel: string;
};

export function AgendaPrintDocument({ events, identity, monthLabel }: AgendaPrintDocumentProps) {
  return (
    <PrintDocumentLayout
      identity={identity}
      title={`Agenda mensuel - ${monthLabel}`}
      countLabel="Total rendez-vous"
      countValue={events.length}
    >
      <Box className="print-block-avoid-break" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: '#304760', mb: 0.5 }}>
          Vue mensuelle des rendez-vous, cultes et evenements programmes pour la communaute.
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip size="small" label={monthLabel} />
          <Chip size="small" label={`${events.length} evenement(s)`} />
        </Stack>
      </Box>

      {events.length === 0 ? (
        <PrintEmptyState title="Aucun evenement" message="Aucun rendez-vous programme sur ce mois." />
      ) : (
        <PrintTable minWidth={720}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 110 }}>Date</TableCell>
              <TableCell sx={{ width: 110 }}>Heure</TableCell>
              <TableCell sx={{ width: 150 }}>Titre</TableCell>
              <TableCell sx={{ width: 110 }}>Type</TableCell>
              <TableCell sx={{ width: 130 }}>Lieu</TableCell>
              <TableCell sx={{ width: 100 }}>Statut</TableCell>
              <TableCell sx={{ width: 170 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.idAgenda || `${event.dateAgenda}-${event.titreAgenda}`}>
                <TableCell>{event.dateAgenda || '-'}</TableCell>
                <TableCell>{event.heureDebutAgenda || '--:--'}{event.heureFinAgenda ? ` - ${event.heureFinAgenda}` : ''}</TableCell>
                <TableCell>{event.titreAgenda || '-'}</TableCell>
                <TableCell>{event.typeAgenda || '-'}</TableCell>
                <TableCell>{event.lieuAgenda || '-'}</TableCell>
                <TableCell>{event.statutAgenda || '-'}</TableCell>
                <TableCell>{event.descriptionAgenda || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </PrintTable>
      )}
    </PrintDocumentLayout>
  );
}

export default AgendaPrintDocument;
