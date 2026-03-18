// src/sections/culte/view/culte-detail/culte-detail.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  Grid,
  Stack,
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
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Groups as GroupsIcon,
  MenuBook as MenuBookIcon,
  AccountCircle as AccountCircleIcon,
  AttachMoney as AttachMoneyIcon,
  Notes as NotesIcon,
  Category as CategoryIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Church as ChurchIcon,
} from '@mui/icons-material';
import { DashboardContent } from 'src/layouts/dashboard';
import { ICulte, typeCulteOptions } from '../../../../store/culteSlice';

// ----------------------------------------------------------------------

export function CulteDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [culte, setCulte] = useState<ICulte | null>(null);
  const { listCulte } = useSelector((state: any) => state.culte);

  // Fonction pour obtenir le label du type de culte
  const getTypeCulteLabel = (typeId: string) => {
    if (!typeId) return 'Non spécifié';
    const type = typeCulteOptions.find((item) => item.value.toString() === typeId);
    return type ? type.label : 'Non spécifié';
  };

  // Fonction pour charger les détails du culte depuis le store
  const fetchCulteDetails = useCallback(() => {
    if (!id) return;

    try {
      setLoading(true);
      const culteId = parseInt(id, 10);
      const culteFromStore = listCulte.find((c: ICulte) => c.idCulte === culteId);
      
      if (culteFromStore) {
        setCulte(culteFromStore);
      } else {
        console.warn('Culte non trouvé dans le store');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  }, [id, listCulte]);

  useEffect(() => {
    fetchCulteDetails();
  }, [fetchCulteDetails]);

  const handleEdit = () => {
    if (culte) {
      navigate(`/detailcultes/edit/${id}`);
    }
  };

  const handleBack = () => {
    navigate('/culte');
  };

  // Formatage des dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non spécifié';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Calculer le total des participants
  const getTotalParticipants = () => {
    if (!culte) return 0;
    const hommes = parseInt(culte.nombreHommeCulte, 10) || 0;
    const femmes = parseInt(culte.nombreFemmeCulte, 10) || 0;
    return hommes + femmes;
  };

  // Calculer le total des offrandes
  const getTotalOffrandes = () => {
    if (!culte) return 0;
    const offrandeCulte = parseInt(culte.offrandeCulte, 10) || 0;
    const offrandeEcodim = parseInt(culte.offrandeEcodim, 10) || 0;
    return offrandeCulte + offrandeEcodim;
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

  if (!culte) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Box textAlign="center" py={10}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Culte non trouvé
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

        {/* Carte principale du culte */}
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
              height: 120,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              position: 'relative',
            }}
          >
            {/* Bouton d'édition */}
            {/* <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                Modifier
              </Button>
            </Box> */}
          </Box>

          {/* Informations principales */}
          <Box sx={{ pt: 4, pb: 4, px: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {getTypeCulteLabel(culte.typeCulte)}
                    </Typography>
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      {culte.themePredication || 'Sans thème spécifique'}
                    </Typography>
                  </Box>

                  {/* Badges */}
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    <Chip
                      icon={<CalendarIcon />}
                      label={formatDate(culte.dateCulte)}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<GroupsIcon />}
                      label={`${getTotalParticipants()} participants`}
                      color="secondary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<AttachMoneyIcon />}
                      label={`${getTotalOffrandes().toLocaleString()} FCFA`}
                      color="success"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </Grid>

              {/* Statistiques rapides */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Statistiques
                  </Typography>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={1}>
                        <MaleIcon color="primary" />
                        <Typography variant="body2">Hommes</Typography>
                      </Box>
                      <Typography fontWeight="bold">
                        {culte.nombreHommeCulte || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={1}>
                        <FemaleIcon color="primary" />
                        <Typography variant="body2">Femmes</Typography>
                      </Box>
                      <Typography fontWeight="bold">
                        {culte.nombreFemmeCulte || 0}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle1">Total</Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {getTotalParticipants()}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Grille d'informations détaillées */}
        <Grid container spacing={3}>
          {/* Colonne gauche */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Informations sur la prédication */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MenuBookIcon color="primary" />
                  Détails de la prédication
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <InfoItem
                      icon={<AccountCircleIcon />}
                      label="Dirigeant"
                      value={culte.dirigeant || 'Non spécifié'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <InfoItem
                      icon={<MenuBookIcon />}
                      label="Prédicateur"
                      value={culte.predication || 'Non spécifié'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <InfoItem
                      icon={<MenuBookIcon />}
                      label="Passage biblique"
                      value={culte.passageBiblique || 'Non spécifié'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <InfoItem
                      icon={<CategoryIcon />}
                      label="Thème de la prédication"
                      value={culte.themePredication || 'Non spécifié'}
                    />
                  </Grid>
                </Grid>
              </Card>

              {/* Résumé de la prédication */}
              {culte.resumePredication && (
                <Card sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotesIcon color="primary" />
                    Résumé de la prédication
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {culte.resumePredication}
                  </Typography>
                </Card>
              )}
            </Stack>
          </Grid>

          {/* Colonne droite */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Offrandes et dons */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon color="primary" />
                  Offrandes et dons
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body1">Offrande du culte</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {culte.offrandeCulte ? `${culte.offrandeCulte} FCFA` : '0 FCFA'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body1">Offrande ECODIM</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {culte.offrandeEcodim ? `${culte.offrandeEcodim} FCFA` : '0 FCFA'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {getTotalOffrandes().toLocaleString()} FCFA
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              {/* Informations ECODIM */}
              {(culte.ecodim || culte.filleEcodim) && (
                <Card sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChurchIcon color="primary" />
                    Informations ECODIM
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={2}>
                    {culte.ecodim && (
                      <InfoItem
                        icon={<ChurchIcon />}
                        label="ECODIM"
                        value={culte.ecodim}
                      />
                    )}
                    {culte.filleEcodim && (
                      <InfoItem
                        icon={<ChurchIcon />}
                        label="Fille ECODIM"
                        value={culte.filleEcodim}
                      />
                    )}
                  </Stack>
                </Card>
              )}

              {/* Informations supplémentaires */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Informations complémentaires
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    ID: {culte.idCulte}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Créé par: Utilisateur #{culte.idUtilisateur}
                  </Typography>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </DashboardContent>
  );
}

// Composant pour afficher un élément d'information
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

export default CulteDetailView;