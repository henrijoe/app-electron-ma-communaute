import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
  CalendarToday as CalendarIcon,
  Church as ChurchIcon,
  Email as EmailIcon,
  FamilyRestroom as FamilyIcon,
  Favorite as FavoriteIcon,
  Flag as FlagIcon,
  Groups as GroupsIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  WaterDrop as WaterIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import type { IMembre } from '../../../../store/membreSlice';
import { dataResponsabilite } from '../../../../store/membreSlice';
import { getPhotoUrl } from '../../utils';

type RootState = any;

const DEFAULT_VALUE = 'Non specifie';

const NIVEAU_ETUDE_LABELS: Record<number, string> = {
  1: 'Primaire',
  2: 'College',
  3: 'BEPC',
  4: 'Lycee',
  5: 'BAC',
  6: 'Bac+1',
  7: 'Bac+2',
  8: 'Licence 3',
  9: 'Master 1',
  10: 'Master 2',
  13: 'Doctorat',
  14: 'Aucun',
};

const SITUATION_LABELS: Record<string, string> = {
  '1': 'Celibataire',
  '2': 'Celibataire sans enfant',
  '3': 'Fiance(e)',
  '4': 'Concubinage',
  '5': 'Marie(e)',
  '6': 'Divorce(e)',
  '7': 'Veuve',
  '8': 'Veuf',
  '9': 'Copain/Copine',
  '10': 'Polygame',
};

const CIVILITE_LABELS: Record<string, string> = {
  '1': 'Monsieur',
  '2': 'Madame',
  '3': 'Mademoiselle',
};

const CAPACITE_SPIRITUELLE_LABELS: Record<string, string> = {
  '1': 'Bonne',
  '2': 'Moyenne',
  '3': 'Nouvellement convertie',
};

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return DEFAULT_VALUE;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return DEFAULT_VALUE;

  return date.toLocaleDateString('fr-FR');
}

function getSimpleYesNo(value: string | null | undefined): string {
  if (value === '1') return 'Oui';
  if (value === '2') return 'Non';
  return DEFAULT_VALUE;
}

function getSexeLabel(value: string | null | undefined): string {
  if (value === '1') return 'Homme';
  if (value === '2') return 'Femme';
  return DEFAULT_VALUE;
}

function resolveLabel(value?: string | null): string {
  return value && value.trim() ? value : DEFAULT_VALUE;
}

