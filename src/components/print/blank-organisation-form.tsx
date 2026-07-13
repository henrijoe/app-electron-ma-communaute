import type { ReactNode } from 'react';

import { useSelector } from 'react-redux';

import { Box, Grid, Stack, Typography, GlobalStyles } from '@mui/material';

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

export type BlankOrganisationField = {
  label: string;
  size?: number;
  type?: 'line' | 'textarea' | 'checks';
  options?: string[];
};

export type BlankOrganisationSection = {
  title: string;
  fields: BlankOrganisationField[];
};

type BlankOrganisationFormProps = {
  title: string;
  subtitle?: string;
  sections: BlankOrganisationSection[];
};

type BlankLineProps = Pick<BlankOrganisationField, 'label' | 'type' | 'options'>;

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

function BlankLine({ label, type = 'line', options = [] }: BlankLineProps) {
  if (type === 'checks') {
    return (
      <Box>
        <Typography sx={{ mb: 0.85, fontSize: 11.5, fontWeight: 800, color: '#344054' }}>
          {label}
        </Typography>
        <Stack direction="row" spacing={1.6} rowGap={0.85} flexWrap="wrap">
          {options.map((option) => (
            <Stack key={option} direction="row" alignItems="center" spacing={0.65}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  border: '1.6px solid #0f274a',
                  borderRadius: 0.4,
                }}
              />
              <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#344054' }}>
                {option}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{ mb: 0.85, fontSize: 11.5, fontWeight: 800, color: '#344054' }}>
        {label}
      </Typography>
      <Box
        sx={{
          height: type === 'textarea' ? 68 : 24,
          borderBottom: type === 'textarea' ? '1.2px dotted #101828' : '1.4px dotted #101828',
          backgroundImage:
            type === 'textarea'
              ? 'repeating-linear-gradient(to bottom, transparent 0, transparent 22px, #101828 23px)'
              : 'none',
          backgroundSize: '100% 23px',
        }}
      />
    </Box>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        border: '1px solid #d0d7e2',
        borderRadius: 2,
        overflow: 'hidden',
        breakInside: 'avoid',
      }}
    >
      <Box sx={{ bgcolor: '#eaf1fb', borderBottom: '1px solid #d0d7e2', px: 1.25, py: 0.5 }}>
        <Typography
          sx={{
            color: '#0f274a',
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 0.7,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 1.45 }}>{children}</Box>
    </Box>
  );
}

export function BlankOrganisationForm({ title, subtitle, sections }: BlankOrganisationFormProps) {
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
            '.blank-organisation-form-root': {
              boxShadow: 'none !important',
              paddingBottom: '13mm',
            },
            '.blank-organisation-form-footer': {
              position: 'fixed',
              left: '10mm',
              right: '10mm',
              bottom: '5mm',
              background: '#ffffff',
            },
          },
        }}
      />

      <Box
        className="blank-organisation-form-root"
        sx={{
          width: '190mm',
          minHeight: '277mm',
          mx: 'auto',
          bgcolor: '#ffffff',
          color: '#101828',
          fontFamily: '"Barlow", "DM Sans", Arial, sans-serif',
          border: '1px solid #e4e7ec',
          boxShadow: '0 18px 50px rgba(15, 23, 42, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          '@media print': {
            width: '100%',
            minHeight: 'auto',
            border: 0,
          },
        }}
      >
        <Box sx={{ bgcolor: '#020617', color: '#ffffff', px: 2, py: 1.05 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
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
                  alt="Logo église"
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography sx={{ color: '#0f172a', fontWeight: 900 }}>MC</Typography>
              )}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase' }}>
                {identity.nomEgliseCourt || identity.nomTemple || 'Ma Communauté'}
              </Typography>
              <Typography sx={{ fontSize: 19, fontWeight: 900, lineHeight: 1.05 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography sx={{ mt: 0.45, fontSize: 11, color: '#cbd5e1' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>

        <Stack spacing={1.25} sx={{ px: 1.4, pt: 1.8, pb: 1.25, flex: 1 }}>
          {sections.map((section) => (
            <FormSection key={section.title} title={section.title}>
              <Grid container spacing={1.25}>
                {section.fields.map((field) => (
                  <Grid item xs={field.size || 6} key={`${section.title}-${field.label}`}>
                    <BlankLine label={field.label} type={field.type} options={field.options} />
                  </Grid>
                ))}
              </Grid>
            </FormSection>
          ))}

          <FormSection title="Validation interne">
            <Grid container spacing={1.25}>
              <Grid item xs={4}>
                <BlankLine label="Date de réception" />
              </Grid>
              <Grid item xs={4}>
                <BlankLine label="Agent ayant reçu la fiche" />
              </Grid>
              <Grid item xs={4}>
                <BlankLine label="Signature" />
              </Grid>
              <Grid item xs={12}>
                <BlankLine
                  label="État du traitement"
                  type="checks"
                  options={['À créer', 'À vérifier', 'Enregistré']}
                />
              </Grid>
            </Grid>
          </FormSection>
        </Stack>

        <Box className="blank-organisation-form-footer" sx={{ px: 1.4, pb: 1.1, mt: 'auto' }}>
          <Typography sx={{ color: '#667085', fontSize: 10 }}>
            {contactLine || "Document interne de l'église"}
          </Typography>
        </Box>
      </Box>
    </>
  );
}
