import type { ReactNode } from 'react';

import { useSelector } from 'react-redux';

import {
  Box,
  Grid,
  Stack,
  Divider,
  Typography,
  GlobalStyles,
} from '@mui/material';

import { buildChurchLogoUrl } from 'src/utils/apiClient';
import { resolveStaticAssetUrl } from 'src/utils/asset-url';

type PrintIdentity = {
  logoEglise?: string;
  logoUtilisateur?: string;
  nomTemple?: string;
  nomEgliseCourt?: string;
  lieuEglise?: string;
  telephoneSecretariatEglise?: string;
  emailEglise?: string;
};

const getLogoUrl = (identity: PrintIdentity): string | null => {
  const logoPath = identity.logoEglise || identity.logoUtilisateur;

  if (!logoPath) return null;
  if (/^(https?:|data:|blob:|file:)/i.test(logoPath)) return logoPath;
  if (identity.logoEglise && logoPath === identity.logoEglise) return buildChurchLogoUrl(logoPath);

  return resolveStaticAssetUrl(logoPath);
};

const joinValues = (...values: Array<string | undefined>): string =>
  values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' - ');

export function FicheInscriptionMembre() {
  const userConnected = useSelector((state: any) => state.application?.userConnected);
  const utilisateurData = useSelector((state: any) => state.authentification?.utilisateurData);
  const identity: PrintIdentity = {
    ...(utilisateurData || {}),
    ...(userConnected || {}),
  };
  const logoUrl = getLogoUrl(identity);
  const contactLine = joinValues(
    identity.lieuEglise,
    identity.telephoneSecretariatEglise,
    identity.emailEglise
  );

  return (
    <>
      <GlobalStyles
        styles={{
          '@page': {
            size: 'A4 portrait',
            margin: '10mm',
          },
          '@media print': {
            'html, body': {
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            },
            '.member-registration-print-root': {
              boxShadow: 'none !important',
            },
          },
        }}
      />

      <Box
        className="member-registration-print-root"
        sx={{
          width: '200mm',
          mx: 'auto',
          bgcolor: '#ffffff',
          color: '#101828',
          fontFamily: '"Barlow", "DM Sans", Arial, sans-serif',
          border: '1px solid #e4e7ec',
          boxShadow: '0 18px 50px rgba(15, 23, 42, 0.16)',
          '@media print': {
            width: '100%',
            border: 0,
            boxShadow: 'none',
          },
        }}
      >
        <Box sx={{ bgcolor: '#020617', color: '#ffffff', px: 2, py: 1.2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1.2}>
              
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1.1,
                  bgcolor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  p: 0.4,
                }}
              >
                {logoUrl ? (
                  <Box
                    component="img"
                    src={logoUrl}
                    alt="Logo eglise"
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Typography sx={{ color: '#0f172a', fontWeight: 900 }}>MC</Typography>
                )}
              </Box>

              <Box>
                <Typography sx={{ fontSize: 9.5, letterSpacing: 1.1, textTransform: 'uppercase' }}>
                  {identity.nomEgliseCourt || identity.nomTemple || 'Ma Communaute'}
                </Typography>
                <Typography sx={{ fontSize: 17, fontWeight: 900, lineHeight: 1 }}>
                  Fiche d&apos;inscription membre
                </Typography>
              </Box>
            </Stack>

          </Stack>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1.9, pt: 1.35 }}>
          <Box
            sx={{
              width: '38mm',
              height: '42mm',
              border: '2px dashed #98a2b3',
              borderRadius: 1.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              color: '#475467',
              px: 1,
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'inherit' }}>
              Photo du membre
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1} sx={{ px: 1.9, pt: 1.2, pb: 1.9 }}>
          <Section title="Identité du membre">
            <Grid container spacing={1}>
              <Grid item xs={8}>
                <Line label="Nom" />
              </Grid>
              <Grid item xs={4}>
                <Line label="Civilité" />
              </Grid>
              <Grid item xs={8}>
                <Line label="Prénoms" />
              </Grid>
              <Grid item xs={4}>
                <CheckRow label="Sexe" options={['M', 'F']} />
              </Grid>
              <Grid item xs={4}>
                <Line label="Date de naissance" />
              </Grid>
              <Grid item xs={4}>
                <Line label="Lieu de naissance" />
              </Grid>
              <Grid item xs={4}>
                <Line label="Nationalité" />
              </Grid>
              <Grid item xs={4}>
                <Line label="Ethnie" />
              </Grid>
              <Grid item xs={4}>
                <Line label="Situation matrimoniale" />
              </Grid>
              <Grid item xs={4}>
                <Line label="Nom fiancé(e) / conjoint" />
              </Grid>
              <Grid item xs={6}>
                <Line label="Niveau d'étude" />
              </Grid>
              <Grid item xs={6}>
                <Line label="Nombre d'enfant(s)" />
              </Grid>
            </Grid>
          </Section>

          <Section title="Contacts et adresse">
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Line label="Téléphone" />
              </Grid>
              <Grid item xs={4}>
                <Line label="Email" />
              </Grid>
              <Grid item xs={4}>
                <Line label="Residence" />
              </Grid>
              <Grid item xs={6}>
                <Line label="Lieu de travail" />
              </Grid>
              <Grid item xs={6}>
                <Line label="Fonction / profession" />
              </Grid>
              <Grid item xs={6}>
                <Line label="Parent / tuteur" />
              </Grid>
              <Grid item xs={6}>
                <Line label="Contact parent / tuteur" />
              </Grid>
            </Grid>
          </Section>

          <Section title="Informations spirituelles">
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <CheckRow label="Nouvelle âme" options={['Oui', 'Non']} />
              </Grid>
              <Grid item xs={4}>
                <Line label="Date de décision" />
              </Grid>
              <Grid item xs={4}>
                <Line label="Ami à l'église" />
              </Grid>
              <Grid item xs={4}>
                <CheckRow label="Baptème d'eau" options={['Oui', 'Non']} />
              </Grid>
              <Grid item xs={4}>
                <Line label="Date baptème d'eau" />
              </Grid>
              <Grid item xs={4}>
                <Line label="Lieu baptème d'eau" />
              </Grid>
              <Grid item xs={4}>
                <CheckRow label="Baptème Saint-Esprit" options={['Oui', 'Non']} />
              </Grid>
              <Grid item xs={4}>
                <Line label="Date baptème Saint-Esprit" />
              </Grid>
              <Grid item xs={4}>
                <Line label="Capacité spirituelle" />
              </Grid>
              <Grid item xs={6}>
                <Line label="Église d'origine" />
              </Grid>
              <Grid item xs={6}>
                <Line label="Date de mariage" />
              </Grid>
            </Grid>
          </Section>

          <Section title="Rattachement dans l'église">
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Line label="Cellule" />
              </Grid>
              <Grid item xs={4}>
                <Line label="Département" />
              </Grid>
              <Grid item xs={4}>
                <Line label="Groupe" />
              </Grid>
              <Grid item xs={6}>
                <Line label="Responsabilité" />
              </Grid>
              <Grid item xs={6}>
                <CheckRow label="Visite pastorale" options={['Oui', 'Non']} />
              </Grid>
              <Grid item xs={12}>
                <Line label="Raison de non-visite / observation" />
              </Grid>
            </Grid>
          </Section>

          <Section title="Validation">
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Line label="Date de remplissage" />
              </Grid>
              <Grid item xs={6}>
                <Line label="Signature du membre" />
              </Grid>
              <Grid item xs={6}>
                <Line label="Reçu par" />
              </Grid>
              <Grid item xs={6}>
                <Line label="Date de saisie" />
              </Grid>
            </Grid>
          </Section>
        </Stack>

        <Box sx={{ px: 1.4, pb: 0.7, color: '#667085', fontSize: 9.5 }}>
          <Divider sx={{ mb: 0.5 }} />
          {contactLine || "Document interne de l'église"} | Fiche à remplir lisiblement avant saisie
          dans l&apos;application.
        </Box>
      </Box>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        border: '1px solid #d8e0ea',
        borderRadius: 1.4,
        overflow: 'hidden',
        breakInside: 'avoid',
      }}
    >
      <Box sx={{ bgcolor: '#eef4ff', px: 1.1, py: 0.45, borderBottom: '1px solid #d8e0ea' }}>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 900,
            color: '#0f274a',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 1 }}>{children}</Box>
    </Box>
  );
}

function Line({ label }: { label: string }) {
  return (
    <Box>
      <Typography sx={{ color: '#475467', fontSize: 9.5, fontWeight: 800, mb: 0.05 }}>
        {label}
      </Typography>
      <Box sx={{ height: 15, borderBottom: '1.2px dotted #475467' }} />
    </Box>
  );
}

function CheckRow({ label, options }: { label: string; options: string[] }) {
  return (
    <Box>
      <Typography sx={{ color: '#475467', fontSize: 9.5, fontWeight: 800, mb: 0.3 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {options.map((option) => (
          <Stack key={option} direction="row" spacing={0.45} alignItems="center">
            <Box sx={{ width: 10, height: 10, border: '1.2px solid #334155' }} />
            <Typography sx={{ fontSize: 10.5, fontWeight: 700 }}>{option}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

export default FicheInscriptionMembre;
