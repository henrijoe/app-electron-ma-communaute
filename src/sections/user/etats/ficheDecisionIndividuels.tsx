import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { PrintDocumentLayout } from 'src/components/print/print-document';
import {
  PrintCheckboxItem,
  PrintFieldLine,
  PrintFormSection,
} from 'src/components/print/print-form-kit';
import type { IReduxState } from '../../../store/store';

export const FicheDecisionIndividuelPDf = () => {
  const membreItem = useSelector((state: IReduxState) => state.membre.membreItem);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);

  // On prepare une date lisible uniquement si la decision est bien renseignee.
  const decisionDate = membreItem?.dateDecisionMembre
    ? moment(membreItem.dateDecisionMembre).format('DD/MM/YYYY')
    : '';

  return (
    <PrintDocumentLayout
      identity={utilisateurData}
      title="Fiche de decision individuelle"
    >
      <Stack spacing={2.25}>
        <PrintFormSection title="Identite du membre">
          <PrintFieldLine label="Nom" value={membreItem?.nomMembre} />
          <PrintFieldLine label="Prenoms" value={membreItem?.prenomMembre} />
          <PrintFieldLine label="Ethnie" value={membreItem?.ethnieMembre} />
          <PrintFieldLine label="Age" value="" />
          <PrintFieldLine label="Profession" value={membreItem?.fonctionMembre} />
          <PrintFieldLine label="Lieu de travail" value="" />
          <PrintFieldLine label="Contact" value={membreItem?.contactMembre} />
          <PrintFieldLine label="Quartier de residence" value={membreItem?.residenceMembre} />
        </PrintFormSection>

        <PrintFormSection title="Situation personnelle">
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#27415f', mb: 0.75 }}>
              Statut matrimonial
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <PrintCheckboxItem
                label="Marie(e)"
                checked={membreItem?.situationMatrimonialeMembre === 'Marié(e)'}
              />
              <PrintCheckboxItem
                label="Concubinage"
                checked={membreItem?.situationMatrimonialeMembre === 'Concubinage'}
              />
              <PrintCheckboxItem
                label="Celibataire"
                checked={membreItem?.situationMatrimonialeMembre === 'Célibataire'}
              />
              <PrintCheckboxItem
                label="Copain / Copine"
                checked={membreItem?.situationMatrimonialeMembre === 'Copain/Copine'}
              />
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#27415f', mb: 0.75 }}>
              Savez-vous lire et ecrire ?
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <PrintCheckboxItem
                label="Oui"
                checked={membreItem?.idNiveauEtude !== 14 && membreItem?.idNiveauEtude !== null}
              />
              <PrintCheckboxItem label="Non" checked={membreItem?.idNiveauEtude === 14} />
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#27415f', mb: 0.75 }}>
              Parlez-vous couramment francais ?
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <PrintCheckboxItem
                label="Oui"
                checked={membreItem?.idNiveauEtude !== 14 && membreItem?.idNiveauEtude !== null}
              />
              <PrintCheckboxItem label="Non" checked={membreItem?.idNiveauEtude === 14} />
            </Stack>
          </Box>
        </PrintFormSection>

        <PrintFormSection title="Suivi et visitation">
          <PrintFieldLine label="Nom d'un ami dans l'eglise" value="" />

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#27415f', mb: 0.75 }}>
              Peut recevoir de la visite ?
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <PrintCheckboxItem label="Oui" checked={membreItem?.visiteMembre === 'Oui'} />
              <PrintFieldLine label="Heure" value={membreItem?.heureVisiteMembre} flex={0.55} />
            </Stack>
          </Box>

          <PrintFieldLine label="Si non, pourquoi ?" value={membreItem?.raisonNonVisiteMembre} />
        </PrintFormSection>

        <PrintFormSection title="Engagement spirituel">
          <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.8 }}>
            NB : A remplir et a ramener a la prochaine reunion.
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
              Decision
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.75, color: '#1e293b', fontStyle: 'italic' }}>
              « Me reconnaissant(e) pecheur et perdu, je decide d&apos;accepter JESUS comme
              Seigneur et Sauveur personnel »
            </Typography>
          </Box>

          <PrintFieldLine label="Date" value={decisionDate} />
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
            Les cours de base ont lieu tous les dimanches apres le culte a l&apos;eglise.
          </Typography>
        </Box>
      </Stack>
    </PrintDocumentLayout>
  );
};
