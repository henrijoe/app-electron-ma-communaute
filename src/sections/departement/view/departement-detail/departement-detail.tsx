// src/sections/departement/view/departement-detail/departement-detail.tsx
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
  Edit as EditIcon,
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

export function DepartementDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [departement, setDepartement] = useState<IDepartement | null>(null);
  const listDepartement = useSelector((state: any) => state.departement.listDepartement);

  // Fonction pour charger les dÃ©tails du dÃ©partement depuis le store
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
      console.error('Erreur lors du chargement des details:', error);
      setDepartement(null);
    } finally {
      setLoading(false);
    }
  }, [id, listDepartement]);

  useEffect(() => {
    fetchDepartementDetails();
  }, [fetchDepartementDetails]);

  const handleEdit = () => {
    if (departement) {
      navigate(`/detaildepartement/edit/${id}`);
    }
  };

  const handleBack = () => {
    navigate('/departement');
  };

  // Calculer le pourcentage de complÃ©tion
  const completionPercentage = departement ? getCompletetionPercentage(departement) : 0;

  // Obtenir la couleur en fonction du pourcentage de complÃ©tion
  const getCompletionColor = () => {
    if (completionPercentage >= 100) return 'success';
    if (completionPercentage >= 75) return 'info';
    if (completionPercentage >= 50) return 'warning';
    return 'error';
  };

  // Obtenir l'icÃ´ne en fonction du pourcentage de complÃ©tion
  const getCompletionIcon = () => {
    if (completionPercentage >= 100) return <CheckCircleIcon color="success" />;
    if (completionPercentage >= 50) return <InfoIcon color="info" />;
    return <WarningIcon color="warning" />;
  };

  // GÃ©nÃ©rer le code du dÃ©partement
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
              Departement non trouvé
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
        {/* En-tÃªte avec bouton retour */}
        <Box mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Retour   la liste
          </Button>
        </Box>

        {/* Carte principale du dÃ©partement */}
        <Card
          sx={{
            mb: 4,
            overflow: 'hidden',
            position: 'relative',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          }}
        >
          {/* BanniÃ¨re */}
          <Box
            sx={{
              height: 100,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
              position: 'relative',
            }}
          />

          {/* Avatar et bouton d'Ã©dition */}
          <Box sx={{ position: 'relative', mx: 4, mt: -6, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
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
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  mt: 2,
                }}
              >
                Modifier
              </Button>
            </Box>
          </Box>

          {/* Informations principales */}
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
                        <Chip
                          label={departement.libelleCourtDepartement}
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      )}
                      {departementCode && (
                        <Chip
                          label={departementCode}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Typography>
                  </Box>

                  {/* Badges */}
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
                      color={getCompletionColor()}
                      variant="outlined"
                    />
                    {departement.responsableDepartement && (
                      <Chip
                        icon={<PersonIcon />}
                        label={`Responsable: ${departement.responsableDepartement}`}
                        color="info"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Stack>
              </Grid>      
            </Grid>
          </Box>
        </Card>

        {/* Grille d'informations dÃ©taillÃ©es */}
        <Grid container spacing={3}>
          {/* Colonne gauche - Informations principales */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Informations dÃ©taillÃ©es */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon color="primary" />
                  Informations detaillées
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={<DescriptionIcon />}
                      label="LibellÃ© complet"
                      value={departement.libelleLongDepartement}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={<ShortTextIcon />}
                      label="LibellÃ© court"
                      value={departement.libelleCourtDepartement}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={<CampaignIcon />}
                      label="Slogan"
                      value={departement.sloganDepartement || 'Non dÃ©fini'}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={<PersonIcon />}
                      label="Responsable"
                      value={departement.responsableDepartement || 'Non dÃ©fini'}
                    />
                  </Grid>
                </Grid>
              </Card>

              {/* Description */}
              {departement.sloganDepartement && (
                <Card sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CampaignIcon color="primary" />
                    Slogan et vision
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.8,
                      fontStyle: 'italic',
                      textAlign: 'center',
                      py: 2,
                    }}
                  >
                    {/* {departement.sloganDepartement} */}
                    &quot;{departement.sloganDepartement}&quot;
                  </Typography>
                </Card>
              )}
            </Stack>
          </Grid>

          {/* Colonne droite - Informations complÃ©mentaires */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Informations systÃ¨me */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon color="primary" />
                  Informations système
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <InfoItem
                    icon={<TagIcon />}
                    label="ID DÃ©partement"
                    value={departement.idDepartement?.toString() || 'Non dÃ©fini'}
                  />
                  <InfoItem
                    icon={<PersonIcon />}
                    label="ID Utilisateur"
                    value={departement.idUtilisateur?.toString() || 'Non dÃ©fini'}
                  />
                  <InfoItem
                    icon={<ShortTextIcon />}
                    label="Code unique"
                    value={departementCode || 'Non gÃ©nÃ©rÃ©'}
                  />
                </Stack>
              </Card>

              {/* Actions rapides */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Actions rapides
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    fullWidth
                  >
                    Modifier le departement
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(departement, null, 2))}
                    fullWidth
                  >
                    Copier les informations
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    fullWidth
                  >
                    Retour 
                  </Button>
                </Stack>
              </Card>

              {/* Statistiques */}
              <Card sx={{ p: 3, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Typography variant="h6" gutterBottom>
                  Statistiques
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Champs requis</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      2/2 âœ“
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Champs optionnels</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {[departement.sloganDepartement, departement.responsableDepartement].filter(Boolean).length}/2
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">ComplÃ©tion</Typography>
                    <Typography variant="body2" fontWeight="bold" color={getCompletionColor()}>
                      {completionPercentage}%
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </DashboardContent>
  );
}

// Composant pour afficher un Ã©lÃ©ment d'information
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
      {value || 'Non spÃ©cifiÃ©'}
    </Typography>
  </Box>
);

// Composant pour afficher un indicateur
interface InfoIndicatorProps {
  label: string;
  completed: boolean;
  optional?: boolean;
}

const InfoIndicator: React.FC<InfoIndicatorProps> = ({ label, completed, optional = false }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between" py={0.5}>
    <Box display="flex" alignItems="center" gap={1}>
      {completed ? (
        <CheckCircleIcon color="success" fontSize="small" />
      ) : (
        <WarningIcon color={optional ? "disabled" : "warning"} fontSize="small" />
      )}
      <Typography variant="body2">
        {label}
        {optional && ' (optionnel)'}
      </Typography>
    </Box>
    <Typography
      variant="body2"
      color={completed ? "success.main" : optional ? "text.disabled" : "warning.main"}
      fontWeight={completed ? "bold" : "normal"}
    >
      {completed ? 'âœ“' : optional ? 'â—‹' : 'âœ—'}
    </Typography>
  </Box>
);

export default DepartementDetailView;
