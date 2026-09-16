import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

import { PrintDocumentLayout } from 'src/components/print/print-document';
import {
  PrintCheckboxItem,
  PrintFieldLine,
  PrintFormSection,
} from 'src/components/print/print-form-kit';
import type { IReduxState } from '../../../store/store';

export const FicheDecisionPDf = () => {
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);

  return (
    <PrintDocumentLayout
      identity={utilisateurData}
      orientation="portrait"
      title="Fiche de décision"
    >
      <Stack spacing={2.25}>
        <PrintFormSection title="Identité du décidé">
          <PrintFieldLine label="Nom" value="............................................................" />
          <PrintFieldLine label="Prénoms" value=".............................................................................." />
          <PrintFieldLine label="Ethnie" value="............................................................" />
          <PrintFieldLine label="Âge" value="..........................................." />
          <PrintFieldLine label="Profession" value="............................................................" />
          <PrintFieldLine label="Lieu de travail" value="............................................................" />
          <PrintFieldLine label="Contact" value=".............................................................................." />
          <PrintFieldLine
            label="Quartier de résidence"
            value=".............................................................................."
          />
        </PrintFormSection>

        <PrintFormSection title="Situation personnelle">
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#27415f', mb: 0.75 }}>
              Statut matrimonial
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <PrintCheckboxItem label="Marié(e)" />
              <PrintCheckboxItem label="Concubinage" />
              <PrintCheckboxItem label="Célibataire" />
              <PrintCheckboxItem label="Copain / Copine" />
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#27415f', mb: 0.75 }}>
              Savez-vous lire et écrire ?
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <PrintCheckboxItem label="Oui" />
              <PrintCheckboxItem label="Non" />
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#27415f', mb: 0.75 }}>
              Parlez-vous couramment français ?
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <PrintCheckboxItem label="Oui" />
              <PrintCheckboxItem label="Non" />
            </Stack>
          </Box>
        </PrintFormSection>

        <PrintFormSection title="Suivi et visitation">
          <PrintFieldLine
            label="Nom d'un ami dans l'église"
            value=".............................................................................."
          />

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#27415f', mb: 0.75 }}>
              Pouvez-vous recevoir de la visite ?
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <PrintCheckboxItem label="Oui" />
              <PrintFieldLine label="Heure" value="..................................." flex={0.5} />
            </Stack>
          </Box>

          <PrintFieldLine
            label="Si non, pourquoi ?"
            value=".............................................................................."
          />
        </PrintFormSection>

        <PrintFormSection title="Engagement spirituel">
          <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.8 }}>
            NB : À remplir et à ramener à la prochaine réunion.
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              backgroundColor: '#eef5ff',
              border: '1px solid rgba(28, 83, 128, 0.12)',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f274a' }}>
              Décision
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.75, color: '#1e293b', fontStyle: 'italic' }}>
              « Me reconnaissant(e) pécheur et perdu, je décide d&apos;accepter JÉSUS comme
              Seigneur et Sauveur personnel »
            </Typography>
          </Box>

          <PrintFieldLine label="Date" value=".............................................................................." />
        </PrintFormSection>

        <Box
          sx={{
            textAlign: 'center',
            p: 2,
            borderRadius: 3,
            backgroundColor: '#fff8e8',
            border: '1px solid rgba(181, 142, 61, 0.18)',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#7a5b16' }}>
            Les cours de base ont lieu tous les dimanches après le culte à l&apos;église.
          </Typography>
        </Box>
      </Stack>
    </PrintDocumentLayout>
  );
};
