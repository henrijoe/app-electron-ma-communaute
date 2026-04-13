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
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  ShortText as ShortTextIcon,
  Campaign as CampaignIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Business as BusinessIcon,
  Tag as TagIcon,
} from '@mui/icons-material';
import { DashboardContent } from 'src/layouts/dashboard';
import { apiClient } from 'src/utils/apiClient';
import { IDepartement } from '../../../../store/departementSlice';
import { getCompletetionPercentage, generateDepartementCode } from '../../utils';

// ----------------------------------------------------------------------

export default function DepartementDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [departement, setDepartement] = useState<IDepartement | null>(null);
  const listDepartement = useSelector((state: any) => state.departement.listDepartement);

  const fetchDepartementDetails = useCallback(async () => {
    if (!id) {
      setDepartement(null);
      return;
    }

    try {
      setLoading(true);
      const departementId = parseInt(id, 10);
      let departementFromStore = listDepartement.find((d: IDepartement) => d.idDepartement === departementId);

      if (!departementFromStore) {
        const response = await apiClient.getDepartements();
        if (response.status === 1 && Array.isArray(response.data)) {
          departementFromStore = response.data.find((d: IDepartement) => d.idDepartement === departementId);
        }
      }

      setDepartement(departementFromStore || null);
    } catch (error) {
      console.error('Erreur lors du chargement des détails du département :', error);
      setDepartement(null);
    } finally {
      setLoading(false);
    }
  }, [id, listDepartement]);

  useEffect(() => {
    fetchDepartementDetails();
  }, [fetchDepartementDetails]);

  const handleBack = () => {
    navigate('/departement');
  };

  // Le pourcentage aide à visualiser si la fiche est bien renseignée.
  const completionPercentage = departement ? getCompletetionPercentage(departement) : 0;

  const getCompletionColor = () => {
    if (completionPercentage >= 100) return 'success';
    if (completionPercentage >= 75) return 'info';
    if (completionPercentage >= 50) return 'warning';
    return 'error';
  };

  const getCompletionIcon = () => {
    if (completionPercentage >= 100) return <CheckCircleIcon color="success" />;
    if (completionPercentage >= 50) return <InfoIcon color="info" />;
    return <WarningIcon color="warning" />;
  };

  const departementCode = departement ? generateDepartementCode(departement) : '';

  if (loading) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={300} />
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

  if (!departement) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Box textAlign="center" py={10}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Département non trouvé
            </Typography>
            <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBack}>
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
        {/* En-tête avec bouton retour uniquement, sans action d'édition. */}
        <Box mb={3}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
            Retour à la liste
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
              height: 100,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
              position: 'relative',
            }}
          />

          <Box sx={{ position: 'relative', mx: 4, mt: -6, mb: 2 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.palette.primary.main,
                fontSize: 32,
                border: '4px solid white',
                boxShadow: theme.shadows[4],
              }}
            >
              {departement.libelleCourtDepartement?.charAt(0).toUpperCase() || 'D'}
            </Avatar>
          </Box>

          <Box sx={{ pt: 2, pb: 4, px: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                      {departement.libelleLongDepartement}
                    </Typography>
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      {departement.libelleCourtDepartement && (
                        <Chip label={departement.libelleCourtDepartement} color="primary" size="small" sx={{ mr: 1 }} />
                      )}
                      {departementCode && <Chip label={departementCode} variant="outlined" size="small" />}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {departement.sloganDepartement && (
                      <Chip
                        icon={<CampaignIcon />}
                        label={departement.sloganDepartement}
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                    <Chip
                      icon={getCompletionIcon()}
                      label={`${completionPercentage}% complet`}
                      color={getCompletionColor() as any}
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Résumé
                  </Typography>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography color="text.secondary">Responsable</Typography>
                      <Typography fontWeight="bold">{departement.responsableDepartement || 'Non défini'}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography color="text.secondary">Code</Typography>
                      <Typography fontWeight="bold">{departementCode || 'Non généré'}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography color="text.secondary">Complétion</Typography>
                      <Typography fontWeight="bold">{completionPercentage}%</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Informations détaillées
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <InfoItem icon={<DescriptionIcon />} label="Libellé complet" value={departement.libelleLongDepartement} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem icon={<ShortTextIcon />} label="Libellé court" value={departement.libelleCourtDepartement} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem icon={<CampaignIcon />} label="Slogan" value={departement.sloganDepartement || 'Non défini'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem icon={<PersonIcon />} label="Responsable" value={departement.responsableDepartement || 'Non défini'} />
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Informations système
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <InfoItem icon={<TagIcon />} label="ID département" value={departement.idDepartement?.toString() || 'Non défini'} />
                <InfoItem icon={<BusinessIcon />} label="ID utilisateur" value={departement.idUtilisateur?.toString() || 'Non défini'} />
                <InfoItem icon={<InfoIcon />} label="Code généré" value={departementCode || 'Non généré'} />
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </DashboardContent>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box display="flex" alignItems="flex-start" gap={2}>
      <Box sx={{ color: 'primary.main', mt: 0.5 }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="subtitle1" fontWeight="medium">
          {value || 'Non spécifié'}
        </Typography>
      </Box>
    </Box>
  );
}

