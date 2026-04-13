import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  Box,
  Card,
  Grid,
  Stack,
  Chip,
  Button,
  Divider,
  Avatar,
  Container,
  Typography,
  Paper,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Diversity3 as Diversity3Icon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Tag as TagIcon,
} from '@mui/icons-material';

import { DashboardContent } from 'src/layouts/dashboard';
import { apiClient } from 'src/utils/apiClient';

import { IGroupe } from '../../../../store/groupeSlice';

// ----------------------------------------------------------------------

export default function GroupeDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const listGroupe = useSelector((state: any) => state.groupe.listGroupe || []);

  const [loading, setLoading] = useState(false);
  const [groupe, setGroupe] = useState<IGroupe | null>(null);

  const fetchGroupeDetails = useCallback(async () => {
    if (!id) {
      setGroupe(null);
      return;
    }

    try {
      setLoading(true);
      const groupeId = parseInt(id, 10);
      let groupeFromStore = listGroupe.find((item: IGroupe) => item.idGroupe === groupeId);

      if (!groupeFromStore) {
        const response = await apiClient.getGroupes();
        if (response.status === 1 && Array.isArray(response.data)) {
          groupeFromStore = response.data.find((item: IGroupe) => item.idGroupe === groupeId);
        }
      }

      setGroupe(groupeFromStore || null);
    } catch (error) {
      console.error('Erreur lors du chargement des détails du groupe :', error);
      setGroupe(null);
    } finally {
      setLoading(false);
    }
  }, [id, listGroupe]);

  useEffect(() => {
    fetchGroupeDetails();
  }, [fetchGroupeDetails]);

  const handleBack = useCallback(() => {
    navigate('/groupe');
  }, [navigate]);

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

  if (!groupe) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Box textAlign="center" py={10}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Groupe non trouvé
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
        {/* En-tête harmonisé avec les autres fiches détail. */}
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
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
          }}
        >
          <Box
            sx={{
              height: 100,
              background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
              position: 'relative',
            }}
          />

          <Box sx={{ position: 'relative', mx: 4, mt: -6, mb: 2 }}>
            <Box display="flex" alignItems="flex-start">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: theme.palette.error.main,
                  fontSize: 32,
                  border: '4px solid white',
                  boxShadow: theme.shadows[4],
                }}
              >
                {groupe.libelleGroupe?.charAt(0).toUpperCase() || 'G'}
              </Avatar>
            </Box>
          </Box>

          <Box sx={{ pt: 2, pb: 4, px: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                      {groupe.libelleGroupe}
                    </Typography>
                    <Typography variant="h5" color="text.secondary">
                      Fiche détaillée du groupe
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    <Chip icon={<PersonIcon />} label={groupe.responsableGroupe || 'Sans responsable'} color="error" variant="outlined" />
                    <Chip icon={<Diversity3Icon />} label="Groupe communautaire" color="warning" variant="outlined" />
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
                      <Typography fontWeight="bold">{groupe.responsableGroupe || 'Non défini'}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography color="text.secondary">Description</Typography>
                      <Typography fontWeight="bold">{groupe.descriptionGroupe ? 'Renseignée' : 'Non définie'}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography color="text.secondary">Identifiant</Typography>
                      <Typography fontWeight="bold">#{groupe.idGroupe || '0'}</Typography>
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
                  <InfoItem icon={<Diversity3Icon />} label="Libellé du groupe" value={groupe.libelleGroupe} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem icon={<PersonIcon />} label="Responsable" value={groupe.responsableGroupe || 'Non défini'} />
                </Grid>
                <Grid item xs={12}>
                  <InfoItem icon={<DescriptionIcon />} label="Description" value={groupe.descriptionGroupe || 'Non définie'} />
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
                <InfoItem icon={<TagIcon />} label="ID groupe" value={groupe.idGroupe?.toString() || 'Non défini'} />
                <InfoItem icon={<PersonIcon />} label="ID utilisateur" value={groupe.idUtilisateur?.toString() || 'Non défini'} />
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
      <Box sx={{ color: 'error.main', mt: 0.5 }}>{icon}</Box>
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
