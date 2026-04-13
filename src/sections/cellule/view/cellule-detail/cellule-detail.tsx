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
  Groups as GroupsIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  TravelExplore as TravelExploreIcon,
  Hub as HubIcon,
  Tag as TagIcon,
} from '@mui/icons-material';

import { DashboardContent } from 'src/layouts/dashboard';
import { apiClient } from 'src/utils/apiClient';

import { ICellule } from '../../../../store/celluleSlice';

// ----------------------------------------------------------------------

export default function CelluleDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const listCellule = useSelector((state: any) => state.cellule.listCellule || []);

  const [loading, setLoading] = useState(false);
  const [cellule, setCellule] = useState<ICellule | null>(null);

  const fetchCelluleDetails = useCallback(async () => {
    if (!id) {
      setCellule(null);
      return;
    }

    try {
      setLoading(true);
      const celluleId = parseInt(id, 10);
      let celluleFromStore = listCellule.find((item: ICellule) => item.idCellule === celluleId);

      if (!celluleFromStore) {
        const response = await apiClient.getCellules();
        if (response.status === 1 && Array.isArray(response.data)) {
          celluleFromStore = response.data.find((item: ICellule) => item.idCellule === celluleId);
        }
      }

      setCellule(celluleFromStore || null);
    } catch (error) {
      console.error('Erreur lors du chargement des détails de la cellule :', error);
      setCellule(null);
    } finally {
      setLoading(false);
    }
  }, [id, listCellule]);

  useEffect(() => {
    fetchCelluleDetails();
  }, [fetchCelluleDetails]);

  const handleBack = useCallback(() => {
    navigate('/cellule');
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

  if (!cellule) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Box textAlign="center" py={10}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Cellule non trouvée
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
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
          }}
        >
          <Box
            sx={{
              height: 100,
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
              position: 'relative',
            }}
          />

          <Box sx={{ position: 'relative', mx: 4, mt: -6, mb: 2 }}>
            <Box display="flex" alignItems="flex-start">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: theme.palette.success.main,
                  fontSize: 32,
                  border: '4px solid white',
                  boxShadow: theme.shadows[4],
                }}
              >
                {cellule.nomCellule?.charAt(0).toUpperCase() || 'C'}
              </Avatar>
            </Box>
          </Box>

          <Box sx={{ pt: 2, pb: 4, px: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                      {cellule.nomCellule}
                    </Typography>
                    <Typography variant="h5" color="text.secondary">
                      Fiche détaillée de la cellule
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    <Chip icon={<GroupsIcon />} label={`${cellule.nombreMembreCellule || '0'} membres`} color="success" variant="outlined" />
                    <Chip icon={<LocationOnIcon />} label={cellule.lieuCellule || 'Lieu non défini'} color="info" variant="outlined" />
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
                      <Typography fontWeight="bold">{cellule.responsableCellule || 'Non défini'}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography color="text.secondary">Visites</Typography>
                      <Typography fontWeight="bold">{cellule.responsableVisiteCellule || 'Non défini'}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography color="text.secondary">Effectif</Typography>
                      <Typography fontWeight="bold">{cellule.nombreMembreCellule || '0'}</Typography>
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
                  <InfoItem icon={<HubIcon />} label="Nom de la cellule" value={cellule.nomCellule} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem icon={<LocationOnIcon />} label="Lieu" value={cellule.lieuCellule || 'Non défini'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem icon={<PersonIcon />} label="Responsable de cellule" value={cellule.responsableCellule || 'Non défini'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem icon={<TravelExploreIcon />} label="Responsable de visite" value={cellule.responsableVisiteCellule || 'Non défini'} />
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
                <InfoItem icon={<TagIcon />} label="ID cellule" value={cellule.idCellule?.toString() || 'Non défini'} />
                <InfoItem icon={<PersonIcon />} label="ID utilisateur" value={cellule.idUtilisateur?.toString() || 'Non défini'} />
                <InfoItem icon={<GroupsIcon />} label="Nombre de membres" value={cellule.nombreMembreCellule || '0'} />
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
      <Box sx={{ color: 'success.main', mt: 0.5 }}>{icon}</Box>
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
