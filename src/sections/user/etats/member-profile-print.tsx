import { useSelector } from 'react-redux';

import {
  Box,
  Grid,
  Stack,
  Avatar,
  Divider,
  Typography,
  GlobalStyles,
} from '@mui/material';

import { buildChurchLogoUrl } from 'src/utils/apiClient';
import { resolveStaticAssetUrl } from 'src/utils/asset-url';

import type { IMembre } from '../../../store/membreSlice';

type MemberProfilePrintProps = {
  membre: IMembre;
  fullName: string;
  profilePhoto: string | null;
  labels: {
    civilite: string;
    sexe: string;
    situationMatrimoniale: string;
    niveauEtude: string;
    departement: string;
    cellule: string;
    groupe: string;
    responsabilite: string;
    baptemeEau: string;
    baptemeSaintEsprit: string;
    nouvelleAme: string;
    visite: string;
    capaciteSpirituelle: string;
  };
  formatDate: (date: string | null | undefined) => string;
  resolveLabel: (value?: string | null) => string;
};

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

function joinValues(...values: Array<string | undefined>): string {
  return values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' - ');
}

export function MemberProfilePrint({
  membre,
  fullName,
  profilePhoto,
  labels,
  formatDate,
  resolveLabel,
}: MemberProfilePrintProps) {
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
            margin: '8mm',
          },
          '@media print': {
            'html, body': {
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            },
            '.member-profile-print-root': {
              boxShadow: 'none !important',
            },
          },
        }}
      />

      <Box
        className="member-profile-print-root"
        sx={{
          width: '190mm',
          minHeight: '270mm',
          mx: 'auto',
          bgcolor: '#ffffff',
          color: '#101828',
          fontFamily: '"Barlow", "DM Sans", Arial, sans-serif',
          overflow: 'hidden',
          border: '1px solid #e4e7ec',
          boxShadow: '0 18px 50px rgba(15, 23, 42, 0.16)',
          '@media print': {
            width: '100%',
            minHeight: 'auto',
            border: 0,
          },
        }}
      >
        <Box sx={{ bgcolor: '#020617', color: '#ffffff', px: 3, pt: 2.2, pb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 2,
                bgcolor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                p: 0.6,
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
            <Box>
              <Typography sx={{ fontSize: 13, letterSpacing: 1.6, textTransform: 'uppercase' }}>
                Fiche personnelle
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                {identity.nomEgliseCourt || identity.nomTemple || 'Ma Communauté'}
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={4}>
              <Avatar
                src={profilePhoto || undefined}
                alt={fullName}
                sx={{
                  width: 150,
                  height: 150,
                  border: '5px solid #ffffff',
                  bgcolor: '#e2e8f0',
                  color: '#0f172a',
                  fontSize: 42,
                  fontWeight: 800,
                }}
              >
                {fullName
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')}
              </Avatar>
            </Grid>
            <Grid item xs={8}>
              <Typography sx={{ fontSize: 34, lineHeight: 1.05, fontWeight: 900 }}>
                {fullName}
              </Typography>
              <Typography sx={{ mt: 1, color: '#cbd5e1', fontSize: 16, fontWeight: 700 }}>
                {labels.responsabilite} | {resolveLabel(membre.fonctionMembre)}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Badge label={labels.sexe} />
                <Badge label={labels.situationMatrimoniale} />
                <Badge label={`Baptisé(e) : ${labels.baptemeEau}`} />
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Grid container sx={{ px: 3, pb: 2, mt: -4 }}>
          <Grid item xs={4}>
            <Box
              sx={{
                bgcolor: '#f8fafc',
                borderRadius: 3,
                p: 2.5,
                border: '1px solid #e4e7ec',
              }}
            >
              <PrintSectionTitle dark title="Contact" />
              <Fact label="Téléphone" value={resolveLabel(membre.contactMembre)} />
              <Fact label="Email" value={resolveLabel(membre.emailMembre)} />
              <Fact label="Résidence" value={resolveLabel(membre.residenceMembre)} />
              <Fact label="Contact parent" value={resolveLabel(membre.contactParentMembre)} />

              <Divider sx={{ my: 2 }} />
              <PrintSectionTitle dark title="Église" />
              <Fact label="Cellule" value={labels.cellule} />
              <Fact label="Département" value={labels.departement} />
              <Fact label="Groupe" value={labels.groupe} />
              <Fact label="Responsabilité" value={labels.responsabilite} />

              <Divider sx={{ my: 2 }} />
              <PrintSectionTitle dark title="Origine" />
              <Fact label="Nationalité" value={resolveLabel(membre.nationaliteMembre)} />
              <Fact label="Ethnie" value={resolveLabel(membre.ethnieMembre)} />
              <Fact label="Église d’origine" value={resolveLabel(membre.egliseOrigineMembre)} />
            </Box>
          </Grid>

          <Grid item xs={8} sx={{ pl: 3 }}>
            <Box
              sx={{
                bgcolor: '#ffffff',
                borderRadius: 3,
                p: 2,
                border: '1px solid #e4e7ec',
              }}
            >
              <PrintSectionTitle title="A propos du membre" />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Fact label="Identité" value={`${labels.civilite} | ${labels.sexe}`} />
                </Grid>
                <Grid item xs={6}>
                  <Fact
                    label="Naissance"
                    value={`${formatDate(membre.dateNaissMembre)} | ${resolveLabel(membre.lieuNaissMembre)}`}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Situation matrimoniale" value={labels.situationMatrimoniale} />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Fiancé(e)" value={resolveLabel(membre.nomFiance)} />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Niveau d’étude" value={labels.niveauEtude} />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Nombre d'enfant(s)" value={String(membre.nombreEnfantMembre || 0)} />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <PrintSectionTitle title="Parcours personnel" />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Fact label="Fonction" value={resolveLabel(membre.fonctionMembre)} />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Lieu de travail" value={resolveLabel(membre.lieuTravailMembre)} />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Date de mariage" value={formatDate(membre.dateMariageMembre)} />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Parent / tuteur" value={resolveLabel(membre.nomPrenomParentMembre)} />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <PrintSectionTitle title="Parcours spirituel" />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Fact label="Nouvelle âme" value={labels.nouvelleAme} />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Date de décision" value={formatDate(membre.dateDecisionMembre)} />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Baptême d’eau" value={labels.baptemeEau} />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Date du baptême d’eau" value={formatDate(membre.dateBaptemeMembre)} />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Lieu du baptême" value={resolveLabel(membre.lieuBaptemeEauMembre)} />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Baptême Saint-Esprit" value={labels.baptemeSaintEsprit} />
                </Grid>
                <Grid item xs={6}>
                  <Fact
                    label="Date baptême Saint-Esprit"
                    value={formatDate(membre.dateBaptemeSaintEspritMembre)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Capacité spirituelle" value={labels.capaciteSpirituelle} />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Visite" value={labels.visite} />
                </Grid>
                <Grid item xs={6}>
                  <Fact label="Ami à l’église" value={resolveLabel(membre.nomAmiEglise)} />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ px: 2, pb: 1, color: '#667085', fontSize: 11 }}>
          <Divider sx={{ mb: 1 }} />
          {contactLine || "Document interne de l'église"} | Généré depuis Ma Communauté
        </Box>
      </Box>
    </>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        px: 1.3,
        py: 0.45,
        borderRadius: 999,
        bgcolor: 'rgba(255, 255, 255, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.22)',
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {label}
    </Box>
  );
}

function PrintSectionTitle({ title, dark = false }: { title: string; dark?: boolean }) {
  return (
    <Typography
      sx={{
        mb: 1.4,
        fontSize: 15,
        fontWeight: 900,
        color: dark ? '#020617' : '#0f172a',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {title}
    </Typography>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 1.45, breakInside: 'avoid' }}>
      <Typography sx={{ color: '#667085', fontSize: 11, fontWeight: 800 }}>
        {label}
      </Typography>
      <Typography sx={{ color: '#101828', fontSize: 13, fontWeight: 800, lineHeight: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default MemberProfilePrint;
