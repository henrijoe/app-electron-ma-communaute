// src/sections/user/view/user-detail/user-detail.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  Grid,
  Stack,
  Avatar,
  Typography,
  Button,
  Chip,
  Divider,
  Container,
  Paper,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Church as ChurchIcon,
  Cake as CakeIcon,
  Flag as FlagIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  FamilyRestroom as FamilyIcon,
  WaterDrop as WaterIcon,
  AutoAwesome as AutoAwesomeIcon,
  CalendarToday as CalendarIcon,
  Groups as GroupsIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { DashboardContent } from 'src/layouts/dashboard';
import { buildPhotoUrl } from 'src/utils/apiClient';
import { IMembre, dataNiveauEtude, dataDepartement, dataCellule, dataGroupe, dataResponsabilite } from '../../../../store/membreSlice';

// ----------------------------------------------------------------------

export function MembreDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [membre, setMembre] = useState<IMembre | null>(null);
  const { listMembre } = useSelector((state: any) => state.membre);

  // Fonctions pour obtenir les labels avec des noms de paramètres différents
  const getNiveauEtudeLabel = (niveauId: number | null) => {
    if (!niveauId) return 'Non spécifié';
    const niveau = dataNiveauEtude.find((item: any) => item.value === niveauId);
    return niveau ? niveau.label : 'Non spécifié';
  };

  const getDepartementLabel = (departementId: number | null) => {
    if (!departementId) return 'Non spécifié';
    const dept = dataDepartement.find((item: any) => item.value === departementId);
    return dept ? dept.label : 'Non spécifié';
  };

  const getCelluleLabel = (celluleId: number | null) => {
    if (!celluleId) return 'Non spécifié';
    const cellule = dataCellule.find((item: any) => item.value === celluleId);
    return cellule ? cellule.label : 'Non spécifié';
  };

  const getGroupeLabel = (groupeId: number | null) => {
    if (!groupeId) return 'Non spécifié';
    const groupe = dataGroupe.find((item: any) => item.value === groupeId);
    return groupe ? groupe.label : 'Non spécifié';
  };

  const getResponsabiliteLabel = (responsabiliteId: number | null) => {
    if (!responsabiliteId) return 'Non spécifié';
    const resp = dataResponsabilite.find((item: any) => item.value === responsabiliteId);
    return resp ? resp.label : 'Non spécifié';
  };

  // Correction ESLint: arrow-body-style
  const getSexeLabel = (value: string) => 
    value === '1' ? 'Homme' : value === '2' ? 'Femme' : 'Non spécifié';

  const getSituationMatrimonialeLabel = (value: string) => {
    const situations: Record<string, string> = {
      '1': 'Célibataire',
      '2': 'Célibataire sans enfant',
      '3': 'Fiancé(e)',
      '4': 'Concubinage',
      '5': 'Marié(e)',
      '6': 'Divorcé(e)',
      '7': 'Veuve',
      '8': 'Veuf',
      '9': 'Copain/Copine',
      '10': 'Polygame',
    };
    return situations[value] || 'Non spécifié';
  };

  // Correction ESLint: arrow-body-style
  const getBaptemeLabel = (value: string) => 
    value === '1' ? 'Oui' : value === '2' ? 'Non' : 'Non spécifié';

  const getCiviliteLabel = (value: string) => {
    const civilites: Record<string, string> = {
      '1': 'Monsieur',
      '2': 'Madame',
      '3': 'Mademoiselle',
    };
    return civilites[value] || 'Non spécifié';
  };

  // Fonction pour charger les détails du membre depuis le store
  const fetchMembreDetails = useCallback(() => {
    if (!id) return;

    try {
      setLoading(true);
      // Chercher dans le store
      // Correction ESLint: radix parameter
      const memberId = parseInt(id, 10);
      const membreFromStore = listMembre.find((m: IMembre) => m.idMembre === memberId);
      
      if (membreFromStore) {
        setMembre(membreFromStore);
      } else {
        console.warn('Membre non trouvé dans le store');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  }, [id, listMembre]);

  useEffect(() => {
    fetchMembreDetails();
  }, [fetchMembreDetails]);

  const handleEdit = () => {
    if (membre) {
      navigate(`/details/edit/${id}`);
    }
  };

  const handleBack = () => {
    navigate('/user');
  };

  // Fonction pour obtenir l'URL de la photo
  const getPhotoUrl = (photoMembre: string) => {
    if (!photoMembre || photoMembre === '') {
      return null;
    }

    if (photoMembre.startsWith('data:image/') || photoMembre.startsWith('http')) {
      return photoMembre;
    }

    return buildPhotoUrl(photoMembre);
  };

  const photoUrl = membre ? getPhotoUrl(membre.photoMembre) : null;

  // Formatage des dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non spécifié';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={400} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </DashboardContent>
    );
  }

  if (!membre) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Box textAlign="center" py={10}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Membre non trouvé
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Retour à la liste
            </Button>
          </Box>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        {/* En-tête avec bouton retour */}
        <Box mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Retour à la liste
          </Button>
        </Box>

        {/* Carte principale du profil */}
        <Card
          sx={{
            mb: 4,
            overflow: 'hidden',
            position: 'relative',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          }}
        >
          {/* Bannière */}
          <Box
            sx={{
              height: 200,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: -80,
                left: 40,
              }}
            >
              <Avatar
                src={photoUrl || undefined}
                sx={{
                  width: 160,
                  height: 160,
                  border: '6px solid white',
                  boxShadow: theme.shadows[8],
                  bgcolor: theme.palette.primary.light,
                }}
              >
                {!photoUrl && (
                  <PersonIcon sx={{ fontSize: 80, color: 'white' }} />
                )}
              </Avatar>
            </Box>

            {/* Bouton d&apos;édition */}
            {/* <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                }}
              >
                Modifier le profil
              </Button>
            </Box> */}
          </Box>

          {/* Informations principales */}
          <Box sx={{ pt: 10, pb: 4, px: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {membre.nomMembre} {membre.prenomMembre}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {getCiviliteLabel(membre.civiliteMembre)}
                    </Typography>
                  </Box>

                  {/* Badges */}
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {membre.idResponsabilite && (
                      <Chip
                        icon={<AutoAwesomeIcon />}
                        label={getResponsabiliteLabel(membre.idResponsabilite)}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {membre.fonctionMembre && (
                      <Chip
                        icon={<WorkIcon />}
                        label={membre.fonctionMembre}
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                    {membre.baptemeEauMembre === '1' && (
                      <Chip
                        icon={<WaterIcon />}
                        label="Baptisé(e) d&apos;eau"
                        color="success"
                        variant="outlined"
                      />
                    )}
                    {membre.baptemeSaintEspritMembre === '1' && (
                      <Chip
                        icon={<AutoAwesomeIcon />}
                        label="Baptisé(e) du Saint-Esprit"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Stack>
              </Grid>

              {/* Contacts */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Contact
                  </Typography>
                  <Stack spacing={2}>
                    {membre.contactMembre && (
                      <Box display="flex" alignItems="center" gap={2}>
                        <PhoneIcon color="primary" />
                        <Typography>{membre.contactMembre}</Typography>
                      </Box>
                    )}
                    {membre.emailMembre && (
                      <Box display="flex" alignItems="center" gap={2}>
                        <EmailIcon color="primary" />
                        <Typography>{membre.emailMembre}</Typography>
                      </Box>
                    )}
                    {membre.residenceMembre && (
                      <Box display="flex" alignItems="center" gap={2}>
                        <LocationIcon color="primary" />
                        <Typography>{membre.residenceMembre}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Grille d&apos;informations détaillées */}
        <Grid container spacing={3}>
          {/* Colonne gauche */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Informations personnelles */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  Informations personnelles
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<CakeIcon />}
                      label="Date de naissance"
                      value={formatDate(membre.dateNaissMembre)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<LocationIcon />}
                      label="Lieu de naissance"
                      value={membre.lieuNaissMembre}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<FlagIcon />}
                      label="Nationalité"
                      value={membre.nationaliteMembre}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<FlagIcon />}
                      label="Ethnie"
                      value={membre.ethnieMembre}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <InfoItem
                      icon={<SchoolIcon />}
                      label="Niveau d&apos;étude"
                      value={getNiveauEtudeLabel(membre.idNiveauEtude)}
                    />
                  </Grid>
                </Grid>
              </Card>

              {/* Situation familiale */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FamilyIcon color="primary" />
                  Situation familiale
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<FavoriteIcon />}
                      label="Situation matrimoniale"
                      value={getSituationMatrimonialeLabel(membre.situationMatrimonialeMembre)}
                    />
                  </Grid>
                  {membre.situationMatrimonialeMembre === '3' && membre.nomFiance && (
                    <Grid item xs={12} sm={6}>
                      <InfoItem
                        icon={<PersonIcon />}
                        label="Nom du fiancé(e)"
                        value={membre.nomFiance}
                      />
                    </Grid>
                  )}
                  {membre.situationMatrimonialeMembre === '5' && membre.dateMariageMembre && (
                    <Grid item xs={12}>
                      <InfoItem
                        icon={<CalendarIcon />}
                        label="Date de mariage"
                        value={formatDate(membre.dateMariageMembre)}
                      />
                    </Grid>
                  )}
                </Grid>
              </Card>

              {/* Vie professionnelle */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon color="primary" />
                  Vie professionnelle
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<WorkIcon />}
                      label="Fonction"
                      value={membre.fonctionMembre}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<LocationIcon />}
                      label="Lieu de travail"
                      value={membre.lieuTravailMembre}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Stack>
          </Grid>

          {/* Colonne droite */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Vie spirituelle */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ChurchIcon color="primary" />
                  Vie spirituelle
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <InfoItem
                    icon={<ChurchIcon />}
                    label="Église d&apos;origine"
                    value={membre.egliseOrigineMembre}
                  />
                  <InfoItem
                    icon={<CalendarIcon />}
                    label="Date de conversion"
                    value={formatDate(membre.dateConversionMembre)}
                  />
                  <InfoItem
                    icon={<WaterIcon />}
                    label="Baptême d&apos;eau"
                    value={getBaptemeLabel(membre.baptemeEauMembre)}
                  />
                  {membre.baptemeEauMembre === '1' && (
                    <>
                      <InfoItem
                        icon={<CalendarIcon />}
                        label="Date du baptême d&apos;eau"
                        value={formatDate(membre.dateBaptemeMembre)}
                      />
                      <InfoItem
                        icon={<LocationIcon />}
                        label="Lieu du baptême"
                        value={membre.lieuBaptemeEauMembre}
                      />
                    </>
                  )}
                  <InfoItem
                    icon={<AutoAwesomeIcon />}
                    label="Baptême du Saint-Esprit"
                    value={getBaptemeLabel(membre.baptemeSaintEspritMembre)}
                  />
                  {membre.baptemeSaintEspritMembre === '1' && (
                    <InfoItem
                      icon={<CalendarIcon />}
                      label="Date du baptême du Saint-Esprit"
                      value={formatDate(membre.dateBaptemeSaintEspritMembre)}
                    />
                  )}
                </Stack>
              </Card>

              {/* Engagement dans l&apos;église */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupsIcon color="primary" />
                  Engagement dans l&apos;église
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <InfoItem
                    icon={<CategoryIcon />}
                    label="Département/Comité"
                    value={getDepartementLabel(membre.idDepartement)}
                  />
                  <InfoItem
                    icon={<GroupsIcon />}
                    label="Cellule"
                    value={getCelluleLabel(membre.idCellule)}
                  />
                  <InfoItem
                    icon={<GroupsIcon />}
                    label="Groupe ethnique"
                    value={getGroupeLabel(membre.idGroupe)}
                  />
                  {membre.nouvelleAmeMembre === '1' && (
                    <>
                      <InfoItem
                        icon={<PersonIcon />}
                        label="Nouvelle âme"
                        value="Oui"
                      />
                      <InfoItem
                        icon={<PersonIcon />}
                        label="Connaissance à l&apos;église"
                        value={membre.nomAmiEglise}
                      />
                      <InfoItem
                        icon={<CalendarIcon />}
                        label="Date de décision"
                        value={formatDate(membre.dateDecisionMembre)}
                      />
                    </>
                  )}
                </Stack>
              </Card>

              {/* Capacité spirituelle */}
              {membre.capaciteSpirituelleMembre && (
                <Card sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                  <Typography variant="h6" gutterBottom>
                    Capacité spirituelle
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {membre.capaciteSpirituelleMembre === '1' && 'Bonne'}
                    {membre.capaciteSpirituelleMembre === '2' && 'Moyenne'}
                    {membre.capaciteSpirituelleMembre === '3' && 'Nouvellement convertie'}
                  </Typography>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </DashboardContent>
  );
}

// Composant pour afficher un élément d&apos;information
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <Box>
    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
      {icon}
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
    </Box>
    <Typography variant="body1">
      {value || 'Non spécifié'}
    </Typography>
  </Box>
);

export default MembreDetailView;
