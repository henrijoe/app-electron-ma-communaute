import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  AccountCircle as AccountCircleIcon,
  ArrowBack as ArrowBackIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Church as ChurchIcon,
  Female as FemaleIcon,
  Groups as GroupsIcon,
  Male as MaleIcon,
  MenuBook as MenuBookIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { ICulte, typeCulteOptions } from '../../../../store/culteSlice';

// Affiche une ligne simple d'information dans les cartes detail.
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
    <Typography variant="body1">{value || 'Non specifie'}</Typography>
  </Box>
);

export function CulteDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { listCulte } = useSelector((state: any) => state.culte);

  const [loading, setLoading] = useState(false);
  const [culte, setCulte] = useState<ICulte | null>(null);

  const getTypeCulteLabel = (typeId: string) => {
    if (!typeId) return 'Non specifie';
    const type = typeCulteOptions.find((item) => item.value.toString() === typeId);
    return type ? type.label : 'Non specifie';
  };

  // Charge les details directement depuis le store pour rester coherent avec les autres ecrans.
  const fetchCulteDetails = useCallback(() => {
    if (!id) return;

    try {
      setLoading(true);
      const culteId = parseInt(id, 10);
      const culteFromStore = listCulte.find((item: ICulte) => item.idCulte === culteId);
      setCulte(culteFromStore || null);
    } catch (error) {
      console.error('Erreur lors du chargement des details du culte :', error);
      setCulte(null);
    } finally {
      setLoading(false);
    }
  }, [id, listCulte]);

  useEffect(() => {
    fetchCulteDetails();
  }, [fetchCulteDetails]);

  const handleBack = useCallback(() => {
    navigate('/culte');
  }, [navigate]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non specifie';

    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (_error) {
      return 'Date invalide';
    }
  };

  const getTotalParticipants = () => {
    if (!culte) return 0;
    const hommes = parseInt(culte.nombreHommeCulte, 10) || 0;
    const femmes = parseInt(culte.nombreFemmeCulte, 10) || 0;
    return hommes + femmes;
  };

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
            <Skeleton variant="rectangular" height={320} />
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
              Culte non trouve
            </Typography>
            <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBack}>
              Retour a la liste
            </Button>
          </Box>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        {/* En-tete detail sans action de modification. */}
        <Box mb={3}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
            Retour a la liste
          </Button>
        </Box>

        <Card
          sx={{
            mb: 4,
            overflow: 'hidden',
            position: 'relative',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          }}
        >
          <Box
            sx={{
              height: 120,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              position: 'relative',
            }}
          />

          <Box sx={{ pt: 4, pb: 4, px: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {getTypeCulteLabel(culte.typeCulte)}
                    </Typography>
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      {culte.themePredication || 'Sans theme specifique'}
                    </Typography>
                  </Box>

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

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Statistiques
                  </Typography>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography color="text.secondary">Hommes</Typography>
                      <Typography fontWeight="bold">{culte.nombreHommeCulte || '0'}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography color="text.secondary">Femmes</Typography>
                      <Typography fontWeight="bold">{culte.nombreFemmeCulte || '0'}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography color="text.secondary">Total</Typography>
                      <Typography fontWeight="bold">{getTotalParticipants()}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Grille principale des informations du culte. */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MenuBookIcon color="primary" />
                  Details de la predication
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<AccountCircleIcon />} label="Dirigeant" value={culte.dirigeant || 'Non specifie'} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<CategoryIcon />} label="Type de culte" value={getTypeCulteLabel(culte.typeCulte)} />
                  </Grid>
                  <Grid item xs={12}>
                    <InfoItem icon={<MenuBookIcon />} label="Predicateur" value={culte.predication || 'Non specifie'} />
                  </Grid>
                  <Grid item xs={12}>
                    <InfoItem icon={<ChurchIcon />} label="Passage biblique" value={culte.passageBiblique || 'Non specifie'} />
                  </Grid>
                  <Grid item xs={12}>
                    <InfoItem icon={<NotesIcon />} label="Theme" value={culte.themePredication || 'Non specifie'} />
                  </Grid>
                </Grid>
              </Card>

              {culte.resumePredication && (
                <Card sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotesIcon color="primary" />
                    Resume de la predication
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {culte.resumePredication}
                  </Typography>
                </Card>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
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

              <Card sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                <Typography variant="h6" gutterBottom>
                  Participation
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={2}>
                  <InfoItem icon={<MaleIcon />} label="Hommes" value={culte.nombreHommeCulte || '0'} />
                  <InfoItem icon={<FemaleIcon />} label="Femmes" value={culte.nombreFemmeCulte || '0'} />
                </Stack>
              </Card>

              {(culte.ecodim || culte.filleEcodim) && (
                <Card sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                  <Typography variant="h6" gutterBottom>
                    Informations ECODIM
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={2}>
                    {culte.ecodim && <InfoItem icon={<ChurchIcon />} label="ECODIM" value={culte.ecodim} />}
                    {culte.filleEcodim && <InfoItem icon={<ChurchIcon />} label="Fille ECODIM" value={culte.filleEcodim} />}
                  </Stack>
                </Card>
              )}

              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Informations complementaires
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    ID: {culte.idCulte}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cree par : Utilisateur #{culte.idUtilisateur}
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

export default CulteDetailView;