export function MembreDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  // Le detail se base sur les listes deja chargees dans le store.
  const { listMembre, listResponsabilite } = useSelector((state: RootState) => state.membre);
  const listDepartement = useSelector((state: RootState) => state.departement.listDepartement);
  const listCellule = useSelector((state: RootState) => state.cellule.listCellule);
  const listGroupe = useSelector((state: RootState) => state.groupe.listGroupe);

  const membre = useMemo<IMembre | null>(() => {
    if (!id || !Array.isArray(listMembre)) return null;
    return listMembre.find((item: IMembre) => String(item.idMembre) === id) || null;
  }, [id, listMembre]);

  const fullName = resolveLabel(`${membre?.nomMembre || ''} ${membre?.prenomMembre || ''}`.trim());
  const profilePhoto = membre ? getPhotoUrl(membre.photoMembre) : null;

  const getNiveauEtudeLabel = (niveauId: number | null): string => {
    if (!niveauId) return DEFAULT_VALUE;
    return NIVEAU_ETUDE_LABELS[niveauId] || DEFAULT_VALUE;
  };

  const getDepartementLabel = (departementId: number | null): string => {
    if (!departementId || !Array.isArray(listDepartement)) return DEFAULT_VALUE;
    const departement = listDepartement.find((item: any) => item.idDepartement === departementId);
    return resolveLabel(departement?.libelleLongDepartement);
  };

  const getCelluleLabel = (celluleId: number | null): string => {
    if (!celluleId || !Array.isArray(listCellule)) return DEFAULT_VALUE;
    const cellule = listCellule.find((item: any) => item.idCellule === celluleId);
    return resolveLabel(cellule?.nomCellule);
  };

  const getGroupeLabel = (groupeId: number | null): string => {
    if (!groupeId || !Array.isArray(listGroupe)) return DEFAULT_VALUE;
    const groupe = listGroupe.find((item: any) => item.idGroupe === groupeId);
    return resolveLabel(groupe?.libelleGroupe);
  };

  const getResponsabiliteLabel = (responsabiliteId: number | null): string => {
    if (!responsabiliteId) return DEFAULT_VALUE;

    const dynamique =
      Array.isArray(listResponsabilite) &&
      listResponsabilite.find((item: any) => item.idResponsabilite === responsabiliteId);
    if (dynamique?.libelleResponsabilite) return dynamique.libelleResponsabilite;

    const statique = dataResponsabilite.find((item: any) => item.value === responsabiliteId);
    return statique?.label || DEFAULT_VALUE;
  };

  if (!membre) {
    return (
      <DashboardContent>
        <Container maxWidth="xl">
          <Button startIcon={<ArrowBackIcon />} sx={{ mb: 3 }} onClick={() => navigate('/user')}>
            Retour
          </Button>
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" color="text.secondary">
              Membre non trouve
            </Typography>
          </Card>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Button startIcon={<ArrowBackIcon />} sx={{ mb: 3 }} onClick={() => navigate('/user')}>
          Retour
        </Button>

        {/* Hero social avec couverture et avatar superpose. */}
        <Card
          sx={{
            mb: 3,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            boxShadow: `0 20px 50px ${alpha(theme.palette.common.black, 0.08)}`,
          }}
        >
          <Box
            sx={{
              height: { xs: 220, md: 280 },
              px: { xs: 3, md: 5 },
              py: { xs: 3, md: 4 },
              position: 'relative',
              color: theme.palette.common.white,
              background: `
                radial-gradient(circle at top left, ${alpha(theme.palette.common.white, 0.22)} 0, transparent 30%),
                radial-gradient(circle at bottom right, ${alpha(theme.palette.info.light, 0.4)} 0, transparent 28%),
                linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 52%, ${theme.palette.info.main} 100%)
              `,
            }}
          >

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              spacing={2}
              sx={{ position: 'relative', zIndex: 1 }}
            >
              <Box>
                <Typography variant="h3" sx={{ mt: 1, maxWidth: 680, fontWeight: 800 }}>
                  {fullName}
                </Typography>
          
              </Box>

     
            </Stack>
          </Box>

          <Box sx={{ px: { xs: 3, md: 5 }, pb: 4, mt: { xs: -7, md: -9 }, position: 'relative' }}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={3}
              alignItems={{ xs: 'flex-start', lg: 'flex-end' }}
            >
              <Avatar
                src={profilePhoto || undefined}
                alt={fullName}
                sx={{
                  width: { xs: 128, md: 168 },
                  height: { xs: 128, md: 168 },
                  border: `5px solid ${theme.palette.common.white}`,
                  boxShadow: `0 14px 40px ${alpha(theme.palette.common.black, 0.20)}`,
                }}
              />

              <Box sx={{ flexGrow: 1, pt: { xs: 0, lg: 3 } }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip color="primary" variant="outlined" label={getSexeLabel(membre.sexeMembre)} />
                    <Chip
                      color="secondary"
                      variant="outlined"
                      label={SITUATION_LABELS[membre.situationMatrimonialeMembre] || DEFAULT_VALUE}
                    />
                    <Chip
                      color={membre.baptemeEauMembre === '1' ? 'success' : 'default'}
                      variant="outlined"
                      label={`Baptise(e) : ${getSimpleYesNo(membre.baptemeEauMembre)}`}
                    />
                  </Stack>

                  <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                    <TimelineStat
                      label="Cellule"
                      value={getCelluleLabel(membre.idCellule)}
                      accent={theme.palette.warning.main}
                    />
                    <TimelineStat
                      label="Departement"
                      value={getDepartementLabel(membre.idDepartement)}
                      accent={theme.palette.info.main}
                    />
                    <TimelineStat
                      label="Groupe"
                      value={getGroupeLabel(membre.idGroupe)}
                      accent={theme.palette.success.main}
                    />
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  A propos
                </Typography>
                <Stack spacing={2}>
                  <ProfileFact
                    icon={<PersonIcon color="primary" />}
                    label="Identite"
                    value={`${CIVILITE_LABELS[membre.civiliteMembre] || DEFAULT_VALUE} • ${getSexeLabel(membre.sexeMembre)}`}
                  />
                  <ProfileFact
                    icon={<CalendarIcon color="primary" />}
                    label="Naissance"
                    value={`${formatDate(membre.dateNaissMembre)} • ${resolveLabel(membre.lieuNaissMembre)}`}
                  />

                    <ProfileFact
                      icon={<FavoriteIcon color="primary" />}
                      label="Situation matrimoniale"
                      value={SITUATION_LABELS[membre.situationMatrimonialeMembre] || DEFAULT_VALUE}
                    />
                  <ProfileFact
                    icon={<FlagIcon color="primary" />}
                    label="Origine"
                    value={`${resolveLabel(membre.nationaliteMembre)} • ${resolveLabel(membre.ethnieMembre)}`}
                  />
                  {/* <ProfileFact
                    icon={<SchoolIcon color="primary" />}
                    label="Niveau d'etude"
                    value={getNiveauEtudeLabel(membre.idNiveauEtude)}
                  /> */}
                </Stack>
              </Card>

              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Coordonnees
                </Typography>
                <Stack spacing={2}>
                  <ProfileFact
                    icon={<PhoneIcon color="primary" />}
                    label="Telephone"
                    value={resolveLabel(membre.contactMembre)}
                  />
                  <ProfileFact
                    icon={<EmailIcon color="primary" />}
                    label="Email"
                    value={resolveLabel(membre.emailMembre)}
                  />
                  <ProfileFact
                    icon={<LocationIcon color="primary" />}
                    label="Residence"
                    value={resolveLabel(membre.residenceMembre)}
                  />
                  <ProfileFact
                    icon={<FamilyIcon color="primary" />}
                    label="Contact parent"
                    value={resolveLabel(membre.contactParentMembre)}
                  />
                </Stack>
              </Card>

              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  color: theme.palette.primary.darker,
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Statut spirituel
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {CAPACITE_SPIRITUELLE_LABELS[membre.capaciteSpirituelleMembre] || DEFAULT_VALUE}
                </Typography>
                <Stack spacing={1.5}>
                  <QuickStatLine label="Decision" value={formatDate(membre.dateDecisionMembre)} />
                  <QuickStatLine label="Visite" value={getSimpleYesNo(membre.visiteMembre)} />
                  <QuickStatLine label="Nouvelle ame" value={getSimpleYesNo(membre.nouvelleAmeMembre)} />
                </Stack>
              </Card>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Parcours personnel
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2.5}>
           
                  <Grid item xs={12} md={6}>
                    <InfoBlock
                      icon={<WorkIcon color="primary" />}
                      title="Fonction"
                      value={resolveLabel(membre.fonctionMembre)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoBlock
                      icon={<LocationIcon color="primary" />}
                      title="Lieu de travail"
                      value={resolveLabel(membre.lieuTravailMembre)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoBlock
                      icon={<SchoolIcon color="primary" />}
                      title="Niveau d'etude"
                      value={getNiveauEtudeLabel(membre.idNiveauEtude)}
                    />
                  </Grid>
                  {membre.situationMatrimonialeMembre === '3' && (
                    <Grid item xs={12} md={6}>
                      <InfoBlock
                        icon={<PersonIcon color="primary" />}
                        title="Fiance(e)"
                        value={resolveLabel(membre.nomFiance)}
                      />
                    </Grid>
                  )}
                  {membre.situationMatrimonialeMembre === '5' && (
                    <Grid item xs={12} md={6}>
                      <InfoBlock
                        icon={<CalendarIcon color="primary" />}
                        title="Date de mariage"
                        value={formatDate(membre.dateMariageMembre)}
                      />
                    </Grid>
                  )}
                </Grid>
              </Card>

              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Parcours spirituel
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <InfoBlock
                      icon={<ChurchIcon color="primary" />}
                      title="Eglise d'origine"
                      value={resolveLabel(membre.egliseOrigineMembre)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoBlock
                      icon={<CalendarIcon color="primary" />}
                      title="Date de conversion"
                      value={formatDate(membre.dateConversionMembre)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoBlock
                      icon={<WaterIcon color="primary" />}
                      title="Bapteme d'eau"
                      value={getSimpleYesNo(membre.baptemeEauMembre)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoBlock
                      icon={<AutoAwesomeIcon color="primary" />}
                      title="Bapteme du Saint-Esprit"
                      value={getSimpleYesNo(membre.baptemeSaintEspritMembre)}
                    />
                  </Grid>
                  {membre.baptemeEauMembre === '1' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <InfoBlock
                          icon={<CalendarIcon color="primary" />}
                          title="Date du bapteme d'eau"
                          value={formatDate(membre.dateBaptemeMembre)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <InfoBlock
                          icon={<LocationIcon color="primary" />}
                          title="Lieu du bapteme"
                          value={resolveLabel(membre.lieuBaptemeEauMembre)}
                        />
                      </Grid>
                    </>
                  )}
                  {membre.baptemeSaintEspritMembre === '1' && (
                    <Grid item xs={12} md={6}>
                      <InfoBlock
                        icon={<CalendarIcon color="primary" />}
                        title="Date bapteme Saint-Esprit"
                        value={formatDate(membre.dateBaptemeSaintEspritMembre)}
                      />
                    </Grid>
                  )}
                </Grid>
              </Card>

              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Vie d&apos;eglise
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <InfoBlock
                      icon={<GroupsIcon color="primary" />}
                      title="Cellule"
                      value={getCelluleLabel(membre.idCellule)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoBlock
                      icon={<GroupsIcon color="primary" />}
                      title="Groupe ethnique"
                      value={getGroupeLabel(membre.idGroupe)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoBlock
                      icon={<ChurchIcon color="primary" />}
                      title="Departement"
                      value={getDepartementLabel(membre.idDepartement)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoBlock
                      icon={<PersonIcon color="primary" />}
                      title="Responsabilite"
                      value={getResponsabiliteLabel(membre.idResponsabilite)}
                    />
                  </Grid>
                  {membre.nouvelleAmeMembre === '1' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <InfoBlock
                          icon={<PersonIcon color="primary" />}
                          title="Inviter par"
                          value={resolveLabel(membre.nomAmiEglise)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <InfoBlock
                          icon={<CalendarIcon color="primary" />}
                          title="Date de decision"
                          value={formatDate(membre.dateDecisionMembre)}
                        />
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12}>
                    <InfoBlock
                      icon={<FamilyIcon color="primary" />}
                      title="Raison de non visite"
                      value={resolveLabel(membre.raisonNonVisiteMembre)}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </DashboardContent>
  );
}

interface ProfileFactProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

// Bloc compact pour les infos rapides sur la colonne de gauche.
function ProfileFact({ icon, label, value }: ProfileFactProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box sx={{ mt: 0.3, color: 'primary.main' }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {resolveLabel(value)}
        </Typography>
      </Box>
    </Stack>
  );
}

interface TimelineStatProps {
  label: string;
  value: string;
  accent: string;
}

// Petit compteur visuel pour rappeler le style des profils sociaux.
function TimelineStat({ label, value, accent }: TimelineStatProps) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: accent }}>
        {resolveLabel(value)}
      </Typography>
    </Box>
  );
}

interface QuickStatLineProps {
  label: string;
  value: string;
}

function QuickStatLine({ label, value }: QuickStatLineProps) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {resolveLabel(value)}
      </Typography>
    </Stack>
  );
}

interface InfoBlockProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

// Carte interne reutilisable pour garder un rendu homogène sur tous les groupes d'infos.
function InfoBlock({ icon, title, value }: InfoBlockProps) {
  return (
    <Box
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 2.5,
        border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.18)}`,
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
        {icon}
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </Stack>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {resolveLabel(value)}
      </Typography>
    </Box>
  );
}

export default MembreDetailView;
