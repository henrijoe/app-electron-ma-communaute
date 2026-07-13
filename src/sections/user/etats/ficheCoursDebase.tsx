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

const CoursDeBaseForm = () => {
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);

  return (
    <PrintDocumentLayout
      identity={utilisateurData}
      orientation="portrait"
      title="Cours de base"
    >
      <Stack spacing={2.25}>
        <PrintFormSection title="Informations principales">
          <PrintFieldLine label="No matricule" value="............................................................" />
          <PrintFieldLine label="Ethnie" value="............................................................" />
          <PrintFieldLine label="Conseiller et temoin" value="............................................................" />
          <PrintFieldLine label="Cellule d'accueil" value="............................................................" />
          <PrintFieldLine label="Responsable" value="............................................................" />
          <PrintFieldLine label="Nom et prenoms" value=".............................................................................." />
          <PrintFieldLine label="Profession" value="............................................................" />
          <PrintFieldLine label="Contact" value="............................................................" />
          <PrintFieldLine label="Lieu de residence" value="............................................................" />
          <PrintFieldLine label="Secteur" value="............................................................" />
          <PrintFieldLine label="Provenance religieuse" value="............................................................" />
        </PrintFormSection>

        <PrintFormSection title="Situation et niveau">
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#27415f', mb: 0.75 }}>
              Situation matrimoniale
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <PrintCheckboxItem label="Celibataire" />
              <PrintCheckboxItem label="Marie(e)" />
              <PrintCheckboxItem label="Fiance(e)" />
              <PrintCheckboxItem label="En concubinage" />
              <PrintCheckboxItem label="Veuf(ve)" />
              <PrintCheckboxItem label="Polygame" />
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#27415f', mb: 0.75 }}>
              Savez-vous lire et ecrire ?
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <PrintCheckboxItem label="Oui" />
              <PrintCheckboxItem label="Non" />
            </Stack>
          </Box>
        </PrintFormSection>

        <PrintFormSection title="Modules a suivre">
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Box sx={{ flex: '1 1 240px' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                1. Le Salut et l&apos;assurance du salut
              </Typography>
              <Typography variant="body2">2. La priere</Typography>
            </Box>
            <Box sx={{ flex: '1 1 240px' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                3. L&apos;importance de la Parole de Dieu
              </Typography>
              <Typography variant="body2">4. Le bapteme d&apos;eau</Typography>
            </Box>
            <Box sx={{ flex: '1 1 240px' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                5. Le bapteme dans le Saint-Esprit
              </Typography>
              <Typography variant="body2">6. La declaration de foi</Typography>
            </Box>
          </Stack>
        </PrintFormSection>

        <PrintFormSection title="Programmes des cultes">
          <Typography variant="body2">Dimanche : 7h00 a 10h00 - Culte de louange et d&apos;adoration</Typography>
          <Typography variant="body2">Lundi : 18h30 a 20h15 - Priere de delivrance et d&apos;intercession</Typography>
          <Typography variant="body2">Mardi : 18h30 a 20h15 - Evangelisation et priere pour les malades</Typography>
          <Typography variant="body2">Mercredi : 19h00 a 20h30 - Cellules dans les secteurs</Typography>
          <Typography variant="body2">Jeudi : 18h30 a 20h15 - Priere, edification ou etude biblique</Typography>
        </PrintFormSection>
      </Stack>
    </PrintDocumentLayout>
  );
};

export default CoursDeBaseForm;
